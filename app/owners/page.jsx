import OwnersLanding from './OwnersLanding';

const title = 'Продаж квартири у Львові — персональний розбір | KARAMAX';
const description = 'Дізнайтеся, з якою ціною виходити на ринок. Безкоштовний персональний розбір квартири у Львові: ціна, конкуренти та три сценарії продажу від KARAMAX.';

export const metadata = {
  title,
  description,
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
