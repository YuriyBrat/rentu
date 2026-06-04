import connectDB from '@/config/database';
import LeadProperty from '@/models/LeadProperty';

export const GET = async () => {
   try {
      await connectDB();

      const importedCount = await LeadProperty.countDocuments({ source: 'dimria' });
      const withPhoneCount = await LeadProperty.countDocuments({
         source: 'dimria',
         phone: { $exists: true, $nin: ['', null] },
      });

      return Response.json({
         ok: true,
         configured: Boolean(process.env.DIMRIA_API_KEY),
         source: 'dimria',
         importedCount,
         withPhoneCount,
      });
   } catch (error) {
      console.error('DIM.RIA status error:', error);
      return Response.json(
         {
            ok: false,
            error: error?.message || 'DIM.RIA status failed',
         },
         { status: 500 }
      );
   }
};
