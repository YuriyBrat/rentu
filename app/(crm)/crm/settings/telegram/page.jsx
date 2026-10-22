import Link from 'next/link';
import { getSessionUser } from '@/utils/getSessionUser';
import { isElevatedCrmUser } from '@/utils/crm/accessControl';
import TelegramSettings from './TelegramSettings';

export const metadata = { title: 'Telegram — налаштування KARAMAX' };
export const dynamic = 'force-dynamic';

export default async function TelegramSettingsPage() {
  const user = await getSessionUser();
  if (!user || !isElevatedCrmUser(user)) {
    return <div style={{ padding: 32 }}><h2>Налаштування Telegram</h2><p>Цей розділ доступний власнику й адміністратору CRM.</p><Link href="/crm">Повернутися до CRM</Link></div>;
  }
  return <TelegramSettings />;
}
