// import connectDB from '@/config/database'
// import User from '@/models/User';

// import GoogleProvider from 'next-auth/providers/google'

// export const authOptions = {
//    providers: [
//       GoogleProvider({
//          clientId: process.env.GOOGLE_CLIENT_ID,
//          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//          authorization: {
//             params: {
//                prompt: "consent",
//                access_type: "offline",
//                response_type: "code"
//             }
//          }
//       })
//    ],
//    callbacks: {
//       // Invoked on successful sigin
//       async signIn({ profile }) {
//          // 1. Connect to db
//          await connectDB();
//          // 2. Check if user exist
//          const userExists = await User.findOne({ email: profile.email });
//          // 3. If not, then add to db
//          if (!userExists) {
//             // truncate user name if too long
//             const username = profile.name.slice(0, 20);

//             await User.create({
//                email: profile.email,
//                username,
//                image: profile.picture
//             })
//          }
//          // 4. Return true to allow sign in
//          return true
//       },

//       //Modifies the session object
//       // async session({ session }) {
//       //    // 1. Get uer from db
//       //    const user = await User.findOne({ email: session.user.email })
//       //    // 2. Assign user id to the session
//       //    session.user.id = user._id.toString();
//       //    // 3. Return session
//       //    return session
//       // }

//       async jwt({ token, user }) {
//          if (user) {
//             token.user = user;
//             token.userId = user.id || user._id || null;
//          }
//          return token;
//       },

//       async session({ session, token }) {
//          if (!session.user) session.user = {};

//          session.user.id = token.userId || null;
//          session.user.userId = token.userId || null;

//          if (token.user?.name) session.user.name = token.user.name;
//          if (token.user?.email) session.user.email = token.user.email;

//          return session;
//       },
//    }
// }

//$2b$10$7npKyOoElTv2lINgTEQTW.6DPYic/JGxlAjMA2MPUTDW0kVqWbGEu

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