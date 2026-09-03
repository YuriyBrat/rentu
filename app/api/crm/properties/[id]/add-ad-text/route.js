import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { canManageProperty } from '@/utils/crm/accessControl';
import { buildActivityDiff, logActivity } from '@/utils/crm/activityLog';
// POST /api/crm/properties/:id/add-ad-text

const AD_TEXT_FIELDS = ['title', 'text', 'note'];

function normalizeAdText(item) {
   if (!item) return null;
   const source = item.toObject ? item.toObject() : item;
   return {
      _id: source._id?.toString?.() || String(source._id || ''),
      title: source.title || '',
      text: source.text || '',
      note: source.note || '',
      status: source.status || 'draft',
      createdAt: source.createdAt ? new Date(source.createdAt).toISOString() : null,
   };
}

function propertyTitle(property) {
   return property.title || property.location_text || 'Об’єкт';
}

async function requireEditableProperty(sessionUser, property) {
   const allowed = await canManageProperty(sessionUser, property);
   if (!allowed) {
      return new Response('Недостатньо прав для зміни рекламних текстів цього об’єкта', { status: 403 });
   }
   return null;
}

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();
      const sessionUser = await getSessionUser();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Not found', { status: 404 });

      const deniedResponse = await requireEditableProperty(sessionUser, property);
      if (deniedResponse) return deniedResponse;

      property.advertisingTexts.unshift({
         title: body.title || '',
         text: body.text || '',
         note: body.note || '',
         result: '',
         createdByEmployee: sessionUser?.employeeId || null,
      });

      await property.save();
      const adText = normalizeAdText(property.advertisingTexts[0]);

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'created',
         source: 'manual',
         title: propertyTitle(property),
         message: 'Додано рекламний текст',
         after: adText,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            advertisingTextId: adText?._id || '',
         },
         sessionUser,
      });

      return Response.json({ ok: true, item: adText });
   } catch (e) {
      console.log(e);
      return new Response('Error', { status: 500 });
   }
};

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();
      const sessionUser = await getSessionUser();
      const textId = String(body.textId || body._id || '').trim();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Not found', { status: 404 });

      const deniedResponse = await requireEditableProperty(sessionUser, property);
      if (deniedResponse) return deniedResponse;

      const adText = property.advertisingTexts.id(textId);
      if (!adText) return new Response('Advertising text not found', { status: 404 });

      const before = normalizeAdText(adText);
      adText.title = body.title || '';
      adText.text = body.text || '';
      adText.note = body.note || '';

      await property.save();

      const after = normalizeAdText(adText);
      const diff = buildActivityDiff(before, after, AD_TEXT_FIELDS);

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'updated',
         source: 'manual',
         title: propertyTitle(property),
         message: 'Оновлено рекламний текст',
         before,
         after,
         diff,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            advertisingTextId: textId,
         },
         sessionUser,
      });

      return Response.json({ ok: true, item: after });
   } catch (e) {
      console.log(e);
      return new Response('Error', { status: 500 });
   }
};

export const DELETE = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json().catch(() => ({}));
      const sessionUser = await getSessionUser();
      const textId = String(body.textId || body._id || '').trim();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Not found', { status: 404 });

      const deniedResponse = await requireEditableProperty(sessionUser, property);
      if (deniedResponse) return deniedResponse;

      const adText = property.advertisingTexts.id(textId);
      if (!adText) return new Response('Advertising text not found', { status: 404 });

      const before = normalizeAdText(adText);
      adText.deleteOne();
      await property.save();

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'deleted',
         source: 'manual',
         title: propertyTitle(property),
         message: 'Видалено рекламний текст',
         before,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            advertisingTextId: textId,
         },
         sessionUser,
      });

      return Response.json({ ok: true });
   } catch (e) {
      console.log(e);
      return new Response('Error', { status: 500 });
   }
};
