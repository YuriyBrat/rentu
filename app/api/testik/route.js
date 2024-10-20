import connectDB from '@/config/database';
import Book from '@/models/Book';

// GET /api\properties
export const GET = async (request) => {
   try {
      await connectDB();

      const books = await Book.find({})

      return new Response(JSON.stringify(books), { status: 200 })
   } catch (error) {
      console.log("fuck error")
      console.log(error)
      return new Response('Smth wrong', {
         status: 500
      })
   }
}