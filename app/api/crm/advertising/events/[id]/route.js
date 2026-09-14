import connectDB from "@/config/database";
import MarketingEvent, {
   MARKETING_EVENT_ACTIONS,
   MARKETING_EVENT_PLATFORMS,
} from "@/models/MarketingEvent";
import Property from "@/models/Property";
import Employee from "@/models/Employee";
import { getSessionUser } from "@/utils/getSessionUser";
import { canEnterAdvertisingCabinet, canManageProperty } from "@/utils/crm/accessControl";
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

function normalizeAction(value, fallback = "scanner") {
   return MARKETING_EVENT_ACTIONS.includes(value) ? value : fallback;
}

function normalizePlatform(value, fallback = "other") {
   return MARKETING_EVENT_PLATFORMS.includes(value) ? value : fallback;
}

function normalizeSourceType(value, fallback = "ours") {
   return VALID_SOURCE_TYPES.includes(value) ? value : fallback;
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
      advertisingLinkId: source.advertisingLinkId?.toString?.() || source.advertisingLinkId || null,
      actionLabel: marketingActionLabel(source.actionType),
      advertisingLinkLabel: linkLabel,
   };
}

function normalizeEventBody(body = {}, fallback = {}) {
   const actionType = normalizeAction(body.actionType, fallback.actionType || "scanner");
   const metrics = body.metrics || {};

   return {
      property: objectIdOrNull(body.property || body.propertyId) || objectIdOrNull(fallback.property),
      advertisingLinkId: objectIdOrNull(body.advertisingLinkId),
      actionType,
      platform: normalizePlatform(body.platform, fallback.platform || "other"),
      occurredAt: parseDate(body.occurredAt, fallback.occurredAt || new Date()),
      responsibleEmployee: objectIdOrNull(body.responsibleEmployee) || objectIdOrNull(fallback.responsibleEmployee),
      sourceType: normalizeSourceType(body.sourceType, fallback.sourceType || "ours"),
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
   };
}

async function syncPropertyLink(property, data) {
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

      if (data.actionType === "scanner") link.lastCheckedAt = data.occurredAt;
      if (data.actionType === "deactivated") {
         link.status = "archived";
         link.closedAt = data.occurredAt;
         link.closedNote = data.note || link.closedNote || "";
      }
   }

   if (property.isModified()) await property.save();
}

async function getEditableEvent(id, sessionUser) {
   if (!Types.ObjectId.isValid(String(id || ""))) {
      return { response: Response.json({ error: "Некоректний ID рекламної дії" }, { status: 400 }) };
   }

   const event = await MarketingEvent.findById(id);
   if (!event) return { response: Response.json({ error: "Рекламну дію не знайдено" }, { status: 404 }) };

   const property = await Property.findById(event.property);
   if (!property) return { response: Response.json({ error: "Об’єкт рекламної дії не знайдено" }, { status: 404 }) };

   const allowed = await canManageProperty(sessionUser, property);
   if (!allowed) {
      return { response: Response.json({ error: "Немає доступу до зміни рекламної дії цього об’єкта" }, { status: 403 }) };
   }

   return { event, property };
}

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser();
      if (!sessionUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
      if (!canEnterAdvertisingCabinet(sessionUser)) return Response.json({ error: "Forbidden" }, { status: 403 });

      const { event, property, response } = await getEditableEvent(params.id, sessionUser);
      if (response) return response;

      const body = await req.json();
      const data = normalizeEventBody(body, event);
      const targetProperty = String(data.property || "") === String(property._id)
         ? property
         : await Property.findById(data.property);

      if (!targetProperty) return Response.json({ error: "Об’єкт не знайдено" }, { status: 404 });
      if (String(targetProperty._id) !== String(property._id)) {
         const allowedTarget = await canManageProperty(sessionUser, targetProperty);
         if (!allowedTarget) {
            return Response.json({ error: "Немає доступу до нового об’єкта рекламної дії" }, { status: 403 });
         }
      }

      if (!isCreateAction(data.actionType) && !data.advertisingLinkId) {
         return Response.json({ error: "Оберіть конкретну рекламу для цієї дії" }, { status: 400 });
      }
      if (!isCreateAction(data.actionType) && !targetProperty.advertisingLinks.id(data.advertisingLinkId)) {
         return Response.json({ error: "Рекламу не знайдено в цьому об’єкті" }, { status: 400 });
      }

      await syncPropertyLink(targetProperty, data);

      event.property = data.property;
      event.advertisingLinkId = data.advertisingLinkId || null;
      event.actionType = data.actionType;
      event.platform = data.platform;
      event.occurredAt = data.occurredAt;
      event.responsibleEmployee = data.responsibleEmployee || null;
      event.sourceType = data.sourceType;
      event.linkTitle = data.linkTitle;
      event.linkUrl = data.linkUrl;
      event.note = data.note;
      event.costUah = data.costUah;
      event.metrics = data.metrics;

      await event.save();

      const populated = await MarketingEvent.findById(event._id)
         .populate("property", "title rentOptions.rentTitle location_text type_deal type_estate cost currency assignee advertisingLinks")
         .populate("responsibleEmployee", "name fullName surname avatarUrl color role")
         .populate("createdByEmployee", "name fullName surname avatarUrl color role")
         .lean();
      return Response.json({ ok: true, item: serializeEvent(populated) });
   } catch (error) {
      console.error(error);
      return new Response("Error updating advertising event", { status: 500 });
   }
};

export const DELETE = async (req, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser();
      if (!sessionUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
      if (!canEnterAdvertisingCabinet(sessionUser)) return Response.json({ error: "Forbidden" }, { status: 403 });

      const { event, property, response } = await getEditableEvent(params.id, sessionUser);
      if (response) return response;

      await MarketingEvent.deleteOne({ _id: event._id });

      return Response.json({ ok: true });
   } catch (error) {
      console.error(error);
      return new Response("Error deleting advertising event", { status: 500 });
   }
};
