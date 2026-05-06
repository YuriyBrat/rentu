import PartnerPresentationPage from '@/app/p/PartnerPresentationPage';

export default async function Page({ params }) {
   return <PartnerPresentationPage slug={params.slug} />;
}