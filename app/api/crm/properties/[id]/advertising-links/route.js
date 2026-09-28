import connectDB from '@/config/database';
import Property from '@/models/Property';
import MarketingEvent from '@/models/MarketingEvent';
import { getSessionUser } from '@/utils/getSessionUser';
import { canManageProperty } from '@/utils/crm/accessControl';
import { buildActivityDiff, logActivity } from '@/utils/crm/activityLog';

const AD_LINK_FIELDS = [
   'platform',
   'sourceType',
   'title',
   'workTitle',
   'url',
   'status',
   'note',
   'createdAt',
   'closedAt',
   'closedNote',
];
const VALID_PLATFORMS = ['olx', 'dimria', 'rieltor', 'lun', 'flatfy', 'real-estate', 'facebook', 'instagram', 'tiktok', 'telegram', 'site', 'other'];
const PLATFORM_TITLES = {
   olx: 'OLX',
   dimria: 'DIM.RIA',
   rieltor: 'RIELTOR.UA',
   lun: 'LUN.UA',
   flatfy: 'FLATFY.UA',
   'real-estate': 'REAL-ESTATE',
   facebook: 'Facebook',
   instagram: 'Instagram',
   tiktok: 'TikTok',
   telegram: 'Telegram',
   site: 'Сайт',
   other: 'Інше',
};

function parseDate(value) {
   if (!value) return null;
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeLink(link) {
   if (!link) return null;
   const source = link.toObject ? link.toObject() : link;
   return {
      _id: source._id?.toString?.() || String(source._id || ''),
      platform: source.platform || 'other',
      sourceType: source.sourceType || 'ours',
      title: source.title || '',
      workTitle: source.workTitle || source.title || '',
      url: source.url || '',
      status: source.closedAt ? 'archived' : (source.status || 'active'),
      note: source.note || '',
      createdAt: source.createdAt ? new Date(source.createdAt).toISOString() : null,
      closedAt: source.closedAt ? new Date(source.closedAt).toISOString() : null,
      closedNote: source.closedNote || '',
   };
}

function platformTitle(platform) {
   return PLATFORM_TITLES[platform] || PLATFORM_TITLES.other;
}

function nextAdvertisingWorkTitle(property, platform) {
   const base = platformTitle(platform);
   const links = property.advertisingLinks || [];
   const count = links.filter((link) => (link.platform || 'other') === platform).length;
   return `${base} ${count + 1}`;
}

function propertyTitle(property) {
   return property.title || property.location_text || 'Об’єкт';
}

async function requireEditableProperty(sessionUser, property) {
   const allowed = await canManageProperty(sessionUser, property);
   if (!allowed) {
      return new Response('Недостатньо прав для зміни рекламних посилань цього об’єкта', { status: 403 });
   }
   return null;
}

async function createMarketingEventFromLink({ property, link, actionType, occurredAt, note, sessionUser }) {
   try {
      if (!link?._id) return null;

      return await MarketingEvent.create({
         property: property._id,
         advertisingLinkId: link._id,
         actionType,
         platform: link.platform || 'other',
         sourceType: link.sourceType || 'ours',
         occurredAt: occurredAt || new Date(),
         responsibleEmployee: sessionUser?.employeeId || null,
         createdByEmployee: sessionUser?.employeeId || null,
         linkTitle: link.workTitle || link.title || '',
         linkUrl: link.url || '',
         note: note || link.note || '',
         costUah: null,
         createdFrom: 'property_link',
      });
   } catch (error) {
      console.error('Marketing event from advertising link failed:', error);
      return null;
   }
}
export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();
      const sessionUser = await getSessionUser();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      const deniedResponse = await requireEditableProperty(sessionUser, property);
      if (deniedResponse) return deniedResponse;

      const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();

       property.advertisingLinks.unshift({
          platform: VALID_PLATFORMS.includes(body.platform) ? body.platform : 'other',
         sourceType: ['ours', 'competitor', 'owner'].includes(body.sourceType)
            ? body.sourceType
            : 'ours',
          title: body.title || '',
          workTitle: body.workTitle || body.title || nextAdvertisingWorkTitle(property, VALID_PLATFORMS.includes(body.platform) ? body.platform : 'other'),
         url: body.url || '',
         status: 'active',
         note: body.note || '',
         createdByEmployee: sessionUser?.employeeId || null,
         createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
         closedAt: null,
         closedNote: '',
         lastCheckedAt: body.lastCheckedAt ? new Date(body.lastCheckedAt) : null,
      });

      await property.save();
      const link = normalizeLink(property.advertisingLinks[0]);
      const marketingEvent = await createMarketingEventFromLink({
         property,
         link: property.advertisingLinks[0],
         actionType: 'created_first',
         occurredAt: property.advertisingLinks[0]?.createdAt || new Date(),
         note: body.note || '',
         sessionUser,
      });

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'created',
         source: 'manual',
         title: propertyTitle(property),
         message: 'Додано рекламне посилання',
         after: link,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            advertisingLinkId: link?._id || '',
            marketingEventId: marketingEvent?._id?.toString?.() || '',
         },
         sessionUser,
      });

      return Response.json({ ok: true, item: property });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();
      const sessionUser = await getSessionUser();
      const linkId = String(body.linkId || body._id || '').trim();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      const deniedResponse = await requireEditableProperty(sessionUser, property);
      if (deniedResponse) return deniedResponse;

      const link = property.advertisingLinks.id(linkId);
      if (!link) return new Response('Advertising link not found', { status: 404 });

      const before = normalizeLink(link);
      const createdAt = parseDate(body.createdAt);
      const closedAt = parseDate(body.closedAt);
      const closedNote = String(body.closedNote || '').trim();

      if (closedAt && !closedNote) {
         return new Response('Вкажіть пояснення закриття рекламного посилання', { status: 400 });
      }

      link.platform = VALID_PLATFORMS.includes(body.platform)
          ? body.platform
          : link.platform || 'other';
      link.sourceType = ['ours', 'competitor', 'owner'].includes(body.sourceType)
         ? body.sourceType
         : link.sourceType || 'ours';
      link.title = body.title || '';
      link.workTitle = body.workTitle || link.workTitle || body.title || nextAdvertisingWorkTitle(property, link.platform || 'other');
      link.url = body.url || '';
      link.note = body.note || '';
      if (createdAt) link.createdAt = createdAt;
      link.closedAt = closedAt;
      link.closedNote = closedAt ? closedNote : '';
      link.status = closedAt ? 'archived' : 'active';

      await property.save();

      const after = normalizeLink(link);
      const diff = buildActivityDiff(before, after, AD_LINK_FIELDS);
      const statusChangedToArchived = before?.status !== 'archived' && after?.status === 'archived';
      const marketingEvent = await createMarketingEventFromLink({
         property,
         link,
         actionType: statusChangedToArchived ? 'deactivated' : 'updated_without_changes',
         occurredAt: statusChangedToArchived ? (closedAt || new Date()) : new Date(),
         note: statusChangedToArchived ? closedNote : body.note || '',
         sessionUser,
      });

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: before?.status !== after?.status ? 'status_changed' : 'updated',
         source: 'manual',
         title: propertyTitle(property),
         message: after?.status === 'archived'
            ? 'Рекламне посилання переведено в неактивні'
            : 'Оновлено рекламне посилання',
         before,
         after,
         diff,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            advertisingLinkId: linkId,
            marketingEventId: marketingEvent?._id?.toString?.() || '',
         },
         sessionUser,
      });

      return Response.json({ ok: true, item: after });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};

export const DELETE = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json().catch(() => ({}));
      const sessionUser = await getSessionUser();
      const linkId = String(body.linkId || body._id || '').trim();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      const deniedResponse = await requireEditableProperty(sessionUser, property);
      if (deniedResponse) return deniedResponse;

      const link = property.advertisingLinks.id(linkId);
      if (!link) return new Response('Advertising link not found', { status: 404 });

      const before = normalizeLink(link);
      property.advertisingLinks.pull({ _id: linkId });
      await property.save();

      const deletedEvents = await MarketingEvent.deleteMany({
         property: property._id,
         advertisingLinkId: linkId,
      });

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'deleted',
         source: 'manual',
         title: propertyTitle(property),
         message: 'Видалено рекламне посилання',
         before,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            advertisingLinkId: linkId,
            deletedMarketingEvents: deletedEvents?.deletedCount || 0,
         },
         sessionUser,
      });

      return Response.json({ ok: true, deletedEvents: deletedEvents?.deletedCount || 0 });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};
