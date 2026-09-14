// 'use client';
// import { useSession, SessionProvider } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import CRMLayout from './CRMLayout1';
// import { CRMThemeProvider } from './context/CRMThemeContext';

// export default function RootLayout({ children }) {
//    return (
//       <SessionProvider>
//          <CRMAuthWrapper>{children}</CRMAuthWrapper>
//       </SessionProvider>
//    );
// }

// function CRMAuthWrapper({ children }) {
//    const { data: session, status } = useSession();
//    const router = useRouter();

//    useEffect(() => {
//       if (status === 'unauthenticated') router.push('/login');
//    }, [status, router]);

//    if (status === 'loading') return <p>Завантаження...</p>;

//    return (
//       <CRMThemeProvider>
//          <CRMLayout>{children}</CRMLayout>
//       </CRMThemeProvider>
//    );
// }


import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/utils/authOptions';

export default async function CrmHome() {
   const session = await getServerSession(authOptions);
   if (session?.user?.role === 'marketing') redirect('/crm/advertising');
   redirect('/crm/objects3');
}
