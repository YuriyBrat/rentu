import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

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

function buildLeadSearch(q) {
   const safeQ = escapeRegex(q);
   const phoneRegex = phoneRegexFromDigits(q);
   const or = [
      { name: { $regex: safeQ, $options: 'i' } },
      { phones: { $elemMatch: { $regex: safeQ, $options: 'i' } } },
      { 'phones.number': { $regex: safeQ, $options: 'i' } },
      { emails: { $elemMatch: { $regex: safeQ, $options: 'i' } } },
      { requestSummary: { $regex: safeQ, $options: 'i' } },
      { sourceObject: { $regex: safeQ, $options: 'i' } },
   ];

   if (phoneRegex) {
      or.push({ phones: { $elemMatch: { $regex: phoneRegex, $options: 'i' } } });
      or.push({ 'phones.number': { $regex: phoneRegex, $options: 'i' } });
   }

   if (Types.ObjectId.isValid(q)) {
      or.push({ _id: q });
   }

   return { $or: or };
}

function buildPropertySearch(q) {
   const safeQ = escapeRegex(q);
   const or = [
      { title: { $regex: safeQ, $options: 'i' } },
      { 'rentOptions.rentTitle': { $regex: safeQ, $options: 'i' } },
      { 'rentOptions.currency': { $regex: safeQ, $options: 'i' } },
      { location_text: { $regex: safeQ, $options: 'i' } },
      { 'location.city': { $regex: safeQ, $options: 'i' } },
      { 'location.street': { $regex: safeQ, $options: 'i' } },
      { 'location.number': { $regex: safeQ, $options: 'i' } },
      { 'owners.name': { $regex: safeQ, $options: 'i' } },
      { 'owners.phones': { $regex: safeQ, $options: 'i' } },
   ];

   const asNumber = Number(String(q || '').replace(/\s/g, ''));
   if (Number.isFinite(asNumber) && asNumber > 0) {
      or.push({ cost: asNumber });
      or.push({ 'rentOptions.price': asNumber });
   }

   if (Types.ObjectId.isValid(q)) {
      or.push({ _id: q }, { sourceLeadId: q });
   }

   return { $or: or };
}

export const GET = async (req) => {
   try {
      const sessionUser = await getSessionUser().catch(() => null);
      if (!sessionUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      await connectDB();

      const sp = req.nextUrl.searchParams;
      const target = (sp.get('target') || 'leads').trim();
      const q = (sp.get('q') || '').trim();
      const limit = Math.min(Math.max(parseInt(sp.get('limit') || '10', 10), 1), 20);
      const deal = (sp.get('deal') || '').trim();

      if (target === 'properties') {
         const dealFilter = deal === 'rent'
            ? { type_deal: 'оренда' }
            : { type_deal: { $ne: 'оренда' } };
         const filter = {
            ...dealFilter,
            ...(q ? buildPropertySearch(q) : {}),
         };
         const items = await Property.find(filter)
            .select('_id title rentOptions.rentTitle rentOptions.price rentOptions.currency location_text location type_estate type_deal cost currency updatedAt createdAt')
            .sort({ updatedAt: -1, createdAt: -1 })
            .limit(limit)
            .lean();

         return Response.json({ items }, { status: 200 });
      }

      const filter = {
         isArchived: { $ne: true },
         ...(q ? buildLeadSearch(q) : {}),
      };
      const items = await Lead.find(filter)
         .select('_id name phones emails stage status leadKind requestSummary sourceObject updatedAt createdAt')
         .sort({ lastActualizedAt: -1, updatedAt: -1, createdAt: -1 })
         .limit(limit)
         .lean();

      return Response.json({ items }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error searching document generation links', { status: 500 });
   }
};
