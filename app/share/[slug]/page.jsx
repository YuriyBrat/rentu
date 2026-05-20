// import SharePresentationPage from '@/app/share/SharePresentationPage';

// export default async function Page({ params }) {
//    return <SharePresentationPage slug={params.slug} />;
// }



// import PropertyLandingPresentation from '../PropertyLandingPresentation';

// export default function Page({ params }) {
//    return <PropertyLandingPresentation slug={params.slug} />;
// }

import SharePresentationPage from '../SharePresentationPage';

export default function Page({ params }) {
   return <SharePresentationPage slug={params.slug} />;
}