'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import CRMLayout from './CRMLayout1';
import { CRMThemeProvider } from './context/CRMThemeContext';

export default function Layout({ children }) {
   return (
      <SessionProvider>
         <CRMAuthWrapper>{children}</CRMAuthWrapper>
      </SessionProvider>
   );
}

function CRMAuthWrapper({ children }) {
   const { status } = useSession();
   const router = useRouter();
   const pathname = usePathname();

   useEffect(() => {
      // ✅ не ганяємо редіректом, якщо вже на /login
      if (status === 'unauthenticated' && pathname !== '/login') {
         router.push('/login');
      }
   }, [status, router, pathname]);

   if (status === 'loading') {
      return <p style={{ padding: 24 }}>Завантаження...</p>;
   }

   // ✅ Якщо не авторизований — нічого не рендеримо (щоб не мигало)
   if (status === 'unauthenticated') return null;

   return (
      <CRMThemeProvider>
         <CRMLayout>{children}</CRMLayout>
      </CRMThemeProvider>
   );
}