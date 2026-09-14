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
   const { data: session, status } = useSession();
   const router = useRouter();
   const pathname = usePathname();

   useEffect(() => {
      // ✅ не ганяємо редіректом, якщо вже на /login
      if (status === 'unauthenticated' && pathname !== '/login') {
         router.push('/login');
      }
      if (status === 'authenticated') {
         const role = session?.user?.role || 'viewer';
         if (role === 'marketing' && !pathname?.startsWith('/crm/advertising')) {
            router.replace('/crm/advertising');
         }
         if (role === 'callcenter' && pathname?.startsWith('/crm/advertising')) {
            router.replace('/crm/objects3');
         }
      }
   }, [status, session, router, pathname]);

   if (status === 'loading') {
      return <p style={{ padding: 24 }}>Завантаження...</p>;
   }

   // ✅ Якщо не авторизований — нічого не рендеримо (щоб не мигало)
   if (status === 'unauthenticated') return null;

   const role = session?.user?.role || 'viewer';
   if (role === 'marketing' && !pathname?.startsWith('/crm/advertising')) return null;
   if (role === 'callcenter' && pathname?.startsWith('/crm/advertising')) return null;

   return (
      <CRMThemeProvider>
         {pathname?.startsWith('/crm/advertising') ? children : <CRMLayout>{children}</CRMLayout>}
      </CRMThemeProvider>
   );
}
