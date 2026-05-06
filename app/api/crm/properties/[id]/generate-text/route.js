import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const session = await getServerSession(authOptions);
      const body = await req.json();

      const property = await Property.findById(params.id);
      if (!property) {
         return Response.json({ error: 'Not found' }, { status: 404 });
      }

      const style = body.style || 'short';

      const prompt = `
Згенеруй текст оголошення українською для нерухомості.

Тип: ${property.type_deal === 'sale' ? 'Продаж' : 'Оренда'}
Назва: ${property.title}
Локація: ${property.location_text}
Кімнати: ${property.rooms}
Площа: ${property.square_tot}
Поверх: ${property.floor}/${property.floors}
Ціна: ${property.cost} ${property.currency}
Опис: ${property.description}

Стиль: ${style}

Вимоги:
- коротко і структуровано
- з емодзі
- не більше 6-8 рядків
- продаючий текст
`;

      const completion = await openai.chat.completions.create({
         model: 'gpt-4o-mini',
         messages: [{ role: 'user', content: prompt }],
      });

      const text = completion.choices[0]?.message?.content?.trim();

      // 🔥 записуємо в історію
      // property.advertisingTexts.unshift({
      //    title: `AI текст (${style})`,
      //    text,
      //    status: 'draft',
      //    createdByEmployee: session?.user?.id || null,
      // });

      // await property.save();

      return Response.json({ ok: true, text });
   } catch (e) {
      console.error(e);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};