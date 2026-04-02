'use client';

import { useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   TextField,
   InputAdornment,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LeadRow from '@/crm_components/leads/LeadRow';

const demoLeads = [
   {
      id: 1,
      name: 'Іван Петренко',
      phones: ['+380971234567'],
      status: 'lead',
      stage: 'lead',
      requestSummary: '1к до 60k',
      sourceChannel: 'social',
      sourceObject: 'Instagram ЖК Парус',
      assignee: 'Олег',
      createdBy: 'Марія',
      lastContactAt: '2026-03-24',
      createdAt: '2026-03-24',
      notes: [
         {
            text: 'Написав у директ',
            type: 'info',
            createdAt: '2026-03-24',
         },
      ],
   },
   {
      id: 2,
      name: 'Оксана Іванюк',
      phones: ['+380501112233'],
      status: 'lead',
      stage: 'hot',
      requestSummary: 'Пара для дочки. До 75тис. 1-2к. Житл стан, ремонт. Р-н без пробок в центр. Не Личаківська.',
      sourceChannel: 'recommendation',
      sourceObject: 'від клієнта',
      assignee: 'Юрій',
      createdBy: 'Юрій',
      lastContactAt: '2026-03-25',
      createdAt: '2026-03-23',
      notes: [
         {
            text: 'Дуже зацікавлена',
            type: 'positive',
            createdAt: '2026-03-25',
         },
      ],
   },
   {
      id: 3,
      name: 'Андрій Мельник',
      phones: ['+380661234999'],
      status: 'client',
      stage: 'ps',
      requestSummary: 'Заміна, продаємо 2к Стрийську і купити новобуд, менша 2к, мінімальний ремонт бажано, 20-25тис доплати, тобто 90-95тис. Франківський р-н',
      sourceChannel: 'website',
      sourceObject: 'OLX',
      assignee: 'Юрій',
      createdBy: 'Олег',
      lastContactAt: '2026-03-22',
      createdAt: '2026-03-20',
      notes: [
         {
            text: 'Була зустріч',
            type: 'important',
            createdAt: '2026-03-22',
         },
      ],
   },
   {
      id: 4,
      name: 'Наталя Коваль',
      phones: ['+380991234888'],
      status: 'client',
      stage: 'zs',
      requestSummary: '3к до 120k',
      sourceChannel: 'social',
      sourceObject: 'Facebook',
      assignee: 'Юрій',
      createdBy: 'Юрій',
      lastContactAt: '2026-03-23',
      createdAt: '2026-03-18',
      notes: [
         {
            text: 'Завдаток внесений',
            type: 'positive',
            createdAt: '2026-03-23',
         },
      ],
   },
   {
      id: 5,
      name: 'Роман Шевчук',
      phones: ['+380671234000'],
      status: 'client',
      stage: 'pers',
      requestSummary: '2к до 90k',
      sourceChannel: 'recommendation',
      sourceObject: 'знайомі',
      assignee: 'Юрій',
      createdBy: 'Юрій',
      lastContactAt: '2026-03-10',
      createdAt: '2026-03-01',
      notes: [
         {
            text: 'Купив квартиру 🎉',
            type: 'positive',
            createdAt: '2026-03-10',
         },
      ],
   },
];

export default function LeadsPage() {
   const [q, setQ] = useState('');

   const filtered = demoLeads.filter((x) =>
      (x.name + x.requestSummary + x.phones.join(' '))
         .toLowerCase()
         .includes(q.toLowerCase())
   );

   return (
      <Box sx={{ p: 2, bgcolor: '#0b0b12', minHeight: '100vh' }}>
         <Stack spacing={2}>
            <Typography sx={{ color: '#fff', fontSize: 24, fontWeight: 900 }}>
               Ліди / Клієнти
            </Typography>

            <TextField
               placeholder="Пошук..."
               value={q}
               onChange={(e) => setQ(e.target.value)}
               sx={{
                  '& .MuiOutlinedInput-root': {
                     bgcolor: 'rgba(255,255,255,0.04)',
                     borderRadius: 3,
                     color: '#fff',
                  },
               }}
               InputProps={{
                  startAdornment: (
                     <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ color: '#aaa' }} />
                     </InputAdornment>
                  ),
               }}
            />

            <Stack spacing={1}>
               {filtered.map((item) => (
                  <LeadRow key={item.id} item={item} />
               ))}
            </Stack>
         </Stack>
      </Box>
   );
}