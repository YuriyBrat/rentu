import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { canManageProperty } from '@/utils/crm/accessControl';
import { buildActivityDiff, logActivity } from '@/utils/crm/activityLog';

const AD_LINK_FIELDS = [
   'platform',
   'sourceType',
   'title',
   'url',
   'status',
   'note',
   'createdAt',
   'closedAt',
   'closedNote',
];
const VALID_PLATFORMS = ['olx', 'dimria', 'rieltor', 'lun', 'flatfy', 'real-estate', 'facebook', 'instagram', 'tiktok', 'telegram', 'site', 'other'];

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
      url: source.url || '',
      status: source.closedAt ? 'archived' : 'active',
      note: source.note || '',
      createdAt: source.createdAt ? new Date(source.createdAt).toISOString() : null,
      closedAt: source.closedAt ? new Date(source.closedAt).toISOString() : null,
      closedNote: source.closedNote || '',
   };
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
      link.url = body.url || '';
      link.note = body.note || '';
      if (createdAt) link.createdAt = createdAt;
      link.closedAt = closedAt;
      link.closedNote = closedAt ? closedNote : '';
      link.status = closedAt ? 'archived' : 'active';

      await property.save();

      const after = normalizeLink(link);
      const diff = buildActivityDiff(before, after, AD_LINK_FIELDS);

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
         },
         sessionUser,
      });

      return Response.json({ ok: true, item: after });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};
