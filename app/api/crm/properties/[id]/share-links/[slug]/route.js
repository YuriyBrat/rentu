import connectDB from '@/config/database';
import Property from '@/models/Property';
import { logActivity } from '@/utils/crm/activityLog';
import { getSessionUser } from '@/utils/getSessionUser';

function propertyTitle(property) {
   return property?.title || property?.location_text || 'Об’єкт';
}

function normalizeShareLink(link) {
   if (!link) return null;
   const source = link.toObject ? link.toObject() : link;

   return {
      _id: source._id?.toString?.() || String(source._id || ''),
      type: source.type || 'client',
      slug: source.slug || '',
      title: source.title || '',
      presentationType: source.presentationType || 'classic',
      isActive: source.isActive !== false,
      lead: source.lead?.toString?.() || String(source.lead || ''),
      leadNameSnapshot: source.leadNameSnapshot || '',
      leadPhoneSnapshot: source.leadPhoneSnapshot || '',
      createdByEmployee: source.createdByEmployee?.toString?.() || String(source.createdByEmployee || ''),
      createdAt: source.createdAt ? new Date(source.createdAt).toISOString() : null,
   };
}

function getPresentationLabel(link) {
   if (link?.type === 'partner') return 'партнерську презентацію';
   if (link?.presentationType === 'landing') return 'клієнтський лендінг';
   return 'клієнтську презентацію';
}

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();

      await Property.updateOne(
         { _id: params.id, 'shareLinks.slug': params.slug },
         {
            $set: {
               'shareLinks.$.title': body.title || '',
            },
         }
      );

      return Response.json({ ok: true });
   } catch (error) {
      console.error('UPDATE SHARE LINK ERROR:', error);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};

export const DELETE = async (req, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const property = await Property.findById(params.id);
      if (!property) return Response.json({ error: 'Property not found' }, { status: 404 });

      const link = property.shareLinks.find((item) => item.slug === params.slug);
      if (!link) return Response.json({ error: 'Share link not found' }, { status: 404 });

      const before = normalizeShareLink(link);
      property.shareLinks.pull({ _id: link._id });
      await property.save();

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'deleted',
         source: 'manual',
         title: propertyTitle(property),
         message: `Видалено ${getPresentationLabel(before)}`,
         before,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            kind: 'shareLink',
            shareLinkSlug: before?.slug || params.slug,
            shareLinkType: before?.type || '',
            presentationType: before?.presentationType || '',
            leadId: before?.lead || '',
         },
         sessionUser,
      });

      return Response.json({ ok: true });
   } catch (error) {
      console.error('DELETE SHARE LINK ERROR:', error);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};
