import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import Employee from '@/models/Employee';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

const STAGE_ORDER = ['lead', 'hot', 'ps', 'rs', 'ds', 'pzs', 'zs', 'pers'];

function escapeRegex(value) {
   return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function digitsOnly(value) {
   return String(value || '').replace(/\D/g, '');
}

function phoneRegexFromDigits(value) {
   const digits = digitsOnly(value);
   if (digits.length < 2) return '';
   return digits.split('').map(escapeRegex).join('\\D*');
}

function parseDate(value) {
   if (!value) return undefined;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseNumber(value) {
   if (value === undefined || value === null || value === '') return undefined;
   const n = Number(value);
   return Number.isNaN(n) ? undefined : n;
}

function cleanString(value) {
   return String(value || '').trim();
}

function objectIdOrUndefined(value) {
   const id = cleanString(value);
   return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;
}

function propertyLabel(property) {
   const isRent = property?.type_deal === 'оренда' || (Boolean(property?.statusRent) && property.statusRent !== 'rentNo');
   if (isRent && property?.rentOptions?.rentTitle) return property.rentOptions.rentTitle;
   return property?.title || property?.rentOptions?.rentTitle || property?.location_text || '';
}

export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;

      const q = (sp.get('q') || '').trim();
      const stage = (sp.get('stage') || '').trim();
      const stageMin = (sp.get('stageMin') || '').trim();
      const actuality = (sp.get('actuality') || '').trim();
      const searchFields = (sp.get('searchFields') || '').trim();
      const status = (sp.get('status') || '').trim();
      const leadKind = (sp.get('leadKind') || '').trim();
      const assignee = objectIdOrUndefined(sp.get('assignee'));
      const crmGeneratorOwner = objectIdOrUndefined(sp.get('crmGeneratorOwner'));
      const createdFrom = (sp.get('createdFrom') || '').trim();
      const createdByEmployee = objectIdOrUndefined(sp.get('createdByEmployee'));
      const attractedProperty = objectIdOrUndefined(sp.get('attractedProperty') || sp.get('property'));
      const advertisingLinkId = objectIdOrUndefined(sp.get('advertisingLinkId'));

      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '20', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const filter = { isArchived: { $ne: true } };

      if (stage && stage !== 'all') {
         filter.stage = stage;
      } else if (stageMin && STAGE_ORDER.includes(stageMin)) {
         filter.stage = { $in: STAGE_ORDER.slice(STAGE_ORDER.indexOf(stageMin)) };
      }

      if (status && status !== 'all') {
         filter.status = status;
      }

      if (leadKind && leadKind !== 'all') {
         filter.leadKind = leadKind;
      }

      if (assignee) {
         filter.assignee = assignee;
      }

      if (crmGeneratorOwner) {
         filter.$and = [
            ...(Array.isArray(filter.$and) ? filter.$and : []),
            {
               $or: [
                  { assignee: crmGeneratorOwner },
                  { createdByEmployee: crmGeneratorOwner },
               ],
            },
         ];
      }

      if (createdFrom && createdFrom !== 'all') {
         filter.createdFrom = createdFrom;
      }

      if (createdByEmployee) {
         filter.createdByEmployee = createdByEmployee;
      }

      if (attractedProperty) {
         filter.attractedProperty = attractedProperty;
      }

      if (advertisingLinkId) {
         filter.advertisingLinkId = advertisingLinkId;
      }

      if (actuality === 'active') {
         filter.actualityStatus = { $regex: '^Актуальний\\.', $options: 'i' };
      }

      if (q) {
         const safeQ = escapeRegex(q);
         const phoneRegex = phoneRegexFromDigits(q);
         const identitySearch = [
            { name: { $regex: safeQ, $options: 'i' } },
            { phones: { $elemMatch: { $regex: safeQ, $options: 'i' } } },
            { 'phones.number': { $regex: safeQ, $options: 'i' } },
            { emails: { $elemMatch: { $regex: safeQ, $options: 'i' } } },
         ];

         if (phoneRegex) {
            identitySearch.push({ phones: { $elemMatch: { $regex: phoneRegex, $options: 'i' } } });
            identitySearch.push({ 'phones.number': { $regex: phoneRegex, $options: 'i' } });
         }

         if (Types.ObjectId.isValid(q)) {
            identitySearch.push({ _id: q });
         }

         filter.$or = searchFields === 'identity'
            ? identitySearch
            : [
               ...identitySearch,
               { requestSummary: { $regex: safeQ, $options: 'i' } },
               { sourceChannel: { $regex: safeQ, $options: 'i' } },
               { sourceObject: { $regex: safeQ, $options: 'i' } },
               { sourceNote: { $regex: safeQ, $options: 'i' } },
               { actualityStatus: { $regex: safeQ, $options: 'i' } },
               { createdByName: { $regex: safeQ, $options: 'i' } },
            ];
      }

      const total = await Lead.countDocuments(filter);

      const items = await Lead.find(filter)
         .populate('assignee', 'name role')
         .populate('createdByEmployee', 'name role')
         .populate('attractedProperty', 'title rentOptions.rentTitle location_text type_deal cost currency')
         // .sort({ updatedAt: -1 })
         .sort({ lastActualizedAt: -1, createdAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      return Response.json({ items, total, page, pageSize }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching leads', { status: 500 });
   }
};

export const POST = async (request) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const body = await request.json();
      const actorEmployeeId = objectIdOrUndefined(body?.createdByEmployee || sessionUser?.employeeId);

      const phones = Array.isArray(body?.phones)
         ? body.phones.map((x) => String(x || '').trim()).filter(Boolean)
         : [];

      const emails = Array.isArray(body?.emails)
         ? body.emails.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean)
         : [];

      let createdByEmployeeName = '';
      if (actorEmployeeId) {
         const emp = await Employee.findById(actorEmployeeId).select('name').lean();
         createdByEmployeeName = emp?.name || '';
      }

      const attractedPropertyId = objectIdOrUndefined(body?.attractedProperty || body?.property);
      const requestedAdvertisingLinkId = objectIdOrUndefined(body?.advertisingLinkId);
      let attractedProperty = null;
      let advertisingLink = null;

      if (attractedPropertyId) {
         attractedProperty = await Property.findById(attractedPropertyId)
            .select('title rentOptions.rentTitle location_text type_deal cost currency advertisingLinks assignee')
            .lean();
         if (requestedAdvertisingLinkId) {
            advertisingLink = (attractedProperty?.advertisingLinks || []).find((link) => String(link?._id || '') === String(requestedAdvertisingLinkId));
         }
      }

      const notes = Array.isArray(body?.notes)
         ? body.notes
            .map((note) => ({
               text: String(note?.text || '').trim(),
               type: ['positive', 'negative', 'info', 'important'].includes(note?.type)
                  ? note.type
                  : 'info',
               createdByEmployee: actorEmployeeId || undefined,
               createdByName: createdByEmployeeName,
               createdAt: parseDate(note?.createdAt) || new Date(),
            }))
            .filter((x) => x.text)
         : [];

      // duplicate check by phone/email
      let duplicate = null;
      if (phones.length || emails.length) {
         duplicate = await Lead.findOne({
            isArchived: { $ne: true },
            $or: [
               ...(phones.length ? [{ phones: { $in: phones } }] : []),
               ...(emails.length ? [{ emails: { $in: emails } }] : []),
            ],
         })
            .select('_id name stage assignee updatedAt')
            .lean();
      };

      const leadAppearedAt = parseDate(body?.leadAppearedAt) || new Date();
      const lastActualizedAt = parseDate(body?.lastActualizedAt) || leadAppearedAt;

      const leadData = {
         name: String(body?.name || '').trim(),
         phones,
         emails,

         status: body?.status || 'lead',
         stage: body?.stage || 'lead',

         requestSummary: String(body?.requestSummary || '').trim(),
         leadKind: body?.leadKind === 'rent' ? 'rent' : 'sale',
         budgetMax: parseNumber(body?.budgetMax),
         budgetCurrency: ['USD', 'EUR', 'UAH'].includes(body?.budgetCurrency) ? body.budgetCurrency : 'USD',

          sourceChannel: cleanString(body?.sourceChannel || advertisingLink?.platform || body?.advertisingPlatform),
          sourceObject: cleanString(body?.sourceObject || propertyLabel(attractedProperty)),
          sourceNote: String(body?.sourceNote || '').trim(),
          attractedProperty: attractedProperty?._id || undefined,
          advertisingLinkId: advertisingLink?._id || requestedAdvertisingLinkId || undefined,
          advertisingPlatform: cleanString(body?.advertisingPlatform || advertisingLink?.platform),
          advertisingLinkTitle: cleanString(body?.advertisingLinkTitle || advertisingLink?.title),
          advertisingLinkUrl: cleanString(body?.advertisingLinkUrl || advertisingLink?.url),
          createdFrom: ['manual', 'advertising', 'import', 'system'].includes(body?.createdFrom) ? body.createdFrom : 'manual',

         actualityStatus: body?.actualityStatus || 'Актуальний. Продзвін',
         // lastActualizedAt: parseDate(body?.lastActualizedAt),
         lastContactAt: parseDate(body?.lastContactAt),

          assignee: body?.assignee || attractedProperty?.assignee || undefined,
          createdByEmployee: actorEmployeeId || undefined,
         // createdByName:
         //    String(body?.createdByName || sessionUser?.name || '').trim(),

         notes,

         duplicateState: duplicate ? 'possible' : '',
         duplicateOf: duplicate?._id || undefined,

         leadAppearedAt,
         lastActualizedAt,
      };

      if (!leadData.name) {
         return Response.json({ error: 'name required' }, { status: 400 });
      }

      const created = await Lead.create(leadData);

      const item = await Lead.findById(created._id)
         .populate('assignee', 'name role')
         .populate('createdByEmployee', 'name role')
         .populate('attractedProperty', 'title rentOptions.rentTitle location_text type_deal cost currency')
         .lean();

      return Response.json(
         {
            item,
            duplicate: duplicate
               ? {
                  _id: duplicate._id,
                  name: duplicate.name,
                  stage: duplicate.stage,
                  assignee: duplicate.assignee,
                  updatedAt: duplicate.updatedAt,
               }
               : null,
         },
         { status: 201 }
      );
   } catch (error) {
      console.error(error);
      return new Response('Error creating lead', { status: 500 });
   }
};
