import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';

export const getSessionUser = async () => {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
         return null;
      };

      return {
         user: session.user,
         userId: session.user.userId || session.user.id || null,
         employeeId: session.user.employeeId || null,
         role: session.user.role || 'viewer',
         isFallbackAdmin: !!session.user.isFallbackAdmin,
      };
   } catch (error) {
      console.error(error);
      return null;
   }
}
