import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import Property from '@/models/Property';
import { logActivity } from '@/utils/crm/activityLog';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

function randomSlug(prefix = 'view') {
   const part = Math.random().toString(36).slice(2, 8);
   const time = Date.now().toString(36).slice(-5);
   return `${prefix}-${part}${time}`;
}

function makeClientSlug(title = '') {
   const clean = title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

   return clean ? `${clean}-${Date.now().toString(36).slice(-4)}` : randomSlug('object');
}

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

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const body = await req.json();

      const property = await Property.findById(params.id);
      if (!property) {
         return Response.json({ error: 'Property not found' }, { status: 404 });
      }

      const type = body.type === 'partner' ? 'partner' : 'client';

      const slug =
         type === 'partner'
            ? randomSlug('p')
            : makeClientSlug(property.title || 'object');

      const presentationType = body.presentationType === 'landing' ? 'landing' : 'classic';
      const leadId = String(body.leadId || '').trim();
      const lead = Types.ObjectId.isValid(leadId)
         ? await Lead.findById(leadId).select('name phones').lean()
         : null;

      const link = {
         type,
         slug,
         presentationType,
         // title:
         //    body.title ||
         //    (presentationType === 'landing'
         //       ? 'Лендінг-презентація'
         //       : type === 'partner'
         //          ? 'Партнерська презентація'
         //          : 'Клієнтська презентація'),
         title: body.title?.trim() || '',

         isActive: true,

         showBrand: type === 'client',
         showManagerContact: type === 'client',
         useBrandedPhotos: type === 'client',

         viewsCount: 0,
         lastViewedAt: null,

         createdByEmployee:
            sessionUser?.employeeId ||
            null,

         lead: lead?._id || null,
         leadNameSnapshot: lead?.name || '',
         leadPhoneSnapshot: Array.isArray(lead?.phones) ? (lead.phones[0] || '') : '',
         offerStatus: lead ? 'created' : undefined,
      };

      // const link = {
      //    type,
      //    slug,
      //    title: body.title || (type === 'partner' ? 'Партнерська презентація' : 'Клієнтська презентація'),
      //    isActive: true,

      //    showBrand: type === 'client',
      //    showManagerContact: type === 'client',
      //    useBrandedPhotos: type === 'client',

      //    viewsCount: 0,
      //    lastViewedAt: null,

      //    // createdByEmployee: body.createdByEmployee || null,
      //    createdByEmployee: session?.user?.id || null,
      // };

      property.shareLinks.unshift(link);

      await property.save();
      const createdLinkSnapshot = normalizeShareLink(property.shareLinks[0]);

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'created',
         source: 'manual',
         title: propertyTitle(property),
         message: `Створено ${getPresentationLabel(createdLinkSnapshot)}`,
         after: createdLinkSnapshot,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            kind: 'shareLink',
            shareLinkSlug: createdLinkSnapshot?.slug || slug,
            shareLinkType: createdLinkSnapshot?.type || type,
            presentationType: createdLinkSnapshot?.presentationType || presentationType,
            leadId: createdLinkSnapshot?.lead || '',
         },
         sessionUser,
      });

      await property.populate('shareLinks.createdByEmployee', 'name fullName surname');

      return Response.json({
         ok: true,
         link: property.shareLinks[0],
      });
   } catch (error) {
      console.error('CREATE SHARE LINK ERROR:', error);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};
