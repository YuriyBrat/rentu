// import connectDB from '@/config/database';
// import Property from '@/models/Property';

// export const GET = async (req) => {
//    try {
//       await connectDB();

//       const page = Number(req.nextUrl.searchParams.get('page') || 1);
//       const pageSize = Number(req.nextUrl.searchParams.get('pageSize') || 50);

//       const skip = (page - 1) * pageSize;

//       const filter = {
//          // isPublic: true,
//          // actualityGroup: 'active',
//          // type_deal: 'продаж', // якщо у тебе інше значення, заміни тут 'sale' || 'продаж'
//          type_deal: {
//             $in: [/^продаж$/i, /^sale$/i],
//          },
//       };

//       const total = await Property.countDocuments(filter);

//       const rawProperties = await Property.find(filter)
//          .sort({ createdAt: -1 })
//          .skip(skip)
//          .limit(pageSize)
//          .lean();

//       const properties = rawProperties.map((item) => {
//          const mainImage =
//             item.images?.find((img) => img?.isMain)?.variants?.card ||
//             item.images?.find((img) => img?.isMain)?.url ||
//             item.images?.[0]?.variants?.card ||
//             item.images?.[0]?.url ||
//             '/background/bg1.jpg';

//          const imageList =
//             item.images?.length > 0
//                ? item.images.map((img) => img?.variants?.full || img?.url).filter(Boolean)
//                : [];

//          return {
//             _id: item._id.toString(),
//             title: item.title || '',
//             cost: item.cost ?? '',
//             currency: item.currency || 'USD',
//             location_text:
//                item.location_text ||
//                [item.location?.city, item.location?.street, item.location?.number]
//                   .filter(Boolean)
//                   .join(', '),
//             rooms: item.rooms ?? '',
//             square_tot: item.square_tot ?? '',
//             floor: item.floor ?? '',
//             floors: item.floors ?? '',
//             type_walls: item.type_walls || '',
//             images: imageList,
//             mainImage,
//             createdAt: item.createdAt,
//          };
//       });

//       return new Response(
//          JSON.stringify({
//             total,
//             properties,
//             page,
//             pageSize,
//          }),
//          { status: 200 }
//       );
//    } catch (error) {
//       console.log(error);
//       return new Response(
//          JSON.stringify({
//             message: 'Smth wrong',
//             error: String(error),
//          }),
//          { status: 500 }
//       );
//    }
// };

import connectDB from '@/config/database';
import Property from '@/models/Property';

function getBestCardImage(img) {
   return (
      img?.variants?.branded ||
      img?.brandedUrl ||
      img?.variants?.card ||
      img?.processedUrl ||
      img?.url ||
      ''
   );
}

function getBestFullImage(img) {
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

export const GET = async (req) => {
   try {
      await connectDB();

      const page = Number(req.nextUrl.searchParams.get('page') || 1);
      const pageSize = Number(req.nextUrl.searchParams.get('pageSize') || 50);
      const skip = (page - 1) * pageSize;

      const filter = {
         // isPublic: true,
         // actualityGroup: 'active',
         type_deal: {
            $in: [/^\s*продаж\s*$/i, /^\s*sale\s*$/i],
         },
      };

      const total = await Property.countDocuments(filter);

      const rawProperties = await Property.find(filter)
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      const properties = rawProperties.map((item) => {
         const visibleImages = getVisibleSortedImages(item.images || []);
         const main = visibleImages.find((img) => img?.isMain) || visibleImages[0];

         const mainImage = getBestCardImage(main) || '/background/bg1.jpg';

         const imageList =
            visibleImages.length > 0
               ? visibleImages.map((img) => getBestFullImage(img)).filter(Boolean)
               : [];

         return {
            _id: item._id.toString(),
            title: item.title || '',
            cost: item.cost ?? '',
            currency: item.currency || 'USD',
            location_text:
               item.location_text ||
               [item.location?.city, item.location?.street, item.location?.number]
                  .filter(Boolean)
                  .join(', '),
            rooms: item.rooms ?? '',
            square_tot: item.square_tot ?? '',
            floor: item.floor ?? '',
            floors: item.floors ?? '',
            type_walls: item.type_walls || '',
            images: imageList,
            mainImage,
            createdAt: item.createdAt,
         };
      });

      return new Response(
         JSON.stringify({
            total,
            properties,
            page,
            pageSize,
         }),
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