// import connectDB from '@/config/database';
// import Property from '@/models/Property';

// export const POST = async (req, { params }) => {
//    try {
//       await connectDB();

//       const body = await req.json();

//       const reactionsMap = {
//          view: '👀 Хочу оглянути',
//          like: '❤️ Подобається',
//          think: '🤔 Подумаю',
//          reject: '🙅 Не моє',
//       };

//       if (!reactionsMap[body.type]) {
//          return Response.json({ error: 'Bad reaction' }, { status: 400 });
//       }

//       await Property.updateOne(
//          { 'shareLinks.slug': params.slug },
//          {
//             $push: {
//                'shareLinks.$.reactions': {
//                   type: body.type,
//                   label: reactionsMap[body.type],
//                   createdAt: new Date(),
//                },
//             },
//          }
//       );

//       return Response.json({ ok: true });
//    } catch (error) {
//       console.error('REACTION ERROR:', error);
//       return Response.json({ error: 'Server error' }, { status: 500 });
//    }
// };


import connectDB from '@/config/database';
import Property from '@/models/Property';

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();

      const reactionsMap = {
         view: '👀 Хочу оглянути',
         like: '❤️ Подобається',
         think: '🤔 Подумаю',
         reject: '🙅 Не моє',
      };

      if (!reactionsMap[body.type]) {
         return Response.json({ error: 'Bad reaction' }, { status: 400 });
      }

      const clientId = body.clientId || 'unknown';

      await Property.updateOne(
         { 'shareLinks.slug': params.slug },
         {
            $pull: {
               'shareLinks.$.reactions': {
                  clientId,
               },
            },
         }
      );

      await Property.updateOne(
         { 'shareLinks.slug': params.slug },
         {
            $push: {
               'shareLinks.$.reactions': {
                  type: body.type,
                  label: reactionsMap[body.type],
                  clientId,
                  createdAt: new Date(),
               },
            },
         }
      );

      return Response.json({ ok: true });
   } catch (error) {
      console.error('REACTION ERROR:', error);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};