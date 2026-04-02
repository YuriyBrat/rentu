'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   TextField,
   InputAdornment,
   MenuItem,
   Chip,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LeadRow from '@/crm_components/leads/LeadRow4';

const STAGE_OPTIONS = [
   { value: 'all', label: 'Усі стадії' },
   { value: 'lead', label: 'Лід' },
   { value: 'hot', label: 'Гарячий' },
   { value: 'ps', label: 'ПС' },
   { value: 'rs', label: 'РС' },
   { value: 'ds', label: 'ДС' },
   { value: 'zs', label: 'ЗС' },
   { value: 'pers', label: 'ПЕРС' },
];

const ACTUALITY_STATUSES = [
   'Актуальний. Зустріч! В роботі',
   'Актуальний. Продзвін',
   'Актуальний. Проблемний',
   'Актуальний. Зустріч! Не в роботі',
   'Неактуальний. Купив зі мною',
   'Неактуальний. Купив без мене',
   'Неактуальний. Відмова покупки',
   'Неактуальний. Невідома причина',
   'Зупинений. Завдаток мій',
   'Зупинений. Завдаток не мій',
   'Зупинений. Виявлена причина',
   'Зупинений. Невиявлена причина',
];

const demoLeads = [
   {
      id: 1,
      name: 'Іван Петренко',
      phones: ['+380971234567'],
      emails: ['ivan.petrenko@gmail.com'],
      status: 'lead',
      stage: 'lead',
      requestSummary:
         'Шукає 1-кімнатну квартиру для себе у новобудові або свіжій вторинці у Франківському районі. Важливо: нормальний стан, не перший поверх, бажано з балконом.',
      budgetMax: 60000,
      sourceChannel: 'Соцмережі',
      sourceObject: '1к квартира, вул. Трускавецька, ЖК Парус Smart',
      sourceNote: 'Написав після реклами в Instagram stories',
      assignee: 'Олег',
      createdBy: 'Марія',
      lastContactAt: '2026-03-24 11:30',
      lastActualizedAt: '2026-03-24',
      actualityStatus: 'Актуальний. Продзвін',
      createdAt: '2026-03-24',
      notes: [
         {
            text: 'Написав у директ, просив надіслати 3–4 варіанти.',
            type: 'info',
            createdAt: '2026-03-24 10:15',
         },
         {
            text: 'По бюджету поки жорстка межа, вище 60k не розглядає.',
            type: 'important',
            createdAt: '2026-03-24 11:30',
         },
      ],
   },
   {
      id: 2,
      name: 'Оксана Іванюк',
      phones: ['+380501112233'],
      emails: [],
      status: 'lead',
      stage: 'hot',
      requestSummary:
         'Шукає 2-кімнатну квартиру до 85 тис. дол. у вторинці, але розглядає і 1-кімнатну в хорошій новобудові, якщо планування велике. Потрібне швидке рішення.',
      budgetMax: 85000,
      sourceChannel: 'Рекомендація',
      sourceObject: '2к квартира, вул. Наукова, вторинка',
      sourceNote: 'Передала подруга нашої клієнтки',
      assignee: 'Юрій',
      createdBy: 'Юрій',
      lastContactAt: '2026-03-25 16:40',
      lastActualizedAt: '2026-03-25',
      actualityStatus: 'Актуальний. Зустріч! В роботі',
      createdAt: '2026-03-23',
      notes: [
         {
            text: 'Дуже зацікавлена, хоче дивитися вже цього тижня.',
            type: 'positive',
            createdAt: '2026-03-25 12:10',
         },
         {
            text: 'Попросила окремо не показувати старий радянський фонд.',
            type: 'important',
            createdAt: '2026-03-25 16:40',
         },
      ],
   },
   {
      id: 3,
      name: 'Андрій Мельник',
      duplicateState: 'possible', // або 'active'
      duplicateName: 'Іван Петренко',
      phones: ['+380661234999'],
      emails: ['a.melnyk@gmail.com'],
      status: 'client',
      stage: 'ps',
      requestSummary:
         'Шукає 1-кімнатну квартиру в новобудові АБО 2-кімнатну у вторинці. Райони: Сихів, Новий Львів, ближній центр. Для проживання з дівчиною.',
      budgetMax: 78000,
      sourceChannel: 'Сайт',
      sourceObject: '1к квартира, ЖК Avalon UP',
      sourceNote: 'Залишив заявку на сайті після перегляду картки об’єкта',
      assignee: 'Юрій',
      createdBy: 'Олег',
      lastContactAt: '2026-03-22 18:20',
      lastActualizedAt: '2026-03-22',
      actualityStatus: 'Актуальний. Зустріч! В роботі',
      createdAt: '2026-03-20',
      notes: [
         {
            text: 'Була зустріч, контакт хороший, чітко розуміє параметри.',
            type: 'important',
            createdAt: '2026-03-22 13:00',
         },
         {
            text: 'Погодився на покази у двох районах.',
            type: 'positive',
            createdAt: '2026-03-22 18:20',
         },
      ],
   },
   {
      id: 4,
      name: 'Марта Ковальчук',
      phones: ['+380931118877'],
      emails: [],
      status: 'client',
      stage: 'rs',
      requestSummary:
         'Шукає 2-кімнатну квартиру для покупки батькам. Перевага: ліфт, не високий поверх, хороший доїзд. Може розглядати і 3к старішого фонду, якщо ціна добра.',
      budgetMax: 95000,
      sourceChannel: 'Соцмережі',
      sourceObject: '2к квартира, вул. Стрийська, новобудова',
      sourceNote: 'Прийшла з таргетованої реклами у Facebook',
      assignee: 'Юрій',
      createdBy: 'Марія',
      lastContactAt: '2026-03-21 19:15',
      lastActualizedAt: '2026-03-21',
      actualityStatus: 'Актуальний. Продзвін',
      createdAt: '2026-03-17',
      notes: [
         {
            text: 'Вже було 2 покази, один варіант сподобався.',
            type: 'positive',
            createdAt: '2026-03-20 18:10',
         },
         {
            text: 'Просить ще порівняльну добірку по районах.',
            type: 'info',
            createdAt: '2026-03-21 19:15',
         },
         {
            text: 'Не любить шумні магістралі, це критичний параметр.',
            type: 'important',
            createdAt: '2026-03-21 19:16',
         },
      ],
   },
   {
      id: 5,
      name: 'Тарас Гнатюк',
      duplicateState: 'active', // або '' possible
      duplicateName: 'Іван Петренко',
      phones: ['+380671234000'],
      emails: ['taras.h@ukr.net'],
      status: 'client',
      stage: 'ds',
      requestSummary:
         'Шукає 1-кімнатну квартиру для інвестиції під оренду. Розглядає компактні новобудови або вторинку біля університетів. Основне — ліквідність і бюджет.',
      budgetMax: 52000,
      sourceChannel: 'Сайти',
      sourceObject: '1к квартира, вул. Пасічна',
      sourceNote: 'Прийшов після перегляду кількох оголошень на сайтах',
      assignee: 'Олег',
      createdBy: 'Олег',
      lastContactAt: '2026-03-23 14:10',
      lastActualizedAt: '2026-03-23',
      actualityStatus: 'Актуальний. Проблемний',
      createdAt: '2026-03-15',
      notes: [
         {
            text: 'Один варіант відпав через документи.',
            type: 'negative',
            createdAt: '2026-03-22 11:20',
         },
         {
            text: 'Клієнт готовий рухатись далі, але обережно.',
            type: 'info',
            createdAt: '2026-03-23 14:10',
         },
      ],
   },
   {
      id: 6,
      name: 'Наталя Коваль',
      phones: ['+380991234888'],
      emails: [],
      status: 'client',
      stage: 'zs',
      requestSummary:
         '3-кімнатна квартира для сім’ї з двома дітьми. Пріоритет — район із школою поруч, нормальний ремонт, кухня від 10 м², готовність до швидкої угоди.',
      budgetMax: 120000,
      sourceChannel: 'Соцмережі',
      sourceObject: '3к квартира, вул. Панча',
      sourceNote: 'Звернулась після серії постів про сімейне житло',
      assignee: 'Юрій',
      createdBy: 'Юрій',
      lastContactAt: '2026-03-23 17:55',
      lastActualizedAt: '2026-03-23',
      actualityStatus: 'Зупинений. Завдаток мій',
      createdAt: '2026-03-18',
      notes: [
         {
            text: 'Завдаток внесений, чекаємо наступний етап.',
            type: 'positive',
            createdAt: '2026-03-23 17:55',
         },
         {
            text: 'Сім’я дуже задоволена знайденим варіантом.',
            type: 'positive',
            createdAt: '2026-03-23 17:57',
         },
      ],
   },
   {
      id: 7,
      name: 'Роман Шевчук',
      phones: ['+380671231111'],
      emails: ['roman.shevchuk@gmail.com'],
      status: 'client',
      stage: 'pers',
      requestSummary:
         'Купив 2-кімнатну квартиру після повного супроводу. Зараз стадія переоформлення, документи в роботі. Для нас уже результативний кейс.',
      budgetMax: 90000,
      sourceChannel: 'Рекомендація',
      sourceObject: '2к квартира, вул. Кульпарківська',
      sourceNote: 'Прийшов по рекомендації від нашого колишнього клієнта',
      assignee: 'Юрій',
      createdBy: 'Юрій',
      lastContactAt: '2026-03-10 15:00',
      lastActualizedAt: '2026-03-10',
      actualityStatus: 'Неактуальний. Купив зі мною',
      createdAt: '2026-03-01',
      notes: [
         {
            text: 'Купив квартиру 🎉',
            type: 'positive',
            createdAt: '2026-03-10 15:00',
         },
         {
            text: 'Залишився дуже задоволений комунікацією.',
            type: 'positive',
            createdAt: '2026-03-10 15:10',
         },
         {
            text: 'Може дати ще рекомендації.',
            type: 'important',
            createdAt: '2026-03-10 15:20',
         },
      ],
   },
];

const fieldSx = {
   '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 3,
      color: '#fff',
      minHeight: 44,
      '& input': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
      },
      '& .MuiSelect-select': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
         display: 'flex',
         alignItems: 'center',
         minHeight: 'auto',
         paddingTop: '10px',
         paddingBottom: '10px',
      },
      '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
      '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.35)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(168,85,247,0.95)' },
   },
   '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.82) !important',
      fontWeight: 700,
   },
   '& .MuiSelect-icon': {
      color: 'rgba(255,255,255,0.78)',
   },
};

const selectMenuProps = {
   PaperProps: {
      sx: {
         bgcolor: '#151521',
         color: '#fff',
         border: '1px solid rgba(255,255,255,0.08)',
         '& .MuiMenuItem-root.Mui-selected': {
            bgcolor: 'rgba(139,92,246,0.22)',
         },
      },
   },
};

export default function LeadsPage() {
   const [q, setQ] = useState('');
   const [stage, setStage] = useState('all');

   const filtered = useMemo(() => {
      return demoLeads.filter((item) => {
         if (stage !== 'all' && item.stage !== stage) return false;

         const text = [
            item.name,
            item.requestSummary,
            item.sourceChannel,
            item.sourceObject,
            item.sourceNote,
            item.assignee,
            item.createdBy,
            item.actualityStatus,
            ...(item.phones || []),
            ...(item.emails || []),
            ...(item.notes || []).map((x) => x.text),
         ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

         if (q.trim() && !text.includes(q.trim().toLowerCase())) return false;

         return true;
      });
   }, [q, stage]);

   return (
      <Box
         sx={{
            p: { xs: 1.2, md: 2 },
            bgcolor: '#0b0b12',
            minHeight: '100vh',
         }}
      >
         <Stack spacing={2}>
            <Stack
               direction={{ xs: 'column', md: 'row' }}
               alignItems={{ xs: 'flex-start', md: 'center' }}
               justifyContent="space-between"
               spacing={1.2}
            >
               <Stack spacing={0.5}>
                  <Typography sx={{ color: '#fff', fontSize: 24, fontWeight: 950 }}>
                     Ліди / Клієнти
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>
                     Таблиця вхідних лідів та клієнтів у роботі з деталями, актуальністю і нотатками
                  </Typography>
               </Stack>

               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Усього: ${filtered.length}`} sx={{ color: '#fff' }} />
               </Stack>
            </Stack>

            <Stack
               direction={{ xs: 'column', lg: 'row' }}
               spacing={1.2}
               sx={{
                  p: 1.2,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
               }}
            >
               <TextField
                  placeholder="Пошук по імені, заявці, джерелу, нотатках..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position="start">
                           <SearchRoundedIcon sx={{ color: '#aaa' }} />
                        </InputAdornment>
                     ),
                  }}
               />

               <TextField
                  select
                  label="Стадія"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  sx={{ minWidth: { xs: '100%', lg: 220 }, ...fieldSx }}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  {STAGE_OPTIONS.map((x) => (
                     <MenuItem key={x.value} value={x.value}>
                        {x.label}
                     </MenuItem>
                  ))}
               </TextField>
            </Stack>

            <Stack spacing={1}>
               {filtered.map((item) => (
                  <LeadRow key={item.id} item={item} />
               ))}
            </Stack>
         </Stack>
      </Box>
   );
}