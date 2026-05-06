import SharePresentationPage from '@/app/share/SharePresentationPage';

export default async function Page({ params }) {
   return <SharePresentationPage slug={params.slug} />;
}