import connectDB from "@/config/database";
import Property from "@/models/Property";
import MarketingEvent from "@/models/MarketingEvent";
import Employee from "@/models/Employee";
import { getSessionUser } from "@/utils/getSessionUser";
import { buildPropertyAccessFilter, canEnterAdvertisingCabinet, canManageProperty, combineMongoFilters } from "@/utils/crm/accessControl";
import { Types } from "mongoose";

void Employee;

function cleanString(value) {
   return String(value || "").trim();
}

function objectIdOrNull(value) {
   const v = cleanString(value);
   return Types.ObjectId.isValid(v) ? new Types.ObjectId(v) : null;
}

function parseNumber(value) {
   if (value === undefined || value === null || value === "") return null;
   const n = Number(value);
   return Number.isFinite(n) ? n : null;
}

function normalizePriority(value) {
   const n = Number(value);
   if (!Number.isFinite(n)) return 3;
   return Math.min(Math.max(Math.round(n), 1), 5);
}

function normalizeCurrency(value) {
   return ["USD", "UAH", "EUR"].includes(value) ? value : "USD";
}

function normalizeAdvertisingStatus(value) {
   return ["active", "paused", "lead_pull", "done", "archive", "none"].includes(value) ? value : "active";
}

function propertyLabel(property) {
   const isRent = property?.type_deal === "оренда" || (Boolean(property?.statusRent) && property.statusRent !== "rentNo");
   if (isRent && property?.rentOptions?.rentTitle) return property.rentOptions.rentTitle;
   return property?.title || property?.rentOptions?.rentTitle || property?.location_text || "Об’єкт";
}

function serializeProperty(property, summary = {}) {
   const activeLinks = (property.advertisingLinks || []).filter((link) => !link.closedAt && link.status !== "archived");
   return {
      ...property,
      _id: property._id?.toString?.() || String(property._id || ""),
      displayTitle: propertyLabel(property),
      advertisingCounters: {
         events: summary.events || 0,
         scanners: summary.scanners || 0,
         financialPromotions: summary.financialPromotions || 0,
         deactivated: summary.deactivated || 0,
         costUah: summary.costUah || 0,
         lastActionAt: summary.lastActionAt || null,
         links: (property.advertisingLinks || []).length,
         activeLinks: activeLinks.length,
         texts: (property.advertisingTexts || []).length,
         videos: (property.propertyVideos || []).length,
      },
   };
}

export const GET = async (req) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser();
      if (!sessionUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
      if (!canEnterAdvertisingCabinet(sessionUser)) return Response.json({ error: "Forbidden" }, { status: 403 });

      const sp = req.nextUrl.searchParams;
      const pageSize = Math.min(Math.max(parseInt(sp.get("pageSize") || "40", 10), 1), 120);
      const q = cleanString(sp.get("q"));
      const employeeId = objectIdOrNull(sp.get("employee"));
      const status = cleanString(sp.get("status"));
      const onlyAssigned = sp.get("onlyAssigned") === "true";

      const filter = {
         $and: [
            {
               $or: [
                  { actualityGroup: { $ne: "inactive" } },
                  { "advertisingSettings.status": { $in: ["active", "paused", "lead_pull", "done"] } },
               ],
            },
         ],
         $or: [
            { crmStage: { $in: ["rs", "ds", "zs"] } },
            { crmStage: { $exists: false } },
            { crmStage: "" },
         ],
      };

      if (employeeId) filter["advertisingSettings.assignedEmployee"] = employeeId;
      if (onlyAssigned) filter["advertisingSettings.assignedEmployee"] = { $exists: true, $ne: null };
      if (status && status !== "all") filter["advertisingSettings.status"] = status;

      if (q) {
         const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
         filter.$and = [
            ...(filter.$and || []),
            ...(filter.$or ? [{ $or: filter.$or }] : []),
            {
               $or: [
                  { title: { $regex: safeQ, $options: "i" } },
                  { "rentOptions.rentTitle": { $regex: safeQ, $options: "i" } },
                  { location_text: { $regex: safeQ, $options: "i" } },
                  { "advertisingSettings.draftText": { $regex: safeQ, $options: "i" } },
                  { "advertisingSettings.note": { $regex: safeQ, $options: "i" } },
               ],
            },
         ];
         delete filter.$or;
      }

      const accessFilter = await buildPropertyAccessFilter(sessionUser);
      const scopedFilter = combineMongoFilters(filter, accessFilter);

      const rows = await Property.find(scopedFilter)
         .select("title rentOptions.rentTitle rentOptions.price rentOptions.currency rentOptions.rentStory.note location_text location type_deal type_estate statusRent cost currency rooms square_tot square_area square_liv square_kit area_unit floor floors type_building type_walls type_house purpose_area height_wall balconies heating type_heating actualityGroup actualityStatus actualityNote images assignee advertisingSettings advertisingTexts advertisingLinks propertyVideos updatedAt")
         .populate("assignee", "name fullName surname avatarUrl color")
         .populate("advertisingSettings.assignedEmployee", "name fullName surname avatarUrl color role")
         .sort({ "advertisingSettings.priority": -1, updatedAt: -1 })
         .limit(pageSize)
         .lean();

      const propertyIds = rows.map((item) => item._id).filter(Boolean);
      const isMarketingUser = !sessionUser?.isFallbackAdmin && (sessionUser?.role || sessionUser?.user?.role || "") === "marketing";
      const actorEmployeeId = objectIdOrNull(sessionUser?.employeeId);
      const eventSummaryMatch = {
         property: { $in: propertyIds },
         ...(isMarketingUser && actorEmployeeId
            ? {
               $or: [
                  { responsibleEmployee: actorEmployeeId },
                  { createdByEmployee: actorEmployeeId },
               ],
            }
            : {}),
      };
      const summaryRows = propertyIds.length
         ? await MarketingEvent.aggregate([
             { $match: eventSummaryMatch },
            {
               $group: {
                  _id: "$property",
                  events: { $sum: 1 },
                  scanners: { $sum: { $cond: [{ $eq: ["$actionType", "scanner"] }, 1, 0] } },
                  financialPromotions: { $sum: { $cond: [{ $eq: ["$actionType", "financial_promotion"] }, 1, 0] } },
                  deactivated: { $sum: { $cond: [{ $eq: ["$actionType", "deactivated"] }, 1, 0] } },
                  costUah: { $sum: { $ifNull: ["$costUah", 0] } },
                  lastActionAt: { $max: "$occurredAt" },
               },
            },
         ])
         : [];
      const summaryByProperty = new Map(summaryRows.map((row) => [String(row._id), row]));

      return Response.json({
         items: rows.map((item) => serializeProperty(item, summaryByProperty.get(String(item._id)))),
      });
   } catch (error) {
      console.error(error);
      return new Response("Error fetching advertising properties", { status: 500 });
   }
};

export const PATCH = async (req) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser();
      if (!sessionUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
      if (!canEnterAdvertisingCabinet(sessionUser)) return Response.json({ error: "Forbidden" }, { status: 403 });

      const body = await req.json();
      const propertyId = objectIdOrNull(body.property || body.propertyId);
      if (!propertyId) return Response.json({ error: "Оберіть об’єкт" }, { status: 400 });

      const property = await Property.findById(propertyId);
      if (!property) return Response.json({ error: "Об’єкт не знайдено" }, { status: 404 });

      const allowed = await canManageProperty(sessionUser, property);
      if (!allowed) return Response.json({ error: "Немає доступу до рекламних параметрів цього об’єкта" }, { status: 403 });

      property.advertisingSettings = {
         ...(property.advertisingSettings?.toObject?.() || property.advertisingSettings || {}),
         assignedEmployee: objectIdOrNull(body.assignedEmployee),
          status: normalizeAdvertisingStatus(body.status),
         price: parseNumber(body.price),
         currency: normalizeCurrency(body.currency),
         draftText: cleanString(body.draftText),
         note: cleanString(body.note),
         priority: normalizePriority(body.priority),
         updatedAt: new Date(),
      };

      await property.save();

      const populated = await Property.findById(property._id)
         .select("title rentOptions.rentTitle rentOptions.price rentOptions.currency rentOptions.rentStory.note location_text location type_deal type_estate statusRent cost currency rooms square_tot square_area square_liv square_kit area_unit floor floors type_building type_walls type_house purpose_area height_wall balconies heating type_heating actualityGroup actualityStatus actualityNote images assignee advertisingSettings advertisingTexts advertisingLinks propertyVideos updatedAt")
         .populate("assignee", "name fullName surname avatarUrl color")
         .populate("advertisingSettings.assignedEmployee", "name fullName surname avatarUrl color role")
         .lean();

      return Response.json({ ok: true, item: serializeProperty(populated) });
   } catch (error) {
      console.error(error);
      return new Response("Error updating advertising property", { status: 500 });
   }
};
