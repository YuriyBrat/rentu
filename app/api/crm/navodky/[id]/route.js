import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import mongoose from 'mongoose';
import Navodka from '@/models/Navodka';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

function isValidObjectId(id) {
   return mongoose.Types.ObjectId.isValid(id);
}

export const GET = async (_, { params }) => {
   try {
      await connectDB();

      const { id } = params;

      if (!isValidObjectId(id)) {
         return NextResponse.json({ error: 'Некоректний id' }, { status: 400 });
      }

      const item = await Navodka.findById(id).lean();

      if (!item) {
         return NextResponse.json({ error: 'Наводку не знайдено' }, { status: 404 });
      }

      return NextResponse.json(item);
   } catch (error) {
      console.error('GET /api/crm/navodky/[id] error:', error);
      return NextResponse.json({ error: 'Помилка отримання наводки' }, { status: 500 });
   }
};

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const session = await getServerSession(authOptions);

      const currentEmployeeId =
         session?.user?.employeeId && !session?.user?.isFallbackAdmin
            ? session.user.employeeId
            : null;

      const { id } = params;

      if (!isValidObjectId(id)) {
         return NextResponse.json({ error: 'Некоректний id' }, { status: 400 });
      }

      const body = await req.json();

      const update = {};

      const fields = [
         'title',
         'ownerName',
         'phone',
         'source',
         'status',
         'readiness',
         'propertyType',
         'locationText',
         'priceExpectation',
         'description',
         'lastContactAt',
         'nextContactAt',
         'assignedTo',
         'assignedTo'
      ];

      for (const field of fields) {
         if (field in body) {
            update[field] = body[field];
         }
      }

      const item = await Navodka.findById(id);

      if (!item) {
         return NextResponse.json({ error: 'Наводку не знайдено' }, { status: 404 });
      }

      Object.assign(item, update);


      if (body?.newNote?.text?.trim()) {
         const note = {
            text: body.newNote.text.trim(),
            type: body.newNote.type || 'info',
            activityType: body.newNote.activityType || 'note',
            contactDate: body.newNote.contactDate || null,
            nextContactAt: body.newNote.nextContactAt || null,
            createdBy: currentEmployeeId
         };

         item.notes.push(note);

         const isRealContact = ['call', 'message', 'meeting'].includes(note.activityType);

         if (isRealContact && note.contactDate) {
            item.lastContactAt = note.contactDate;
         }

         if (note.nextContactAt) {
            item.nextContactAt = note.nextContactAt;
         }
      }

      await item.save();

      return NextResponse.json(item);
   } catch (error) {
      console.error('PATCH /api/crm/navodky/[id] error:', error);
      return NextResponse.json({ error: 'Не вдалося оновити наводку' }, { status: 500 });
   }
};

export const DELETE = async (_, { params }) => {
   try {
      await connectDB();

      const { id } = params;

      if (!isValidObjectId(id)) {
         return NextResponse.json({ error: 'Некоректний id' }, { status: 400 });
      }

      const deleted = await Navodka.findByIdAndDelete(id);

      if (!deleted) {
         return NextResponse.json({ error: 'Наводку не знайдено' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
   } catch (error) {
      console.error('DELETE /api/crm/navodky/[id] error:', error);
      return NextResponse.json({ error: 'Не вдалося видалити наводку' }, { status: 500 });
   }
};