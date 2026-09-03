import { getServerSession } from 'next-auth';
import connectDB from '@/config/database';
import Employee from '@/models/Employee';
import { authOptions } from '@/utils/authOptions';

export const GET = async () => {
   try {
      const session = await getServerSession(authOptions);

      if (!session?.user) {
         return Response.json({ user: null }, { status: 200 });
      }

      if (session.user.isFallbackAdmin) {
         await connectDB();

         const envLogin = String(process.env.CRM_SUPERADMIN_LOGIN || '').trim().toLowerCase();
         const employee = envLogin
            ? await Employee.findOne({
               isActive: true,
               $or: [
                  { login: envLogin },
                  { emails: envLogin },
                  { 'phones.number': envLogin },
                  { phones: envLogin },
               ],
            }).lean()
            : null;

         return Response.json(
            {
               user: {
                  ...(employee || {}),
                  _id: employee?._id || 'env-superadmin',
                  employeeId: employee?._id || null,
                  login: employee?.login || envLogin || '',
                  name: employee?.name || session.user.name || 'Super Admin',
                  fullName: employee?.fullName || session.user.name || 'Super Admin',
                  position: employee?.position || session.user.position || 'Власник',
                  role: session.user.role || 'owner',
                  avatarUrl: employee?.avatarUrl || session.user.avatarUrl || '',
                  isFallbackAdmin: true,
               },
            },
            { status: 200 }
         );
      }

      if (!session.user.employeeId) {
         return Response.json({ user: null }, { status: 200 });
      }

      await connectDB();

      const employee = await Employee.findById(session.user.employeeId).lean();

      return Response.json(
         {
            user: employee
               ? {
                  ...employee,
                  isFallbackAdmin: false,
               }
               : null,
         },
         { status: 200 }
      );
   } catch (error) {
      console.error(error);
      return new Response('Error fetching current user', { status: 500 });
   }
};
