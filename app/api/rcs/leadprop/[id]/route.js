import connectDB from '@/config/database';
import Property from '@/models/Property';
import LeadProperty from '@/models/LeadProperty';
import { getSessionUser } from '@/utils/getSessionUser';

// GET /api/properties/:id
export const GET = async (request, { params }) => {
   try {
      await connectDB();

      const propObj = await LeadProperty.findById(params.id);
      if (!propObj) return new Response(`Об'єкт не знайдено у базі`, {
         status: 404
      });

      const dataSend = { propObj }

      return new Response(JSON.stringify(dataSend), { status: 200 })
   } catch (error) {
      console.log(error)
      return new Response(`Помилка у знаходженні об'єкту в базі`, {
         status: 500
      })
   }
};