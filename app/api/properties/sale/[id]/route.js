import connectDB from '@/config/database';
import Property from '@/models/Property';

function getBestImage(img) {
   return (
      img?.variants?.branded ||
      img?.brandedUrl ||
      img?.variants?.full ||
      img?.processedUrl ||
      img?.url ||
      ''
   );
}

function getVisibleSortedImages(images = []) {
   return images
      .filter((img) => img && typeof img === 'object' && !img?.isHidden)
      .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));
}

function normalizePublicSaleProperty(item) {
   const visibleImages = getVisibleSortedImages(item.images || []);
   const imageList = visibleImages.map((img) => getBestImage(img)).filter(Boolean);

   return {
      _id: item._id.toString(),
      title: item.title || '',
      cost: item.cost ?? '',
      currency: item.currency || 'USD',
      description: item.description || '',
      location_text:
         item.location_text ||
         [item.location?.city, item.location?.street, item.location?.number]
            .filter(Boolean)
            .join(', '),
      rooms: item.rooms ?? '',
      square_tot: item.square_tot ?? '',
      square_liv: item.square_liv ?? '',
      square_kit: item.square_kit ?? '',
      floor: item.floor ?? '',
      floors: item.floors ?? '',
      type_walls: item.type_walls || '',
      type_building: item.type_building || '',
      type_house: item.type_house || '',
      type_estate: item.type_estate || '',
      advantages: Array.isArray(item.advantages) ? item.advantages : [],
      visualTags: {
         isHot: !!item.visualTags?.isHot,
         isFavorite: !!item.visualTags?.isFavorite,
      },
      images: imageList,
      mainImage: imageList[0] || '/background/bg1.jpg',
      createdAt: item.createdAt,
   };
}

export const GET = async (_request, { params }) => {
   try {
      await connectDB();

      const propObj = await Property.findOne({
         _id: params.id,
         isPublic: true,
         type_deal: {
            $in: [/^\s*продаж\s*$/i, /^\s*sale\s*$/i],
         },
      }).lean();

      if (!propObj) {
         return new Response(JSON.stringify({ message: 'Property not found' }), {
            status: 404,
         });
      }

      return new Response(
         JSON.stringify({ propObj: normalizePublicSaleProperty(propObj) }),
         { status: 200 }
      );
   } catch (error) {
      console.log(error);
      return new Response(
         JSON.stringify({
            message: 'Smth wrong',
            error: String(error),
         }),
         { status: 500 }
      );
   }
};
