'use client';
import { useSession, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CRMLayout from './CRMLayout';
import { CRMThemeProvider } from './context/CRMThemeContext';

export default function RootLayout({ children }) {
   return (
      <SessionProvider>
         <CRMAuthWrapper>{children}</CRMAuthWrapper>
      </SessionProvider>
   );
}

function CRMAuthWrapper({ children }) {
   const { data: session, status } = useSession();
   const router = useRouter();

   useEffect(() => {
      if (status === 'unauthenticated') router.push('/login');
   }, [status, router]);

   if (status === 'loading') return <p>Завантаження...</p>;

   return (
      <CRMThemeProvider>
         <CRMLayout>{children}</CRMLayout>
      </CRMThemeProvider>
   );
}
