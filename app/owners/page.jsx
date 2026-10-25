import OwnersLanding from './OwnersLanding';

const title = 'За скільки продати квартиру у Львові — безкоштовний розбір | KARAMAX';
const description = 'Дізнайтеся, за скільки реально можна продати вашу квартиру у Львові. Безкоштовний розбір від Karamax: орієнтир вартості, аналіз конкурентів і три стратегії продажу.';

export const metadata = {
  title,
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://karamax.com.ua/owners' },
  openGraph: {
    title,
    description,
    url: 'https://karamax.com.ua/owners',
    siteName: 'KARAMAX',
    locale: 'uk_UA',
    type: 'website',
    images: [{ url: 'https://karamax.com.ua/owners/living-room.jpg', width: 1920, height: 1440, alt: 'Світлий інтер’єр вітальні' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['https://karamax.com.ua/owners/living-room.jpg'] },
};

export default function OwnersPage() {
  return <OwnersLanding />;
}
