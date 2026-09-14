import connectDB from "@/config/database";
import MarketingEvent, {
   MARKETING_EVENT_ACTIONS,
   MARKETING_EVENT_PLATFORMS,
} from "@/models/MarketingEvent";
import Property from "@/models/Property";
import Employee from "@/models/Employee";
import { getSessionUser } from "@/utils/getSessionUser";
import { buildPropertyAccessFilter, canEnterAdvertisingCabinet, canManageProperty } from "@/utils/crm/accessControl";
import { Types } from "mongoose";

void Employee;

const VALID_SOURCE_TYPES = ["ours", "competitor", "owner"];
const PLATFORM_TITLES = {
   olx: "OLX",
   dimria: "DIM.RIA",
   rieltor: "RIELTOR.UA",
   lun: "LUN.UA",
   flatfy: "FLATFY.UA",
   "real-estate": "REAL-ESTATE",
   facebook: "Facebook",
   instagram: "Instagram",
   tiktok: "TikTok",
   telegram: "Telegram",
   site: "Сайт",
   other: "Інше",
};

function cleanString(value) {
   return String(value || "").trim();
}

function objectIdOrNull(value) {
   const v = cleanString(value);
   return Types.ObjectId.isValid(v) ? new Types.ObjectId(v) : null;
}

function parseDate(value, fallback = null) {
   if (!value) return fallback;
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? fallback : date;
}

function parseNumber(value) {
   if (value === undefined || value === null || value === "") return null;
   const n = Number(value);
   return Number.isFinite(n) ? n : null;
}

function normalizeAction(value) {
   return MARKETING_EVENT_ACTIONS.includes(value) ? value : "scanner";
}

function normalizePlatform(value) {
   return MARKETING_EVENT_PLATFORMS.includes(value) ? value : "other";
}

function normalizeSourceType(value) {
   return VALID_SOURCE_TYPES.includes(value) ? value : "ours";
}

function platformTitle(platform) {
   return PLATFORM_TITLES[platform] || PLATFORM_TITLES.other;
}

function nextAdvertisingWorkTitle(property, platform) {
   const base = platformTitle(platform);
   const links = property.advertisingLinks || [];
   const count = links.filter((link) => (link.platform || "other") === platform).length;
   return `${base} ${count + 1}`;
}

function advertisingLinkLabel(property, link, fallbackPlatform = "") {
   if (!link) return fallbackPlatform ? platformTitle(fallbackPlatform) : "";
   if (link.workTitle || link.title) return link.workTitle || link.title;
   const platform = link.platform || fallbackPlatform || "other";
   const samePlatformLinks = [...(property?.advertisingLinks || [])]
      .filter((item) => (item.platform || "other") === platform)
      .sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());
   const index = samePlatformLinks.findIndex((item) => String(item?._id || "") === String(link?._id || ""));
   return `${platformTitle(platform)}${index >= 0 ? ` ${index + 1}` : ""}`;
}

function isCreateAction(actionType) {
   return String(actionType || "").startsWith("created");
}


function marketingActionLabel(actionType) {
   const labels = {
      created_first: "створено вперше",
      created_with_update: "створено з покращенням",
      created_without_changes: "створено без змін",
      updated_improved: "оновлено з покращенням",
      updated_without_changes: "оновлено без змін",
      edited_photo: "редаговано фото",
      price_changed: "змінено ціну",
      scanner: "сканер",
      financial_promotion: "фінансове просування",
      deactivated: "деактивовано",
   };
   return labels[actionType] || actionType;
}

function normalizeEventBody(body = {}, sessionUser = {}) {
   const actionType = normalizeAction(body.actionType);
   const occurredAt = parseDate(body.occurredAt, new Date());
   const metrics = body.metrics || {};

   return {
      property: objectIdOrNull(body.property || body.propertyId),
      advertisingLinkId: objectIdOrNull(body.advertisingLinkId),
      actionType,
      platform: normalizePlatform(body.platform),
      occurredAt,
      responsibleEmployee: objectIdOrNull(body.responsibleEmployee) || objectIdOrNull(sessionUser.employeeId),
      createdByEmployee: objectIdOrNull(sessionUser.employeeId),
      sourceType: normalizeSourceType(body.sourceType),
      linkTitle: cleanString(body.linkTitle || body.title),
      linkUrl: cleanString(body.linkUrl || body.url),
      note: cleanString(body.note),
      costUah: parseNumber(body.costUah),
      metrics: {
         views: parseNumber(metrics.views ?? body.views),
         calls: parseNumber(metrics.calls ?? body.calls),
         messages: parseNumber(metrics.messages ?? body.messages),
         phoneOpens: parseNumber(metrics.phoneOpens ?? body.phoneOpens),
         favorites: parseNumber(metrics.favorites ?? body.favorites),
         saves: parseNumber(metrics.saves ?? body.saves),
         clicks: parseNumber(metrics.clicks ?? body.clicks),
         position: parseNumber(metrics.position ?? body.position),
      },
      createdFrom: body.createdFrom === "property_link" || body.createdFrom === "system"
         ? body.createdFrom
         : "manual",
   };
}

function serializeEvent(event) {
   const source = event?.toObject ? event.toObject() : event;
   if (!source) return null;
   const link = Array.isArray(source.property?.advertisingLinks)
      ? source.property.advertisingLinks.find((item) => String(item?._id || "") === String(source.advertisingLinkId || ""))
      : null;
   const linkLabel = advertisingLinkLabel(source.property, link, source.platform) || source.linkTitle || platformTitle(source.platform);
   return {
      ...source,
      _id: source._id?.toString?.() || String(source._id || ""),
      property: source.property,
      advertisingLinkId: source.advertisingLinkId?.toString?.() || source.advertisingLinkId || null,
      actionLabel: marketingActionLabel(source.actionType),
      advertisingLinkLabel: linkLabel,
   };
}

async function attachOrSyncPropertyLink(property, data) {
   let link = data.advertisingLinkId ? property.advertisingLinks.id(data.advertisingLinkId) : null;

   if (!link && (data.linkUrl || isCreateAction(data.actionType))) {
      const platform = normalizePlatform(data.platform);
      const workTitle = data.linkTitle || nextAdvertisingWorkTitle(property, platform);
      property.advertisingLinks.unshift({
         platform,
         sourceType: data.sourceType,
         title: data.linkTitle,
         workTitle,
         url: data.linkUrl,
         status: data.actionType === "deactivated" ? "archived" : "active",
         note: data.note,
         createdByEmployee: data.createdByEmployee,
         createdAt: data.occurredAt,
         closedAt: data.actionType === "deactivated" ? data.occurredAt : null,
         closedNote: data.actionType === "deactivated" ? data.note : "",
         lastCheckedAt: data.actionType === "scanner" ? data.occurredAt : null,
      });
      link = property.advertisingLinks[0];
      data.advertisingLinkId = link._id;
      data.linkTitle = data.linkTitle || workTitle;
   }

   if (link) {
      data.platform = normalizePlatform(link.platform || data.platform);
      data.sourceType = normalizeSourceType(link.sourceType || data.sourceType);
      data.linkTitle = data.linkTitle || link.workTitle || link.title || "";
      data.linkUrl = data.linkUrl || link.url || "";

      if (data.actionType === "scanner") {
         link.lastCheckedAt = data.occurredAt;
      }

      if (data.actionType === "deactivated") {
         link.status = "archived";
         link.closedAt = data.occurredAt;
         link.closedNote = data.note || link.closedNote || "";
      }
   }

   if (property.isModified()) {
      await property.save();
   }
}

export const GET = async (req) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser();
      if (!sessionUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
      if (!canEnterAdvertisingCabinet(sessionUser)) return Response.json({ error: "Forbidden" }, { status: 403 });

      const sp = req.nextUrl.searchParams;
      const page = Math.max(parseInt(sp.get("page") || "1", 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get("pageSize") || "30", 10), 1), 200);
      const skip = (page - 1) * pageSize;
      const filter = {};

      const propertyId = objectIdOrNull(sp.get("property"));
      const employeeId = objectIdOrNull(sp.get("employee"));
      const actionType = cleanString(sp.get("actionType"));
      const platform = cleanString(sp.get("platform"));
      const q = cleanString(sp.get("q"));
      const dateFrom = parseDate(sp.get("dateFrom"));
      const dateTo = parseDate(sp.get("dateTo"));

      if (propertyId) filter.property = propertyId;
      if (employeeId) filter.responsibleEmployee = employeeId;
      if (MARKETING_EVENT_ACTIONS.includes(actionType)) filter.actionType = actionType;
      if (MARKETING_EVENT_PLATFORMS.includes(platform)) filter.platform = platform;
      if (dateFrom || dateTo) {
         filter.occurredAt = {};
         if (dateFrom) filter.occurredAt.$gte = dateFrom;
         if (dateTo) filter.occurredAt.$lte = dateTo;
      }
      if (q) {
         const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
         const propertyRows = await Property.find({
            $or: [
               { title: { $regex: safeQ, $options: "i" } },
               { "rentOptions.rentTitle": { $regex: safeQ, $options: "i" } },
               { location_text: { $regex: safeQ, $options: "i" } },
            ],
         })
            .select("_id")
            .limit(100)
            .lean();
         const propertyIds = propertyRows.map((item) => item._id).filter(Boolean);
         filter.$or = [
            { linkTitle: { $regex: safeQ, $options: "i" } },
            { linkUrl: { $regex: safeQ, $options: "i" } },
            { note: { $regex: safeQ, $options: "i" } },
            ...(propertyIds.length ? [{ property: { $in: propertyIds } }] : []),
         ];
      }

      const accessFilter = await buildPropertyAccessFilter(sessionUser);
      const scopedPropertyRows = Object.keys(accessFilter).length
         ? await Property.find(accessFilter).select("_id").lean()
         : [];
      if (Object.keys(accessFilter).length) {
         const scopedPropertyIds = scopedPropertyRows.map((item) => item._id).filter(Boolean);
         const hasRequestedPropertyAccess = propertyId && scopedPropertyIds.some((id) => String(id) === String(propertyId));
         filter.property = propertyId
            ? (hasRequestedPropertyAccess ? propertyId : { $in: [] })
            : { $in: scopedPropertyIds };
      }

      const [items, total, summaryRows] = await Promise.all([
         MarketingEvent.find(filter)
            .populate("property", "title rentOptions.rentTitle location_text type_deal type_estate cost currency assignee advertisingLinks")
            .populate("responsibleEmployee", "name fullName surname avatarUrl color role")
            .populate("createdByEmployee", "name fullName surname avatarUrl color role")
            .sort({ occurredAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean(),
         MarketingEvent.countDocuments(filter),
         MarketingEvent.aggregate([
            { $match: filter },
            {
               $group: {
                  _id: null,
                  totalCostUah: { $sum: { $ifNull: ["$costUah", 0] } },
                  scannerCount: { $sum: { $cond: [{ $eq: ["$actionType", "scanner"] }, 1, 0] } },
                  newAdsCount: { $sum: { $cond: [{ $in: ["$actionType", ["created_first", "created_with_update", "created_without_changes"]] }, 1, 0] } },
                  workActionsCount: { $sum: { $cond: [{ $not: [{ $in: ["$actionType", ["scanner", "deactivated"]] }] }, 1, 0] } },
                  improvementsCount: { $sum: { $cond: [{ $in: ["$actionType", ["created_with_update", "updated_improved"]] }, 1, 0] } },
                  updatesCount: { $sum: { $cond: [{ $in: ["$actionType", ["updated_improved", "updated_without_changes", "edited_photo", "price_changed"]] }, 1, 0] } },
                  deactivatedCount: { $sum: { $cond: [{ $eq: ["$actionType", "deactivated"] }, 1, 0] } },
                  financialPromotionCost: { $sum: { $cond: [{ $eq: ["$actionType", "financial_promotion"] }, { $ifNull: ["$costUah", 0] }, 0] } },
               },
            },
         ]),
      ]);

      const summary = summaryRows[0] || {};

      return Response.json({
         items: items.map(serializeEvent),
         total,
         page,
         pageSize,
         summary: {
            total,
            totalCostUah: summary.totalCostUah || 0,
            scannerCount: summary.scannerCount || 0,
            newAdsCount: summary.newAdsCount || 0,
            workActionsCount: summary.workActionsCount || 0,
            improvementsCount: summary.improvementsCount || 0,
            updatesCount: summary.updatesCount || 0,
            deactivatedCount: summary.deactivatedCount || 0,
            financialPromotionCost: summary.financialPromotionCost || 0,
         },
      });
   } catch (error) {
      console.error(error);
      return new Response("Error fetching advertising events", { status: 500 });
   }
};

export const POST = async (req) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser();
      if (!sessionUser) {
         return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (!canEnterAdvertisingCabinet(sessionUser)) return Response.json({ error: "Forbidden" }, { status: 403 });

      const body = await req.json();
      const data = normalizeEventBody(body, sessionUser);

      if (!data.property) {
         return Response.json({ error: "Оберіть об’єкт для рекламної дії" }, { status: 400 });
      }

      const property = await Property.findById(data.property);
      if (!property) return Response.json({ error: "Об’єкт не знайдено" }, { status: 404 });

      const allowed = await canManageProperty(sessionUser, property);
      if (!allowed) {
         return Response.json({ error: "Немає доступу до рекламних дій цього об’єкта" }, { status: 403 });
      }

      if (!isCreateAction(data.actionType) && !data.advertisingLinkId) {
         return Response.json({ error: "Оберіть конкретну рекламу для цієї дії" }, { status: 400 });
      }
      if (!isCreateAction(data.actionType) && !property.advertisingLinks.id(data.advertisingLinkId)) {
         return Response.json({ error: "Рекламу не знайдено в цьому об’єкті" }, { status: 400 });
      }

      await attachOrSyncPropertyLink(property, data);

      const item = await MarketingEvent.create(data);
      const populated = await MarketingEvent.findById(item._id)
          .populate("property", "title rentOptions.rentTitle location_text type_deal type_estate cost currency assignee advertisingLinks")
         .populate("responsibleEmployee", "name fullName surname avatarUrl color role")
         .populate("createdByEmployee", "name fullName surname avatarUrl color role")
         .lean();

      return Response.json({ ok: true, item: serializeEvent(populated) }, { status: 201 });
   } catch (error) {
      console.error(error);
      return new Response("Error creating advertising event", { status: 500 });
   }
};
