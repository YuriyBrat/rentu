
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import connectDB from '@/config/database';
import Employee from '@/models/Employee';

function normalizeLogin(value) {
   return String(value || '').trim().toLowerCase();
}

export const authOptions = {
   providers: [
      CredentialsProvider({
         name: 'Karamax Login',
         credentials: {
            email: { label: 'Email / телефон / login', type: 'text' },
            password: { label: 'Пароль', type: 'password' },
         },

         async authorize(credentials) {
            const loginValue = normalizeLogin(credentials?.email);
            const password = String(credentials?.password || '');

            if (!loginValue || !password) return null;

            // 1) fallback superadmin з .env
            const envEnabled = process.env.CRM_ENABLE_ENV_SUPERADMIN === 'true';
            const envLogin = normalizeLogin(process.env.CRM_SUPERADMIN_LOGIN);
            const envPassword = String(process.env.CRM_SUPERADMIN_PASSWORD || '');

            if (envEnabled && loginValue === envLogin && password === envPassword) {
               return {
                  id: 'env-superadmin',
                  employeeId: null,
                  name: 'Super Admin',
                  email: '',
                  role: 'owner',
                  position: 'Власник',
                  avatarUrl: '',
                  isFallbackAdmin: true,
               };
            }

            // 2) звичайний вхід через базу
            try {
               await connectDB();

               const employee = await Employee.findOne({
                  isActive: true,
                  $or: [
                     { login: loginValue },
                     { emails: { $in: [loginValue] } },
                     { phones: { $in: [loginValue] } },
                  ],
               }).lean();

               if (!employee) return null;
               if (!employee.passwordHash) return null;

               const isValid = await bcrypt.compare(password, employee.passwordHash);
               if (!isValid) return null;

               // console.log('Successful login for employee:', employee._id, employee.name);
               // await bcrypt.hash('newpassword', 10).then(console.log);

               return {
                  id: String(employee._id),
                  employeeId: String(employee._id),
                  name: employee.name || '',
                  email: employee.emails?.[0] || '',
                  role: employee.role || 'viewer',
                  position: employee.position || '',
                  avatarUrl: employee.avatarUrl || '',
                  isFallbackAdmin: false,
               };
            } catch (error) {
               console.error('Auth DB error:', error);
               return null;
            }
         },
      }),
   ],

   session: { strategy: 'jwt' },

   callbacks: {
      async jwt({ token, user }) {
         if (user) {
            token.employeeId = user.employeeId || null;
            token.role = user.role || 'viewer';
            token.position = user.position || '';
            token.avatarUrl = user.avatarUrl || '';
            token.isFallbackAdmin = !!user.isFallbackAdmin;
         }
         return token;
      },

      async session({ session, token }) {
         if (session?.user) {
            session.user.id = token.sub || null;
            session.user.employeeId = token.employeeId || null;
            session.user.role = token.role || 'viewer';
            session.user.position = token.position || '';
            session.user.avatarUrl = token.avatarUrl || '';
            session.user.isFallbackAdmin = !!token.isFallbackAdmin;
         }
         return session;
      },
   },

   pages: {
      signIn: '/crm/login',
   },

   secret: process.env.NEXTAUTH_SECRET,
};