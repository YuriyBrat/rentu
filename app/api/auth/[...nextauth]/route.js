// import { authOptions } from "@/utils/authOptions";
// // import { authOptions } from "../../../../utils/authOptions";
// import NextAuth from "next-auth/next";

// const handler = NextAuth(authOptions);


// export { handler as GET, handler as POST }

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
   providers: [
      CredentialsProvider({
         name: "Karamax Login",
         credentials: {
            email: { label: "Email або телефон", type: "text" },
            password: { label: "Пароль", type: "password" },
         },
         async authorize(credentials) {
            const users = [
               { id: 1, name: "Admin", email: "admin@karamax.ua", phone: "0679850911", password: "12345" },
               { id: 2, name: "Agent", email: "agent@karamax.ua", phone: "0501112233", password: "agent" },
            ];

            const user = users.find(
               (u) =>
                  (u.email === credentials.email || u.phone === credentials.email) &&
                  u.password === credentials.password
            );

            if (user) return user;
            return null;
         },
      }),
   ],
   pages: {
      signIn: "/login",
   },
   session: { strategy: "jwt" },
   secret: process.env.NEXTAUTH_SECRET || "karamax-secret",
});

export { handler as GET, handler as POST };

