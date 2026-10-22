'use client';

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Check, CheckCircle2, CircleAlert, Clock3, Edit3, LoaderCircle, Plus, RefreshCw, Send, ShieldCheck, X } from 'lucide-react';
import { useCRMTheme } from '../../context/CRMThemeContext';
import s from './telegram.module.css';

const API = '/api/crm/telegram';
const STATUS = { pending: 'У черзі', sending: 'Надсилання', sent: 'Надіслано', failed: 'Помилка' };
const date = value => value ? new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Kyiv', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—';

function RuleEditor({ event, rule, destinations, disabled, onSave }) {
  const [enabled, setEnabled] = useState(rule?.enabled ?? false);
  const [selected, setSelected] = useState(rule?.destinations || []);
  return <section className={s.card}>
    <div className={s.cardTop}><h2>{event.label}</h2><label className={s.check}><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} disabled={disabled} /> Увімкнено</label></div>
    <p className={s.muted}>Спочатку заявка зберігається в «Наводках», потім повідомлення надсилається в обрані місця.</p>
    <div className={s.ruleOptions}>{destinations.map(item => <label className={s.check} key={item._id}><input type="checkbox" checked={selected.includes(item._id)} disabled={disabled} onChange={e => setSelected(e.target.checked ? [...selected, item._id] : selected.filter(id => id !== item._id))} /><span>{item.name}{!item.enabled && <small> · вимкнено</small>}</span></label>)}</div>
    {!destinations.length && <p className={s.muted}>Спершу додайте групу або канал.</p>}
    <p className={s.hint}>Вимкнені канали не отримують нових сповіщень. Зміни застосовуються до наступних заявок.</p>
    <button className={s.primary} type="button" disabled={disabled} onClick={() => onSave({ action: 'save_rule', event: event.key, enabled, destinations: selected }, 'Правило збережено.')}><Check size={16} /> Зберегти правило</button>
  </section>;
}

export default function TelegramSettings() {
  const { theme } = useCRMTheme();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('destinations');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null);
  const [editor, setEditor] = useState(null);
  const [fields, setFields] = useState({});

  const load = useCallback(async () => {
    try {
      const response = await fetch(API, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не вдалося завантажити налаштування.');
      setData(result);
    } catch (error) { setNotice({ error: true, text: error.message }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(payload, success = 'Готово.') {
    if (busy) return false;
    setBusy(`${payload.action}:${payload.id || ''}`);
    setNotice(null);
    try {
      const response = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не вдалося виконати дію.');
      setNotice({ error: false, text: payload.action === 'process_queue' ? `Чергу опрацьовано. Надіслано: ${result.sent}; оброблено: ${result.processed}.` : success });
      await load();
      return true;
    } catch (error) { setNotice({ error: true, text: error.message }); await load(); return false; }
    finally { setBusy(''); }
  }

  function edit(kind, item = {}) {
    setFields(kind === 'bot'
      ? { name: item.name || '', tokenEnv: item.tokenEnv || 'TELEGRAM_BOT_TOKEN', enabled: item.enabled !== false }
      : { name: item.name || '', bot: String(item.bot || data.bots[0]?._id || ''), chatId: item.chatId || '', threadId: item.threadId || '', enabled: item.enabled !== false });
    setEditor({ kind, id: item._id });
  }
  const change = event => setFields(old => ({ ...old, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  async function save(event) {
    event.preventDefault();
    if (await act({ action: editor.kind === 'bot' ? 'save_bot' : 'save_destination', id: editor.id, ...fields }, 'Налаштування збережено.')) setEditor(null);
  }
  const botName = id => data?.bots.find(bot => bot._id === String(id))?.name || 'Бот не знайдений';
  const destinationName = id => data?.destinations.find(item => item._id === String(id))?.name || 'Канал не знайдений';
  const styles = { '--tg-panel': theme?.bgPanel || '#151521', '--tg-text': theme?.text || '#e6e6f0', '--tg-soft': theme?.textSoft || '#a8a9bc', '--tg-border': theme?.border || '#323244', '--tg-accent': theme?.accent || '#a78bfa' };

  return <div className={s.page} style={styles}>
    <div className={s.heading}><div><span className={s.eyebrow}>НАЛАШТУВАННЯ / СПОВІЩЕННЯ</span><h1><Send size={28} /> Telegram</h1><p className={s.muted}>Боти, групи, канали та правила сповіщень в одному місці.</p></div><button type="button" className={s.secondary} disabled={!!busy || loading} onClick={load}><RefreshCw size={16} /> Оновити</button></div>
    {notice && <div className={`${s.notice} ${notice.error ? s.noticeError : ''}`} role={notice.error ? 'alert' : 'status'}>{notice.error ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}<span>{notice.text}</span><button type="button" onClick={() => setNotice(null)} aria-label="Закрити повідомлення"><X size={16} /></button></div>}
    {loading && <p className={s.loading}><LoaderCircle className={s.spin} size={20} /> Завантаження налаштувань…</p>}
    {!loading && !data && <button className={s.primary} type="button" onClick={load}>Спробувати ще раз</button>}
    {data && <>
      <div className={s.summary}><div><CheckCircle2 size={19} /><span>Надіслано<strong>{data.counts.sent || 0}</strong></span></div><div><Clock3 size={19} /><span>У черзі / обробці<strong>{(data.counts.pending || 0) + (data.counts.sending || 0) + data.recoveryCount}</strong></span></div><div><CircleAlert size={19} /><span>Потребують уваги<strong>{data.counts.failed || 0}</strong></span></div></div>
      <div className={s.tabs} role="group" aria-label="Розділи налаштувань">{[['destinations', 'Канали та групи'], ['bots', 'Боти'], ['rules', 'Правила'], ['history', 'Журнал']].map(([key, title]) => <button key={key} type="button" aria-pressed={tab === key} className={tab === key ? s.activeTab : ''} onClick={() => setTab(key)}>{title}</button>)}</div>
      {tab === 'destinations' && <>
        <div className={s.sectionTop}><p className={s.muted}>Додавайте нові групи або канали й обирайте їх у правилах.</p><button type="button" className={s.primary} disabled={!!busy || !data.bots.length} onClick={() => edit('destination')}><Plus size={16} /> Додати канал</button></div>
        {!data.destinations.length && <div className={s.empty}>Каналів ще немає. {data.bots.length ? 'Додайте першу групу або канал.' : 'Спершу додайте бота в розділі «Боти».'}</div>}
        <div className={s.grid}>{data.destinations.map(item => <section className={s.card} key={item._id}><div className={s.cardTop}><h2>{item.name}</h2><span className={`${s.badge} ${item.enabled ? s.good : ''}`}>{item.enabled ? 'Увімкнено' : 'Вимкнено'}</span></div><dl className={s.details}><div><dt>Telegram</dt><dd>{item.chatTitle || 'Доступ ще не перевіряли'}</dd></div><div><dt>Бот</dt><dd>{botName(item.bot)}</dd></div><div><dt>ID чату</dt><dd>{item.chatId}{item.threadId ? ` · тема ${item.threadId}` : ''}</dd></div><div><dt>Перевірено</dt><dd>{date(item.checkedAt)}</dd></div></dl>{item.lastError && <p className={s.inlineError}>{item.lastError}</p>}<div className={s.actions}><button type="button" className={s.secondary} disabled={!!busy} onClick={() => edit('destination', item)}><Edit3 size={15} /> Редагувати</button><button type="button" className={s.secondary} disabled={!!busy || !item.enabled} onClick={() => act({ action: 'check_destination', id: item._id }, 'Доступ до каналу перевірено.')}><ShieldCheck size={15} /> Перевірити</button><button type="button" className={s.secondary} disabled={!!busy || !item.enabled} onClick={() => act({ action: 'test_destination', id: item._id }, 'Тестове повідомлення надіслано в Telegram.')}><Send size={15} /> Надіслати тест</button></div></section>)}</div>
      </>}
      {tab === 'bots' && <>
        <div className={s.sectionTop}><p className={s.muted}>Токени зберігаються на сервері та не передаються в браузер.</p><button type="button" className={s.primary} disabled={!!busy} onClick={() => edit('bot')}><Plus size={16} /> Додати бота</button></div>
        <div className={s.grid}>{data.bots.map(bot => <section className={s.card} key={bot._id}><div className={s.cardTop}><h2>{bot.name}</h2><span className={`${s.badge} ${bot.enabled && bot.configured ? s.good : ''}`}>{!bot.enabled ? 'Вимкнено' : bot.configured ? 'Токен налаштований' : 'Потрібен токен'}</span></div><dl className={s.details}><div><dt>Username</dt><dd>{bot.username ? `@${bot.username}` : 'Не перевірено'}</dd></div><div><dt>Серверна змінна</dt><dd>{bot.tokenEnv}</dd></div><div><dt>Перевірено</dt><dd>{date(bot.checkedAt)}</dd></div></dl>{bot.lastError && <p className={s.inlineError}>{bot.lastError}</p>}<div className={s.actions}><button type="button" className={s.secondary} disabled={!!busy} onClick={() => edit('bot', bot)}><Edit3 size={15} /> Редагувати</button><button type="button" className={s.secondary} disabled={!!busy || !bot.enabled || !bot.configured} onClick={() => act({ action: 'check_bot', id: bot._id }, 'Бот відповідає. Підключення працює.')}><ShieldCheck size={15} /> Перевірити бота</button></div></section>)}</div>
      </>}
      {tab === 'rules' && <div className={s.ruleList}>{data.events.map(event => { const rule = data.rules.find(item => item.event === event.key); return <RuleEditor key={`${event.key}:${rule?.updatedAt || ''}`} event={event} rule={rule} destinations={data.destinations} disabled={!!busy} onSave={act} />; })}</div>}
      {tab === 'history' && <>
        <div className={s.sectionTop}><div><p className={s.muted}>Останні 30 повідомлень. Успішно надіслані повторно не відправляються.</p><p className={s.hint}>Після таймауту перевірте групу перед повтором: Telegram міг уже прийняти повідомлення.</p></div><button type="button" className={s.primary} disabled={!!busy} onClick={() => act({ action: 'process_queue' })}><RefreshCw size={16} /> Опрацювати чергу</button></div>
        {!data.deliveries.length && <div className={s.empty}>Сповіщень ще немає. Можна надіслати тест із розділу «Канали та групи».</div>}
        <div className={s.history}>{data.deliveries.map(item => <article className={s.delivery} key={item._id}><div><span className={`${s.badge} ${item.status === 'sent' ? s.good : item.status === 'failed' ? s.bad : ''}`}>{STATUS[item.status]}</span><h3>{item.event === 'test' ? 'Тестове повідомлення' : 'Заявка власника з /owners'}</h3><p className={s.muted}>{destinationName(item.destination)} · {date(item.createdAt)} · Спроб: {item.attempts}</p>{item.lastError && <p className={s.inlineError}>{item.lastError}</p>}{item.status === 'failed' && new Date(item.nextAttemptAt).getTime() > Date.now() && <p className={s.hint}>Повтор доступний після {date(item.nextAttemptAt)}</p>}</div><div className={s.actions}>{item.event === 'owner_request' && <a className={s.secondary} href="/crm/navodky4">До наводок</a>}{['pending', 'failed'].includes(item.status) && <button type="button" className={s.secondary} disabled={!!busy || new Date(item.nextAttemptAt).getTime() > Date.now()} onClick={() => act({ action: 'retry_delivery', id: item._id }, 'Повідомлення надіслано.')}><RefreshCw size={15} /> Повторити</button>}</div></article>)}</div>
      </>}
    </>}
    <Dialog open={!!editor} onClose={() => { if (!busy) setEditor(null); }} fullWidth maxWidth="sm">
      {editor && <form onSubmit={save}>
        <DialogTitle>{editor.id ? 'Редагувати' : 'Додати'} {editor.kind === 'bot' ? 'бота' : 'групу або канал'}</DialogTitle>
        <DialogContent><div className={s.editor}>
          {notice?.error && <p role="alert" className={s.inlineError}>{notice.text}</p>}
          <label>Назва у CRM<input autoFocus name="name" value={fields.name} onChange={change} required minLength={2} maxLength={100} placeholder={editor.kind === 'bot' ? 'Бот KARAMAX' : 'Заявки власників'} /></label>
          {editor.kind === 'bot' ? <><label>Змінна з токеном на сервері<input name="tokenEnv" list="telegram-token-variables" value={fields.tokenEnv} onChange={change} required pattern="TELEGRAM_[A-Z0-9_]*TOKEN" placeholder="TELEGRAM_BOT_TOKEN" /></label><datalist id="telegram-token-variables">{data?.tokenEnvOptions.map(key => <option value={key} key={key} />)}</datalist><p>Додайте токен у змінні середовища сервера. У CRM вкажіть лише назву змінної, наприклад TELEGRAM_BOT_TOKEN.</p></> : <>
            <label>Бот<select name="bot" value={fields.bot} onChange={change} required><option value="" disabled>Оберіть бота</option>{data?.bots.map(bot => <option key={bot._id} value={bot._id}>{bot.name}{!bot.enabled ? ' (вимкнено)' : ''}</option>)}</select></label>
            <label>ID чату або @username каналу<input name="chatId" value={fields.chatId} onChange={change} required maxLength={40} placeholder="-100… або @назва_каналу" /></label>
            <label>ID теми — необов’язково<input type="number" name="threadId" value={fields.threadId} onChange={change} min="1" step="1" placeholder="Для конкретної теми у групі" /></label>
            <p>Бот повинен мати доступ до групи або каналу й право публікувати повідомлення. Після збереження перевірте доступ і надішліть тест.</p>
          </>}
          <label className={s.check}><input name="enabled" type="checkbox" checked={fields.enabled} onChange={change} /> Використовувати це підключення</label>
        </div></DialogContent>
        <DialogActions><Button type="button" disabled={!!busy} onClick={() => setEditor(null)}>Скасувати</Button><Button type="submit" variant="contained" disabled={!!busy}>{busy ? 'Збереження…' : 'Зберегти'}</Button></DialogActions>
      </form>}
    </Dialog>
  </div>;
}
