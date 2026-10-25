'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Building2, ChartNoAxesCombined, Check, CheckCheck, ChevronDown, FileText, Layers3, LoaderCircle, MapPin, Menu, MoveUpRight, Phone, ShieldCheck, Sparkles, X } from 'lucide-react';
import { normalizeOwnerPhone } from '@/utils/owners/request.mjs';
import { CONSENT_KEY, createOwnersAttribution, readOwnersConsent } from '@/utils/owners/attribution.mjs';
import { createOwnersAnalytics } from '@/utils/owners/analytics.mjs';
import { ownersTrust } from './trust.config';
import s from './owners.module.css';

const PHONE = '+380679850911';
const scenarios = [
  { id: 'speed', number: '01', label: 'Пріоритет — швидкість', title: 'Коли час має значення.', description: 'Визначаємо конкурентну стартову ціну та зосереджуємо рекламу на покупцях, готових до рішення. Обговорюємо, який торг відповідає вашому пріоритету.', note: 'Підійде, якщо ви плануєте переїзд або наступну покупку.', bars: [42, 90, 44], tags: ['Конкурентна ціна', 'Активне просування', 'Готовність до переговорів'] },
  { id: 'balance', number: '02', label: 'Баланс ціни та часу', title: 'Продуманий вихід на ринок.', description: 'Зіставляємо вашу квартиру з конкурентами, готуємо презентацію та визначаємо обґрунтовану стартову ціну. Оцінюємо відгук покупців і коригуємо план за результатами.', note: 'Підійде, якщо хочете обґрунтовану ціну й керований процес.', bars: [70, 65, 65], tags: ['Аналіз конкурентів', 'Сильна презентація', 'Рішення на основі попиту'] },
  { id: 'potential', number: '03', label: 'Перевірка вищої ціни', title: 'Дослідити весь потенціал.', description: 'Якщо квартира має виразні переваги, формуємо аргументи вищої стартової ціни. Узгоджуємо період перевірки попиту та критерії, за якими переглядатимемо стратегію.', note: 'Підійде, якщо маєте запас часу та готові перевірити попит.', bars: [90, 35, 88], tags: ['Акцент на перевагах', 'Перевірка попиту', 'Узгоджені точки перегляду'] },
];

const benefits = [
  ['Ціна з аргументами', 'Діапазон стартової ціни та фактори, які впливають на вартість саме вашої квартири.'],
  ['Конкуренти поруч', 'Добірка схожих пропозицій: з чим покупець порівнюватиме вашу квартиру.'],
  ['Три сценарії продажу', 'Що змінюється, коли ваш пріоритет — швидкість, баланс або вища стартова ціна.'],
  ['Підготовка та наступні кроки', 'Що покращити в презентації квартири та як оцінювати реакцію ринку.'],
];

const questions = [
  ['Це справді безкоштовно?', 'Так. Перший персональний розбір квартири безкоштовний і не зобов’язує укладати договір. Якщо ви захочете продовжити співпрацю, окремо обговоримо обсяг послуг, вартість та умови.'],
  ['Що я отримаю після заявки?', 'Спеціаліст KARAMAX зв’яжеться з вами обраним способом, уточнить стан і особливості квартири та погодить строк підготовки. Результат — персональний розбір із ціновим орієнтиром, конкурентами й рекомендаціями щодо продажу.'],
  ['Чи потрібно одразу називати точну адресу?', 'Для першого звернення достатньо району або вулиці у Львові. Деталі, які потрібні для точнішого аналізу, обговоримо особисто. Документи на квартиру через цю форму надсилати не потрібно.'],
  ['Чи можна звернутися, якщо я ще не вирішив продавати?', 'Так. Розбір допоможе зрозуміти ситуацію та спланувати наступний крок. У формі можна обрати «Поки придивляюся», щоб спеціаліст врахував ваші плани.'],
  ['Квартира вже є в рекламі. Це підійде?', 'Так. Під час розмови надішліть спеціалісту посилання на оголошення. Зможемо врахувати його презентацію, ціну й вашу історію звернень при підготовці розбору.'],
  ['Ви гарантуєте ціну або строк продажу?', 'Розбір дає обґрунтований орієнтир і план дій. Остаточна ціна та строк залежать від стану квартири, конкуренції, попиту й результату переговорів. Ціни активних оголошень розглядаємо як ціни пропозиції; підтверджені дані угод використовуємо за наявності.'],
];

function useMotionPreference() {
  const preferred = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  // Match the server's first render before applying the browser's preference.
  return hydrated && preferred;
}

function Reveal({ children, className = '', delay = 0, id, visibleOnLoad = false }) {
  const reduced = useMotionPreference();
  return <motion.div id={id} className={className} initial={reduced ? false : { opacity: visibleOnLoad ? 1 : 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function Brand({ footer = false }) {
  return (
    <Link href="/" className={`${s.brand} ${footer ? s.footerBrand : ''}`} aria-label="КАРАМАКС — головна">
      <span className={s.brandLogo}>
        <Image src="/krm/logo-krm-transparent.png" alt="КАРАМАКС — твоя нерухомість, вигода часу" fill className={s.brandImage} sizes="(max-width: 800px) 170px, 204px" priority={!footer} />
      </span>
    </Link>
  );
}

function Action({ children = 'Отримати безкоштовний розбір', light = false, className = '' }) {
  return <a href="#request" className={`${s.button} ${light ? s.buttonLight : ''} ${className}`}>{children}<ArrowUpRight size={19} aria-hidden="true" /></a>;
}

function PrivacyChoices({ consent, onChange }) {
  const [choices, setChoices] = useState(consent);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setChoices(consent); }, [consent]);
  return <aside id="owners-privacy" className={s.privacyChoices} aria-label="Приватність і налаштування аналітики">
    <div className={s.container}><details>
      <summary>Приватність та налаштування аналітики <ChevronDown size={15} /></summary>
      <div className={s.privacyContent}>
        <div><h2>Ваші дані та ваш вибір.</h2><p>KARAMAX отримує ім’я, телефон, район або вулицю, параметри квартири та спосіб зв’язку лише після надсилання форми зі згодою. Використовуємо ці дані для відповіді та підготовки розбору; зберігаємо в CRM, а повідомлення про заявку надходить команді в Telegram. Це не підписка на рекламні розсилки.</p><p>Адреса сторінки входу зберігається без довільних параметрів і фрагмента. Аналітика, UTM і рекламні ідентифікатори необов’язкові. Без дозволу зовнішні трекери не завантажуються. Для уточнення, зміни або видалення даних зверніться за номером <a href={`tel:${PHONE}`}>067 985 09 11</a>.</p></div>
        <div className={s.privacyControls}><label><input type="checkbox" checked={choices.analytics} onChange={event => { setChoices(previous => ({ ...previous, analytics: event.target.checked })); setSaved(false); }} /> Аналітика відвідувань та UTM (Google Analytics)</label><label><input type="checkbox" checked={choices.ads} onChange={event => { setChoices(previous => ({ ...previous, ads: event.target.checked })); setSaved(false); }} /> Рекламне вимірювання та мітки кліків (Google Ads, Meta)</label><p>Вибір можна змінити тут будь-коли. Він не впливає на можливість отримати розбір.</p><div><button type="button" onClick={() => { onChange(choices); setSaved(true); }}>Зберегти вибір</button><button type="button" onClick={() => { onChange({ analytics: false, ads: false }); setSaved(true); }}>Без аналітики</button></div><span role="status">{saved ? 'Ваш вибір збережено.' : ''}</span></div>
      </div>
    </details></div>
  </aside>;
}

function RequestForm({ track, getAttribution }) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({ location: '', rooms: '', area: '', readiness: 'unknown', name: '', phone: '', contact: 'phone', consent: false, website: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const heading = useRef(null);
  const errorRef = useRef(null);
  const submitting = useRef(false);
  const controller = useRef(null);
  const previousStep = useRef(1);

  useEffect(() => {
    return () => controller.current?.abort();
  }, []);

  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => {
    if (previousStep.current !== step || done) heading.current?.focus({ preventScroll: true });
    previousStep.current = step;
  }, [step, done]);
  const update = event => {
    const { name, value, type, checked } = event.target;
    setValues(previous => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    if (name !== 'website') track('owners_form_start', 'request', 'form');
    if (error) setError('');
  };

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    setError('');
    if (step === 1) {
      if (values.location.trim().length < 3) { setError('Вкажіть район або вулицю квартири.'); return; }
      if (!values.rooms) { setError('Оберіть кількість кімнат.'); return; }
      setStep(2);
      track('owners_step_2', 'request', 'form');
      return;
    }
    if (!normalizeOwnerPhone(values.phone)) { setError('Перевірте номер: +380 XX XXX XX XX або 0XX XXX XX XX.'); return; }
    if (values.name.trim().length < 2) { setError('Вкажіть ваше ім’я — щонайменше 2 символи.'); return; }
    submitting.current = true;
    setBusy(true);
    controller.current = new AbortController();
    const timeout = window.setTimeout(() => controller.current?.abort(), 20000);
    try {
      const response = await fetch('/api/public/owner-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, attribution: getAttribution() }),
        signal: controller.current.signal,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Не вдалося надіслати заявку. Спробуйте ще раз.');
      setDone(true);
      track('owners_submit_success', 'request', 'form');
    } catch (err) {
      setError(err.name === 'AbortError' ? 'Не отримали підтвердження вчасно. Зателефонуйте нам або повторіть спробу трохи пізніше.' : err.message || 'Перевірте підключення до інтернету та спробуйте ще раз.');
    } finally {
      window.clearTimeout(timeout);
      submitting.current = false;
      setBusy(false);
    }
  }

  if (done) return <div className={`${s.formCard} ${s.success}`}>
    <div className={s.successIcon}><CheckCheck size={34} strokeWidth={1.3} /></div>
    <span className={s.eyebrow}>ПЕРШИЙ КРОК ЗРОБЛЕНО</span>
    <h3 ref={heading} tabIndex={-1}>Дякуємо за довіру,<br />{values.name.trim()}.</h3>
    <p>Ваш запит збережено. Спеціаліст KARAMAX зв’яжеться з вами, уточнить деталі та погодить час підготовки розбору.</p>
    <div className={s.successSummary}><span>Обраний спосіб зв’язку</span><strong>{values.contact === 'phone' ? 'Телефонний дзвінок' : values.contact === 'telegram' ? 'Telegram' : 'Viber'}</strong></div>
    <a className={s.textLink} href={`tel:${PHONE}`}>Потрібно швидше? Зателефонуйте нам <ArrowUpRight size={18} /></a>
  </div>;

  return <div className={s.formCard}>
    <div className={s.formTop}><span className={s.eyebrow}>ВАШ ПЕРСОНАЛЬНИЙ РОЗБІР</span><span className={s.stepCount} aria-live="polite">Крок {step} із 2</span></div>
    <div className={s.progress} aria-hidden="true"><span style={{ width: `${step * 50}%` }} /></div>
    <h3 ref={heading} tabIndex={-1}>{step === 1 ? 'Розкажіть про квартиру.' : 'Як із вами зв’язатися?'}</h3>
    <p className={s.formIntro}>{step === 1 ? 'Почнемо з основного. Решту уточнимо особисто.' : 'Погодимо деталі й підготуємо розбір саме для вас.'}</p>
    <form onSubmit={submit} aria-label="Заявка на персональний розбір квартири" aria-busy={busy}>
      <div className={s.honeypot} aria-hidden="true"><label>Ваш сайт<input tabIndex={-1} name="website" value={values.website} onChange={update} autoComplete="off" /></label></div>
      {step === 1 ? <div className={s.formFields}>
        <label className={s.field}>Район або вулиця у Львові<input name="location" placeholder="Наприклад, Франківський, вул. Кульпарківська" value={values.location} onChange={update} required minLength={3} maxLength={180} autoComplete="street-address" /></label>
        <fieldset className={s.roomField}><legend>Кількість кімнат</legend><div className={s.roomOptions}>{['1', '2', '3', '4+'].map(room => <label key={room} className={values.rooms === room ? s.roomSelected : ''}><input type="radio" name="rooms" value={room} checked={values.rooms === room} onChange={update} required /><span>{room}</span></label>)}</div></fieldset>
        <div className={s.fieldRow}>
          <label className={s.field}>Площа, м² <span>(необов’язково)</span><input type="number" name="area" placeholder="Наприклад, 64" min="10" max="2000" step="0.1" value={values.area} onChange={update} inputMode="decimal" /></label>
          <label className={s.field}>Коли плануєте продавати?<select name="readiness" value={values.readiness} onChange={update}><option value="unknown">Поки придивляюся</option><option value="soon">До місяця</option><option value="q1">За 1–3 місяці</option><option value="q2">За 3–6 місяців</option><option value="later">Пізніше</option></select></label>
        </div>
      </div> : <div className={s.formFields}>
        <label className={s.field}>Ваше ім’я<input name="name" value={values.name} onChange={update} placeholder="Як до вас звертатися?" required minLength={2} maxLength={80} autoComplete="given-name" /></label>
        <label className={s.field}>Номер телефону<input type="tel" name="phone" value={values.phone} onChange={update} placeholder="+380 XX XXX XX XX" required maxLength={25} autoComplete="tel" inputMode="tel" /></label>
        <label className={s.field}>Зручний спосіб зв’язку<select name="contact" value={values.contact} onChange={update}><option value="phone">Телефонний дзвінок</option><option value="telegram">Telegram за цим номером</option><option value="viber">Viber за цим номером</option></select></label>
        <label className={s.consent}><input type="checkbox" name="consent" checked={values.consent} onChange={update} required /><span>Погоджуюся на обробку наданих даних KARAMAX для зв’язку та підготовки персонального розбору.</span></label>
      </div>}
      {error && <p className={s.formError} role="alert" ref={errorRef} tabIndex={-1}>{error}</p>}
      <div className={s.formActions}>{step === 2 && <button type="button" className={s.backButton} disabled={busy} onClick={() => { setStep(1); setError(''); }}>Назад</button>}<button className={s.button} type="submit" disabled={busy}>{busy ? <><LoaderCircle className={s.spinner} size={18} /> Надсилаємо…</> : <>{step === 1 ? 'Продовжити' : 'Отримати мій розбір'}<ArrowUpRight size={19} aria-hidden="true" /></>}</button></div>
      <p className={s.formFootnote}><ShieldCheck size={15} aria-hidden="true" /> Безкоштовно. Без зобов’язання укладати договір.</p>
      <p className={s.formNext}>Після отримання заявки спеціаліст Karamax зв’яжеться з вами, уточнить деталі квартири та погодить підготовку персонального розбору.</p>
      <p className={s.privacy}><a href="#owners-privacy" data-privacy-link>Політика приватності та використання даних</a></p>
    </form>
  </div>;
}

export default function OwnersLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scenario, setScenario] = useState(1);
  const [faq, setFaq] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const [heroPassed, setHeroPassed] = useState(false);
  const [consent, setConsent] = useState({ analytics: false, ads: false });
  const [consentChosen, setConsentChosen] = useState(false);
  const measurements = useRef(null);
  const attribution = useRef(null);
  const consentRef = useRef(consent);
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const reduced = useMotionPreference();
  const heroRef = useRef(null);
  const requestRef = useRef(null);
  const menuButton = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '17%']);
  const active = scenarios[scenario];
  const stickyVisible = heroPassed && !formVisible;
  const track = (name, placement, onceKey) => {
    try { measurements.current?.event(name, placement, onceKey); } catch { /* Optional analytics never block the form. */ }
  };
  const getAttribution = () => {
    try { return attribution.current?.(consentRef.current) || {}; } catch { return {}; }
  };
  const updateConsent = next => {
    setConsentChosen(true);
    consentRef.current = next;
    setConsent(next);
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...next, at: Date.now() })); } catch { /* In-memory choice remains valid. */ }
    try { measurements.current?.setConsent(next); } catch { /* Tracking is optional. */ }
    getAttribution();
  };

  useEffect(() => {
    let storage;
    try { storage = window.sessionStorage; } catch { storage = { getItem: () => null, setItem() {}, removeItem() {} }; }
    attribution.current ||= createOwnersAttribution(window.location.href, storage);
    measurements.current ||= createOwnersAnalytics(window);
    let saved = { analytics: false, ads: false };
    try { saved = readOwnersConsent(localStorage); } catch { /* Privacy mode. */ }
    consentRef.current = saved;
    setConsentChosen(saved.decided === true);
    setConsent(saved);
    try { measurements.current.setConsent(saved); } catch { /* Tracking is optional. */ }
    attribution.current(saved);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const header = headerRef.current;
      const height = (header?.firstElementChild?.getBoundingClientRect().height || 78) + (header?.children[1]?.getBoundingClientRect().height || 0);
      pageRef.current?.style.setProperty('--owners-header-offset', `${height + 18}px`);
    });
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  function captureClick(event) {
    const link = event.target.closest('a');
    if (!link) return;
    const placement = link.closest('[data-placement]')?.dataset.placement || 'other';
    if (link.getAttribute('href') === '#request') track('owners_cta_click', placement);
    if (link.getAttribute('href')?.startsWith('tel:')) track('owners_phone_click', placement);
    if (link.hasAttribute('data-privacy-link')) {
      const details = document.querySelector('#owners-privacy details');
      if (details) details.open = true;
    }
  }

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = reduced ? 'auto' : 'smooth';
    return () => { root.style.scrollBehavior = previous; };
  }, [reduced]);

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 40); setHeroPassed((heroRef.current?.getBoundingClientRect().bottom ?? Infinity) <= 0); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver(entries => setFormVisible(entries[0].isIntersecting), { threshold: 0, rootMargin: '0px 0px 85px 0px' });
    if (requestRef.current) observer.observe(requestRef.current);
    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);

  return <div className={s.page} lang="uk" ref={pageRef} onClickCapture={captureClick}>
    <a href="#main-content" className={s.skipLink}>Перейти до вмісту</a>
    <header ref={headerRef} data-placement="header" className={`${s.header} ${scrolled || menuOpen ? s.headerScrolled : ''}`}>
      <div className={s.headerInner}>
        <div className={s.brandLockup}>
          <Brand />
          <span className={s.headerTagline}>Вміємо продавати<br />нерухомість.</span>
        </div>
        <nav className={s.desktopNav} aria-label="Навігація сторінкою"><a href="#analysis">Ваш розбір</a><a href="#strategy">Стратегії</a><a href="#process">Як це працює</a></nav>
        <div className={s.headerActions}><a className={s.phone} href={`tel:${PHONE}`}><Phone size={15} aria-hidden="true" /><span>067 985 09 11</span></a><a href="#request" className={s.headerCta}>Отримати розбір <ArrowUpRight size={15} /></a><button ref={menuButton} type="button" className={s.menuButton} aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'} aria-expanded={menuOpen} aria-controls="owners-mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
      </div>
      <div className={s.mobileTagline}>Вміємо продавати нерухомість.</div>
      {menuOpen && <nav id="owners-mobile-nav" data-placement="mobile_menu" className={s.mobileNav} aria-label="Мобільна навігація">{[['#analysis', 'Ваш персональний розбір'], ['#strategy', 'Три стратегії продажу'], ['#process', 'Як це працює'], ['#faq', 'Поширені запитання'], ['#request', 'Отримати мій розбір']].map(([href, text]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{text}<ArrowUpRight size={18} /></a>)}</nav>}
    </header>

    <div id="main-content">
      <section className={s.hero} ref={heroRef} aria-labelledby="owners-title" data-placement="hero">
        <motion.div className={s.heroImage} style={{ y: heroY }}><Image src="/owners/living-room.jpg" alt="Світла вітальня з великими вікнами, теплими текстурами та природним світлом" fill priority sizes="100vw" quality={85} /></motion.div>
        <div className={s.heroShade} />
        <div className={`${s.container} ${s.heroContent}`}>
          <Reveal><div className={s.heroEyebrow}><span /> ПРОДАЖ КВАРТИР <i /> ЛЬВІВ</div></Reveal>
          <Reveal delay={0.1} visibleOnLoad><h1 id="owners-title">Дізнайтеся, за скільки реально можна продати <em>вашу квартиру у Львові</em></h1></Reveal>
          <Reveal delay={0.2} visibleOnLoad><p className={s.heroDescription}>Отримайте безкоштовний персональний розбір від Karamax: орієнтир вартості, аналіз конкурентів та три можливі стратегії продажу</p></Reveal>
          <Reveal delay={0.25} visibleOnLoad><ul className={s.heroBenefits}><li><Check size={14} /> Безкоштовно</li><li><Check size={14} /> Індивідуальний аналіз</li><li><Check size={14} /> Без зобов’язання укладати договір</li></ul></Reveal>
          <Reveal delay={0.3} visibleOnLoad><div className={s.heroButtons}><Action light /><a href="#analysis" className={s.heroSecondary}>Що я отримаю <ArrowDown size={16} /></a></div></Reveal>
        </div>
        <motion.div className={s.heroNote} initial={reduced ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}><div className={s.heroNoteTop}><span>ВАША НАСТУПНА ГЛАВА</span><MoveUpRight size={25} strokeWidth={1} /></div><p>Хороший продаж<br />починається з ясності.</p><div className={s.heroNoteBottom}><span>Ціна. Стратегія. Впевненість.</span><span className={s.noteDot} /></div></motion.div>
        <div className={`${s.container} ${s.heroBottom}`}><a href="#analysis"><span className={s.scrollLine} /> ГОРТАЙТЕ, ЩОБ ДІЗНАТИСЯ БІЛЬШЕ</a><span>НЕРУХОМІСТЬ. З УВАГОЮ ДО ВАС.</span></div>
      </section>

      <div className={s.assurance}><div className={s.container}><span><MapPin /> Львів та його райони</span><span><FileText /> Персональний аналіз</span><span><Layers3 /> Три сценарії продажу</span><span><ShieldCheck /> Рішення залишається за вами</span></div></div>
      {!consentChosen && <aside className={s.trackingNotice} aria-label="Вибір аналітики"><div className={s.container}><p>Дозволите аналітику та рекламні мітки для оцінки роботи сторінки? Ваш вибір не впливає на отримання розбору.</p><div><button type="button" onClick={() => updateConsent({ analytics: true, ads: true })}>Дозволити</button><button type="button" onClick={() => updateConsent({ analytics: false, ads: false })}>Лише необхідне</button><a href="#owners-privacy" data-privacy-link>Налаштувати</a></div></div></aside>}

      <section id="analysis" data-placement="analysis" className={`${s.section} ${s.analysis}`} aria-labelledby="analysis-title">
        <div className={s.container}><Reveal className={s.sectionHeading}><span className={s.eyebrow}>01 / ВАШ ПЕРСОНАЛЬНИЙ РОЗБІР</span><h2 id="analysis-title">Велике рішення.<br /><em>Чіткі орієнтири.</em></h2><p>Перш ніж публікувати оголошення, варто побачити повну картину. Ми зберемо її навколо вашої квартири та ваших планів.</p></Reveal>
          <div className={s.analysisGrid}>
            <div className={s.benefitList}>{benefits.map(([title, text], i) => <Reveal key={title} delay={i * 0.06} className={s.benefit}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight aria-hidden="true" size={19} /></Reveal>)}</div>
            <Reveal className={s.reportScene} delay={0.1}><div className={s.reportBack} /><div className={s.report}>
              <div className={s.reportHead}><span>KARAMAX<span className={s.reportBrandDot}>.</span></span><FileText size={20} strokeWidth={1} /></div>
              <span className={s.reportKicker}>ПЕРСОНАЛЬНИЙ РОЗБІР</span><h3>Ваша квартира.<br />Ваш план продажу.</h3>
              <div className={s.reportImage}><Image src="/owners/interior-detail.jpg" alt="Інтер’єр для ілюстрації персонального розбору" fill sizes="(max-width: 600px) 85vw, 440px" /><span>ЗРАЗОК СТРУКТУРИ</span></div>
              <div className={s.reportLine}><span>01</span><div><strong>Ціновий орієнтир</strong><small>Діапазон та аргументи</small></div><ChartNoAxesCombined size={23} strokeWidth={1} /></div>
              <div className={s.reportLine}><span>02</span><div><strong>Конкурентне середовище</strong><small>Схожі квартири поруч</small></div><Building2 size={23} strokeWidth={1} /></div>
              <div className={s.reportLine}><span>03</span><div><strong>Стратегія під ваші плани</strong><small>Пріоритети та наступні кроки</small></div><Layers3 size={23} strokeWidth={1} /></div>
              <div className={s.reportFooter}><span>ПІДГОТОВЛЕНО ДЛЯ ВАС</span><span>ЛЬВІВ / KARAMAX</span></div>
            </div><div className={s.reportSeal}><Sparkles size={18} /><span>Увага<br />до деталей</span></div><p className={s.sampleNote}>Ілюстрація структури. Ваш розбір готується індивідуально.</p></Reveal>
          </div>
        </div>
      </section>

      <section className={s.trust} aria-labelledby="trust-title">
        <div className={s.container}><Reveal className={s.trustIntro}>
          <div className={s.trustYear}><span>KARAMAX</span><strong>{ownersTrust.founded}</strong><small>Засновано у 2018 році</small></div>
          <div><span className={s.eyebrow}>ЛОКАЛЬНИЙ ДОСВІД. ОСОБИСТА УВАГА.</span><h2 id="trust-title">Вашу квартиру аналізують люди, які знають <em>ринок Львова</em></h2><p>{ownersTrust.specialization}</p><p>Розбір готуємо навколо вашої квартири та ваших планів. Наступні кроки й умови співпраці обговорюємо особисто.</p></div>
        </Reveal>
        {ownersTrust.expert.verified && ['name', 'role', 'bio', 'photo'].every(key => ownersTrust.expert[key]) && <Reveal className={s.expert}><div className={s.expertPhoto}><Image src={ownersTrust.expert.photo} alt={ownersTrust.expert.name} fill sizes="(max-width: 560px) 120px, 180px" /></div><div><h3>{ownersTrust.expert.name}</h3><span>{ownersTrust.expert.role}</span><p>{ownersTrust.expert.bio}</p></div></Reveal>}
        {ownersTrust.saleCase.verified && ['title', 'context', 'approach', 'result'].every(key => ownersTrust.saleCase[key]) && <Reveal className={s.saleCase}><span className={s.eyebrow}>РЕАЛЬНИЙ КЕЙС ПРОДАЖУ</span><h3>{ownersTrust.saleCase.title}</h3><p>{ownersTrust.saleCase.context}</p><p>{ownersTrust.saleCase.approach}</p><p>{ownersTrust.saleCase.result}</p></Reveal>}
        </div>
      </section>

      <section id="strategy" data-placement="strategy" className={`${s.section} ${s.strategy}`} aria-labelledby="strategy-title"><div className={s.container}>
        <Reveal className={s.strategyHeading}><div><span className={s.eyebrow}>02 / ПРОДАЖ ЗА ВАШИМИ ПРАВИЛАМИ</span><h2 id="strategy-title">Одна квартира.<br /><em>Три можливі шляхи.</em></h2></div><p>Важливо, що саме потрібно вам.<br />Дослідіть підходи — і ми допоможемо<br className={s.desktopBreak} /> обрати доречний для вашої ситуації.</p></Reveal>
        <Reveal><div className={s.scenarioTabs} role="tablist" aria-label="Сценарії продажу">{scenarios.map((item, i) => <button key={item.id} id={`tab-${item.id}`} role="tab" type="button" aria-selected={scenario === i} aria-controls="scenario-panel" tabIndex={scenario === i ? 0 : -1} className={scenario === i ? s.activeTab : ''} onClick={() => setScenario(i)} onKeyDown={event => { let next = i; if (event.key === 'ArrowRight') next = (i + 1) % 3; else if (event.key === 'ArrowLeft') next = (i + 2) % 3; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = 2; else return; event.preventDefault(); setScenario(next); document.getElementById(`tab-${scenarios[next].id}`)?.focus(); }}><span>{item.number}</span>{item.label}<ArrowUpRight size={17} /></button>)}</div>
          <div id="scenario-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`} className={s.scenarioPanel} tabIndex={0}><AnimatePresence mode="wait" initial={false}><motion.div key={active.id} className={s.scenarioContent} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}><div className={s.scenarioCopy}><span className={s.scenarioNumber}>{active.number} / СТРАТЕГІЯ</span><h3>{active.title}</h3><p>{active.description}</p><div className={s.scenarioTags}>{active.tags.map(tag => <span key={tag}><Check size={13} />{tag}</span>)}</div><p className={s.scenarioNote}>{active.note}</p></div><div className={s.scenarioVisual}><span className={s.chartKicker}>АКЦЕНТИ СТРАТЕГІЇ</span>{['Стартова ціна', 'Пріоритет швидкості', 'Запас часу'].map((label, i) => <div key={label} className={s.chartRow}><div><span>{label}</span><span>{['ЦІНА', 'ТЕМП', 'ЧАС'][i]}</span></div><div className={s.chartTrack}><motion.span initial={{ width: reduced ? `${active.bars[i]}%` : '0%' }} animate={{ width: `${active.bars[i]}%` }} transition={{ duration: reduced ? 0 : 0.7, delay: i * 0.08 }} /></div></div>)}<p>Схематичне порівняння підходів, без прогнозу ціни чи строків.</p><a href="#request" className={s.textLink}>Знайти мій сценарій <ArrowUpRight size={18} /></a></div></motion.div></AnimatePresence></div>
        </Reveal></div></section>

      <section data-placement="perspective" className={`${s.section} ${s.perspective}`} aria-labelledby="perspective-title"><div className={`${s.container} ${s.perspectiveGrid}`}><Reveal className={s.perspectiveImage}><Image src="/owners/interior-detail.jpg" alt="Продуманий сучасний інтер’єр із натуральним деревом і великими вікнами" fill sizes="(max-width: 800px) 100vw, 50vw" /><div className={s.imageCaption}><span>Кожна деталь має значення.</span><ArrowUpRight size={23} strokeWidth={1} /></div></Reveal><Reveal className={s.perspectiveCopy}><span className={s.eyebrow}>БІЛЬШЕ УВАГИ ДО ВАШОЇ НЕРУХОМОСТІ</span><h2 id="perspective-title">Покупець бачить<br />квартиру.<br /><em>Ми допомагаємо<br />побачити її цінність.</em></h2><p>Світло, планування, стан будинку, локація. Те, що для вас звичне, може стати вирішальним для покупця.</p><p>У розборі розглянемо сильні сторони квартири та те, як їх представити. Від першого фото до аргументів у переговорах.</p><a href="#request" className={s.textLink}>Почати з моєї квартири <ArrowUpRight size={18} /></a></Reveal></div></section>

      <section id="process" className={`${s.section} ${s.process}`} aria-labelledby="process-title"><div className={s.container}><Reveal className={s.processHeading}><span className={s.eyebrow}>03 / ПРОСТИЙ ПЕРШИЙ КРОК</span><h2 id="process-title">Від запитання<br /><em>до вашого плану.</em></h2></Reveal><div className={s.processGrid}>{[
        ['01', 'Кілька деталей', 'Вкажіть район, параметри квартири та зручний спосіб зв’язку. Точна адреса на цьому етапі не потрібна.'],
        ['02', 'Особиста розмова', 'Уточнимо особливості квартири, ваші плани та погодимо строк підготовки розбору.'],
        ['03', 'Персональний розбір', 'Розглянемо ціну, конкурентів і сценарії. Ви отримаєте рекомендації для наступного кроку.'],
      ].map(([number, title, text], i) => <Reveal className={s.processItem} key={number} delay={i * 0.1}><div className={s.processNumber}>{number}<ArrowRight size={20} strokeWidth={1} /></div><h3>{title}</h3><p>{text}</p></Reveal>)}</div></div></section>

      <section data-placement="request" className={`${s.section} ${s.request}`} aria-labelledby="request-title"><div className={`${s.container} ${s.requestGrid}`}><Reveal className={s.requestCopy}><span className={s.eyebrow}>ВАША КВАРТИРА. ВАШ НАСТУПНИЙ КРОК.</span><h2 id="request-title">Почніть<br />із розуміння<br /><em>можливостей.</em></h2><p>Залиште запит на персональний розбір. Обговоримо вашу ситуацію та допоможемо побачити картину продажу.</p><div className={s.requestChecks}><span><Check size={17} /> Аналіз саме вашої квартири</span><span><Check size={17} /> Зрозумілі аргументи щодо ціни</span><span><Check size={17} /> Рішення про співпрацю — за вами</span></div><a className={s.requestPhone} href={`tel:${PHONE}`}><span className={s.phoneCircle}><Phone size={19} strokeWidth={1.4} /></span><span><small>ВІДДАЄТЕ ПЕРЕВАГУ РОЗМОВІ?</small><strong>067 985 09 11</strong></span><ArrowUpRight size={19} /></a></Reveal><div ref={requestRef} id="request"><Reveal><RequestForm track={track} getAttribution={getAttribution} /></Reveal></div></div></section>

      <section id="faq" data-placement="faq" className={`${s.section} ${s.faq}`} aria-labelledby="faq-title">
        <div className={`${s.container} ${s.faqGrid}`}>
          <Reveal>
            <span className={s.eyebrow}>ДЕТАЛІ, ЯКІ МАЮТЬ ЗНАЧЕННЯ</span>
            <h2 id="faq-title">Можливо,<br /><em>ви запитаєте.</em></h2>
            <p>Залишилися запитання?<br /><a href={`tel:${PHONE}`}>Ми поруч — зателефонуйте.</a></p>
          </Reveal>
          <div className={s.faqList}>
            {questions.map(([question, answer], i) => (
              <div className={s.faqItem} key={question}>
                <h3>
                  <button type="button" id={`faq-question-${i}`} aria-expanded={faq === i} aria-controls={`faq-answer-${i}`} onClick={() => setFaq(faq === i ? -1 : i)}>
                    <span>{question}</span>
                    <ChevronDown size={19} className={faq === i ? s.faqChevronOpen : ''} />
                  </button>
                </h3>
                <div id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} aria-hidden={faq !== i} className={`${s.faqAnswer} ${faq === i ? s.faqAnswerOpen : ''}`}>
                  <div className={s.faqAnswerInner}><p>{answer}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PrivacyChoices consent={consent} onChange={updateConsent} />
    </div>

    <footer data-placement="footer" className={s.footer}><div className={s.container}><div className={s.footerTop}><Brand footer /><p>Продумані рішення<br />для вашої нерухомості.</p><a href={`tel:${PHONE}`}>067 985 09 11 <ArrowUpRight size={18} /></a></div><div className={s.footerBottom}><span>© {new Date().getFullYear()} KARAMAX. Львів.</span><div><Link href="/">Головна</Link><Link href="/views">Квартири у продажу</Link><a href="#request">Персональний розбір</a><a href="#owners-privacy" data-privacy-link>Приватність</a></div></div><p className={s.photoCredit}>Фото інтер’єрів: Unsplash. Використані для ілюстрації.</p></div></footer>
    <div data-placement="mobile_sticky" className={`${s.mobileSticky} ${stickyVisible ? s.mobileStickyVisible : ''}`} inert={!stickyVisible ? '' : undefined} aria-hidden={!stickyVisible}><a href={`tel:${PHONE}`} aria-label="Зателефонувати в KARAMAX"><Phone size={20} /></a><a href="#request">Отримати розбір <ArrowUpRight size={18} /></a></div>
  </div>;
}
