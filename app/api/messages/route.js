import connectDB from "@/config/database";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = 'force-dynamic';

// GET /api/messages

export const GET = async () => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser();

      if (!sessionUser || !sessionUser.user) {
         return new Response(JSON.stringify({ message: 'Use ID is required' }), { status: 401 })
      };

      const { userId } = sessionUser;
      const readMessages = await Message.find({ recipient: userId, read: true })
         .sort({ creatdAt: -1 }) //sort read messages in asc order
         .populate('sender', 'username')
         .populate('property', 'name')
      const unreadMessages = await Message.find({ recipient: userId, read: false })
         .sort({ creatdAt: -1 }) //sort read messages in asc order
         .populate('sender', 'username')
         .populate('property', 'name')

      const messages = [...unreadMessages, ...readMessages]

      return new Response(JSON.stringify(messages), { status: 200 })
   } catch (error) {
      console.log(error);
      return new Response(JSON.stringify({ message: 'Smth done wrong' }), { status: 500 })
   }
}

// POST /api/messages
export const POST = async req => {
   try {

      await connectDB();
      const reqData = await req.json();
      const { name, email, phone, message, property, recipient } = reqData;

      const sessionUser = await getSessionUser();

      if (!sessionUser || !sessionUser.user) {
         return new Response(JSON.stringify({ message: 'You must be logged in to send a message' }), { status: 401 })
      };

      const { user } = sessionUser;

      // can not send mesage to self
      if (user.id === recipient) {
         console.log('it`s me who receive my message');

         return new Response(JSON.stringify({ message: 'Can not send a message to yourself' }), { status: 400 })
      };

      const newMessage = new Message({
         name,
         sender: user.id,
         recipient,
         property,
         email,
         phone,
         body: message
      });

      await newMessage.save();

      return new Response(JSON.stringify({ message: 'Message sent' }), { status: 200 })

   } catch (error) {
      console.log(error);
      return new Response(JSON.stringify({ message: 'Smth done wrong' }), { status: 500 })
   }
}