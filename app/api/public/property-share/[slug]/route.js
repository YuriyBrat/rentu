import connectDB from '@/config/database';
import Property from '@/models/Property';
import Employee from '@/models/Employee';

export const GET = async (req, { params }) => {
   try {
      await connectDB();

      const property = await Property.findOne({
         'shareLinks.slug': params.slug,
         'shareLinks.isActive': true,
      })
         .populate('assignee', 'name fullName surname phone email avatar position')
         .lean();

      if (!property) {
         return Response.json({ error: 'Not found' }, { status: 404 });
      }

      const shareLink = property.shareLinks.find((l) => l.slug === params.slug);

      if (!shareLink || !shareLink.isActive) {
         return Response.json({ error: 'Not found' }, { status: 404 });
      }

      await Property.updateOne(
         { _id: property._id, 'shareLinks.slug': params.slug },
         {
            $inc: { 'shareLinks.$.viewsCount': 1 },
            $set: { 'shareLinks.$.lastViewedAt': new Date() },
         }
      );

      const images = (property.images || [])
         .filter((img) => !img.isHidden)
         .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
         .map((img) => {
            const url = shareLink.useBrandedPhotos
               ? img.brandedUrl || img.variants?.branded || img.processedUrl || img.url
               : img.processedUrl || img.variants?.card || img.url;

            return {
               url,
               width: img.width,
               height: img.height,
               isMain: img.isMain,
            };
         });

      return Response.json({
         ok: true,
         share: {
            type: shareLink.type,
            title: shareLink.title,
            presentationType: shareLink.presentationType || 'classic',
            showBrand: shareLink.showBrand,
            showManagerContact: shareLink.showManagerContact,
            reactions: shareLink.reactions || [],
         },
         property: {
            title: property.title,
            price: property.cost,
            currency: property.currency,
            location_text: property.location_text,
            rooms: property.rooms,
            square_tot: property.square_tot,
            square_liv: property.square_liv,
            square_kit: property.square_kit,
            floor: property.floor,
            floors: property.floors,
            type_estate: property.type_estate,
            type_walls: property.type_walls,
            type_building: property.type_building,
            description: property.description,
            advantages: property.advantages || [],
            images,
            assignee: shareLink.showManagerContact ? property.assignee : null,
            advertisingTexts: property.advertisingTexts || [],


            propertyVideos: property.propertyVideos || [],
         },
      });
   } catch (error) {
      console.error('PUBLIC SHARE GET ERROR:', error);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};