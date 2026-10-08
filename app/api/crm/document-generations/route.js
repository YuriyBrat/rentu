import connectDB from '@/config/database';
import DocumentGeneration from '@/models/DocumentGeneration';
import { getSessionUser } from '@/utils/getSessionUser';
import { getEmployeeScopeIds, isElevatedCrmUser } from '@/utils/crm/accessControl';
import { logDocumentGenerationActivity } from '@/utils/crm/documentGenerationActivity';
import { Types } from 'mongoose';

function objectIdOrNull(value) {
   const id = String(value || '').trim();
   return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
}

function buildDocumentAccessFilter(sessionUser, scopeIds = []) {
   if (isElevatedCrmUser(sessionUser)) return {};

   const scopedObjectIds = scopeIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

   return scopedObjectIds.length
      ? { generatedByEmployee: { $in: scopedObjectIds } }
      : { _id: null };
}

export const GET = async (req) => {
   try {
      const sessionUser = await getSessionUser().catch(() => null);
      if (!sessionUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      await connectDB();

      const sp = req.nextUrl.searchParams;
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '50', 10), 1), 100);
      const documentDomain = (sp.get('documentDomain') || '').trim();

      const scopeIds = await getEmployeeScopeIds(sessionUser);
      const filter = buildDocumentAccessFilter(sessionUser, scopeIds);

      if (documentDomain) {
         filter.documentDomain = documentDomain;
      }

      const items = await DocumentGeneration.find(filter)
         .populate('generatedByEmployee', 'name role')
         .populate('property', 'title rentOptions.rentTitle location_text type_estate type_deal cost currency')
         .populate('lead', 'name phones stage status')
         .sort({ generatedAt: -1, createdAt: -1 })
         .limit(pageSize)
         .lean();

      return Response.json({ items }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching document generations', { status: 500 });
   }
};

export const POST = async (req) => {
   try {
      const sessionUser = await getSessionUser().catch(() => null);
      if (!sessionUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      await connectDB();

      const body = await req.json();
      const fieldsData = body?.fieldsData || {};
      const requestedType = String(body?.documentType || '').trim();
      const rentTypes = ['rent_contract', 'rent_deposit', 'rent_service'];
      const saleTypes = ['sale_deposit', 'sale_buyer_service', 'sale_seller_service'];
      const isRent = rentTypes.includes(requestedType) || body?.documentDomain === 'rent';
      const documentDomain = isRent ? 'rent' : 'sale';
      const documentType = isRent
         ? (rentTypes.includes(requestedType) ? requestedType : 'rent_contract')
         : (saleTypes.includes(requestedType) ? requestedType : 'sale_deposit');

      const created = await DocumentGeneration.create({
         documentDomain,
         documentType,
         generatedAt: new Date(),
         generatedByEmployee: objectIdOrNull(sessionUser.employeeId),
         generatedByName: sessionUser?.user?.name || '',
         generatedByRole: sessionUser?.role || '',
         property: objectIdOrNull(body?.propertyId),
         lead: objectIdOrNull(body?.leadId),
         fileName: body?.fileName || '',
         fopName: isRent ? '' : fieldsData?.nameFOP || '',
         contractNumber: isRent ? '' : fieldsData?.numberZS || '',
         contractDateText: isRent ? fieldsData?.contractDate || '' : fieldsData?.dateZS || '',
         source: isRent ? 'crm_gen_rent' : 'crm_gen_sale',
         fieldsSnapshot: fieldsData,
      });

      const item = await DocumentGeneration.findById(created._id)
         .populate('generatedByEmployee', 'name role')
         .populate('property', 'title rentOptions.rentTitle location_text type_estate type_deal cost currency')
         .populate('lead', 'name phones stage status')
         .lean();

      await logDocumentGenerationActivity({
         sessionUser,
         item,
         action: 'created',
         source: 'api',
         message: isRent ? 'Збережено договір оренди в реєстрі' : 'Збережено договір продажу в реєстрі',
         extraMeta: { eventKind: 'registry_saved' },
      });

      return Response.json({ item }, { status: 201 });
   } catch (error) {
      console.error(error);
      return new Response('Error saving document generation', { status: 500 });
   }
};
