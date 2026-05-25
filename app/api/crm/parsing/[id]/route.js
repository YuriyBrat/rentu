import connectDB from '@/config/database';
import LeadProperty from '@/models/LeadProperty';
import Property from '@/models/Property';

const STAGES = ['raw', 'processing', 'called', 'qualified', 'duplicate', 'fake', 'rejected', 'moved'];

function parseDate(value) {
   if (!value) return null;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? null : d;
}

function imageToPropertyImage(src, index) {
   const url = typeof src === 'string' ? src : src?.url;
   if (!url) return null;

   return {
      url,
      isMain: index === 0,
      sortOrder: index,
      stage: 'draft',
      isHidden: false,
      variants: {
         preview: url,
         card: url,
         full: url,
         branded: '',
      },
   };
}

function buildPropertyData(lead) {
   const title = lead.title?.trim() || lead.location_text?.trim() || 'Обʼєкт з парсингу';
   const images = (Array.isArray(lead.images) ? lead.images : [])
      .map(imageToPropertyImage)
      .filter(Boolean);

   return {
      title,
      type_estate: lead.type_estate || '',
      type_deal: lead.type_deal || '',
      location_text: lead.location_text || '',
      location: {
         city: lead.location?.city || '',
         street: lead.location?.street || '',
         number: lead.location?.number || '',
      },
      rooms: lead.rooms,
      square_tot: lead.square_tot,
      floor: lead.floor,
      floors: lead.floors,
      cost: lead.cost,
      currency: lead.currency || 'USD',
      description: lead.description || '',
      advantages: Array.isArray(lead.advantages) ? lead.advantages : [],
      sourceLeadId: lead._id,
      source: lead.source || 'parsing',
      actualityGroup: 'active',
      owners: lead.phone || lead.leadname || lead.email
         ? [{
            name: lead.leadname || '',
            phones: lead.phone ? [lead.phone] : [],
            emails: lead.email ? [lead.email] : [],
            status: 'active',
            isPrimary: true,
            notes: lead.reviewNote || lead.callResult || '',
         }]
         : [],
      advertisingLinks: lead.sourceUrl
         ? [{
            platform: ['olx', 'dimria', 'rieltor', 'facebook', 'instagram'].includes(lead.source)
               ? lead.source
               : 'other',
            title: lead.source || 'Джерело',
            url: lead.sourceUrl,
            status: 'active',
            sourceType: 'owner',
            note: 'Імпортовано з парсингу',
         }]
         : [],
      images,
      workHistory: [{
         type: 'note',
         tone: 'info',
         text: `Створено з бази парсингу${lead.source ? ` (${lead.source})` : ''}.`,
      }],
   };
}

export const GET = async (_request, { params }) => {
   try {
      await connectDB();

      const item = await LeadProperty.findById(params.id)
         .populate('assignedToEmployee', 'name fullName surname role')
         .populate('propertyId', 'title actualityGroup')
         .populate('duplicateOf', 'title source sourceUrl')
         .lean();

      if (!item) return new Response('Parsed property not found', { status: 404 });

      return Response.json({ item }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching parsed property', { status: 500 });
   }
};

export const PATCH = async (request, { params }) => {
   try {
      await connectDB();

      const body = await request.json();
      const item = await LeadProperty.findById(params.id);

      if (!item) return new Response('Parsed property not found', { status: 404 });

      if (body?.action === 'moveToObjects') {
         if (item.propertyId) {
            item.stage = 'moved';
            await item.save();
            return Response.json({ item, propertyId: item.propertyId }, { status: 200 });
         }

         const property = await Property.create(buildPropertyData(item));
         item.stage = 'moved';
         item.propertyId = property._id;
         item.reviewStatus = 'actual';
         item.lastCallAt = item.lastCallAt || new Date();
         await item.save();

         return Response.json({ item, property }, { status: 200 });
      }

      if (STAGES.includes(body?.stage)) item.stage = body.stage;
      if (body?.reviewStatus !== undefined) item.reviewStatus = body.reviewStatus || '';
      if (body?.callResult !== undefined) item.callResult = String(body.callResult || '').trim();
      if (body?.reviewNote !== undefined) item.reviewNote = String(body.reviewNote || '').trim();
      if (body?.lastCallAt !== undefined) item.lastCallAt = parseDate(body.lastCallAt);
      if (body?.assignedToEmployee !== undefined) item.assignedToEmployee = body.assignedToEmployee || null;
      if (body?.duplicateOf !== undefined) item.duplicateOf = body.duplicateOf || null;

      await item.save();

      const saved = await LeadProperty.findById(item._id)
         .populate('assignedToEmployee', 'name fullName surname role')
         .populate('propertyId', 'title actualityGroup')
         .populate('duplicateOf', 'title source sourceUrl')
         .lean();

      return Response.json({ item: saved }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error updating parsed property', { status: 500 });
   }
};
