// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";

// const handler = NextAuth({
//    providers: [
//       CredentialsProvider({
//          name: "Karamax Login",
//          credentials: {
//             email: { label: "Email або телефон", type: "text" },
//             password: { label: "Пароль", type: "password" },
//          },
//          async authorize(credentials) {
//             const email = (credentials?.email || "").trim();
//             const password = credentials?.password || "";

//             const users = [
//                { id: "1", name: "Admin", email: "admin@karamax.ua", phone: "0679850911", password: "12345" },
//                { id: "2", name: "Agent", email: "agent@karamax.ua", phone: "0501112233", password: "agent" },
//             ];

//             const user = users.find(
//                (u) =>
//                   (u.email === email || u.phone === email) &&
//                   u.password === password
//             );

//             if (!user) return null;

//             return { id: user.id, name: user.name, email: user.email };
//          },
//       }),
//    ],

//    session: { strategy: "jwt" },

//    // ✅ важливо: в .env має бути NEXTAUTH_SECRET
//    secret: process.env.NEXTAUTH_SECRET,
// });

// export { handler as GET, handler as POST };


import NextAuth from 'next-auth';
import { authOptions } from '@/utils/authOptions';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };