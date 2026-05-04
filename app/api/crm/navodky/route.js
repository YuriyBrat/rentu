import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import Navodka from '@/models/Navodka';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;

      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '20', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const q = (sp.get('q') || '').trim();
      const status = (sp.get('status') || '').trim();
      const contactFilter = (sp.get('contactFilter') || '').trim();

      const filter = {};

      if (q) {
         filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { ownerName: { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } },
            { locationText: { $regex: q, $options: 'i' } },
            { source: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
         ];
      }

      if (status && status !== 'all') {
         filter.status = status;
      }

      if (contactFilter && contactFilter !== 'all') {
         const today = new Date();
         today.setHours(0, 0, 0, 0);

         const tomorrow = new Date(today);
         tomorrow.setDate(tomorrow.getDate() + 1);

         if (contactFilter === 'today') {
            filter.nextContactAt = { $gte: today, $lt: tomorrow };
         }

         if (contactFilter === 'overdue') {
            filter.nextContactAt = { $lt: today };
         }

         if (contactFilter === 'planned') {
            filter.nextContactAt = { $gte: tomorrow };
         }
      }

      const total = await Navodka.countDocuments(filter);

      const items = await Navodka.find(filter)
         .populate('assignedTo', 'name firstName lastName email phone avatar')
            .populate('createdBy', 'name firstName lastName email phone avatar')
   .populate('notes.createdBy', 'name firstName lastName email phone avatar')
         .sort({ nextContactAt: 1, updatedAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      return NextResponse.json({
         items,
         pagination: {
            total,
            page,
            pageSize,
            pages: Math.ceil(total / pageSize)
         }
      });
   } catch (error) {
      console.error('GET /api/crm/navodky error:', error);
      return NextResponse.json(
         { error: 'Не вдалося отримати список наводок' },
         { status: 500 }
      );
   }
};

export const POST = async (req) => {
   try {
      await connectDB();

      const session = await getServerSession(authOptions);

      const createdBy =
         session?.user?.employeeId && !session?.user?.isFallbackAdmin
            ? session.user.employeeId
            : null;

      const body = await req.json();

      const payload = {
         title: body?.title?.trim(),
         ownerName: body?.ownerName?.trim(),
         phone: body?.phone?.trim(),
         source: body?.source?.trim() || '',
         status: body?.status || 'active',
         readiness: body?.readiness || 'unknown',
         propertyType: body?.propertyType?.trim() || '',
         locationText: body?.locationText?.trim() || '',
         priceExpectation: body?.priceExpectation?.trim() || '',
         description: body?.description?.trim() || '',
         lastContactAt: body?.lastContactAt || null,
         nextContactAt: body?.nextContactAt || null,

         assignedTo: body?.assignedTo || null,
         createdBy // body?.createdBy || null,
      };

      if (!payload.title) {
         return NextResponse.json({ error: 'Назва обов’язкова' }, { status: 400 });
      }

      if (!payload.ownerName) {
         return NextResponse.json({ error: 'Ім’я власника обов’язкове' }, { status: 400 });
      }

      if (!payload.phone) {
         return NextResponse.json({ error: 'Телефон обов’язковий' }, { status: 400 });
      }

      const created = await Navodka.create(payload);

      return NextResponse.json(created, { status: 201 });
   } catch (error) {
      console.error('POST /api/crm/navodky error:', error);
      return NextResponse.json(
         { error: 'Не вдалося створити наводку' },
         { status: 500 }
      );
   }
};