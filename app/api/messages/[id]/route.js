import connectDB from "@/config/database";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";;

export const dynamic = 'force-dynamic';

//PUT /api/messages/:id

export const PUT = async (req, { params }) => {
   try {
      await connectDB();

      const { id } = params;

      const sessionUser = await getSessionUser();

      if (!sessionUser || !sessionUser.user) {
         return new Response(JSON.stringify({ message: 'You must be logged in to send a message' }), { status: 401 })
      };

      const { userId } = sessionUser;

      const message = await Message.findById(id);

      if (!message) return new Response('Message not found', { status: 404 });

      // verify ownership
      if (message.recipient.toString() !== userId) {
         return new Response('Unauthorized', { status: 401 });
      };

      // update message to read/unread depending on the current status
      message.read = !message.read;
      await message.save();

      return new Response(JSON.stringify(message), { status: 200 })

   } catch (error) {
      console.log(error);
      return new Response('Smth done wrong', { status: 401 });

   }
}

//DELETE /api/messages/:id

export const DELETE = async (req, { params }) => {
   try {
      await connectDB();

      const { id } = params;

      const sessionUser = await getSessionUser();

      if (!sessionUser || !sessionUser.user) {
         return new Response(JSON.stringify({ message: 'You must be logged in to send a message' }), { status: 401 })
      };

      const { userId } = sessionUser;

      const message = await Message.findById(id);

      if (!message) return new Response('Message not found', { status: 404 });

      // verify ownership
      if (message.recipient.toString() !== userId) {
         return new Response('Unauthorized', { status: 401 });
      };

      // delete message
      await message.deleteOne();

      return new Response('Message deleted', { status: 200 })

   } catch (error) {
      console.log(error);
      return new Response('Smth done wrong in deleting message', { status: 401 });

   }
}