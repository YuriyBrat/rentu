import {
   Box,
   Chip,
   Divider,
   Stack,
   Typography,
} from '@mui/material';

const roles = [
   { code: 'owner', title: 'Власник', text: 'Повний доступ до CRM, рекламного кабінету, всіх об’єктів і рекламних дій.' },
   { code: 'admin', title: 'Адміністратор', text: 'Операційно бачить усе так само, як власник.' },
   { code: 'realtor', title: 'Рієлтор', text: 'Бачить свої об’єкти, об’єкти підлеглих і призначені рекламні задачі.' },
   { code: 'trainee', title: 'Стажер', text: 'Працює як молодша CRM-роль із доступом за ієрархією.' },
   { code: 'manager', title: 'Стажер, старі записи', text: 'Legacy-роль: лишається для сумісності, у нових формах замінена на стажера.' },
   { code: 'marketing', title: 'Маркетинг', text: 'Після входу одразу відкриває рекламний кабінет і не заходить на інші CRM-сторінки.' },
   { code: 'callcenter', title: 'Кол-центр', text: 'Має доступ до CRM-роботи, але рекламний кабінет закритий.' },
   { code: 'viewer', title: 'Перегляд', text: 'Обмежений перегляд за правилами видимості об’єктів.' },
];

const rules = [
   'Власник і адміністратор бачать усе.',
   'Інші ролі бачать свої об’єкти, об’єкти нижче по дереву керівника і призначені їм рекламні задачі.',
   'Рекламні дії показуються тільки по тих об’єктах, які користувачу дозволено бачити.',
   'Кол-центр не має входу в рекламний кабінет навіть через пряме посилання.',
];

export default function CrmRolesPage() {
   return (
      <Box sx={{ p: { xs: 2, md: 3 }, color: '#f4f4fb' }}>
         <Stack spacing={2.2}>
            <Box>
               <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: 0 }}>
                  Логіка ролей CRM
               </Typography>
               <Typography sx={{ color: 'rgba(244,244,251,0.68)', fontWeight: 750 }}>
                  Коротка карта доступів, ієрархії та входу в рекламний кабінет.
               </Typography>
            </Box>

            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
                  gap: 1.2,
               }}
            >
               {roles.map((role) => (
                  <Box
                     key={role.code}
                     sx={{
                        border: '1px solid rgba(255,255,255,0.10)',
                        bgcolor: 'rgba(255,255,255,0.035)',
                        borderRadius: 2,
                        p: 1.4,
                        minHeight: 126,
                     }}
                  >
                     <Stack spacing={1}>
                        <Chip label={role.code} size="small" sx={{ alignSelf: 'flex-start', height: 22, fontWeight: 900 }} />
                        <Typography sx={{ fontWeight: 950 }}>{role.title}</Typography>
                        <Typography sx={{ color: 'rgba(244,244,251,0.70)', fontSize: 13, lineHeight: 1.45 }}>
                           {role.text}
                        </Typography>
                     </Stack>
                  </Box>
               ))}
            </Box>

            <Box
               sx={{
                  border: '1px solid rgba(255,255,255,0.10)',
                  bgcolor: 'rgba(255,255,255,0.035)',
                  borderRadius: 2,
                  p: 1.6,
               }}
            >
               <Typography sx={{ fontWeight: 950, mb: 1 }}>Правила видимості</Typography>
               <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.2 }} />
               <Stack spacing={0.85}>
                  {rules.map((rule) => (
                     <Typography key={rule} sx={{ color: 'rgba(244,244,251,0.74)', fontWeight: 750 }}>
                        {rule}
                     </Typography>
                  ))}
               </Stack>
            </Box>
         </Stack>
      </Box>
   );
}
