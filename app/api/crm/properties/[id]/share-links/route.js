import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

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

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const session = await getServerSession(authOptions);
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

      const link = {
         type,
         slug,
         title: body.title || (type === 'partner' ? 'Партнерська презентація' : 'Клієнтська презентація'),
         isActive: true,

         showBrand: type === 'client',
         showManagerContact: type === 'client',
         useBrandedPhotos: type === 'client',

         viewsCount: 0,
         lastViewedAt: null,

         // createdByEmployee: body.createdByEmployee || null,
         createdByEmployee: session?.user?.id || null,
      };

      property.shareLinks.unshift(link);

      await property.save();

      return Response.json({
         ok: true,
         link: property.shareLinks[0],
      });
   } catch (error) {
      console.error('CREATE SHARE LINK ERROR:', error);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};