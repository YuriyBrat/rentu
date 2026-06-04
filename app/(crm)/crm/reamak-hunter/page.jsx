'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Alert,
   Box,
   Button,
   Chip,
   Divider,
   Stack,
   TextField,
   Tooltip,
   Typography,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PestControlRoundedIcon from '@mui/icons-material/PestControlRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

function buildHunterBookmarklet(origin) {
   const normalizedOrigin = String(origin || 'https://karamax.com.ua').replace(/\/+$/, '');
   const code = `(()=>{const o=${JSON.stringify(normalizedOrigin)};window.__KARAMAX_CRM_ORIGIN=o;const old=document.getElementById('karamax-reamak-hunter-loader');if(old)old.remove();const s=document.createElement('script');s.id='karamax-reamak-hunter-loader';s.src=o+'/bookmarklets/reamak-hunter.js?v='+Date.now();s.onerror=()=>alert('Не вийшло завантажити Karamax REAMAK Hunter з '+o);document.head.appendChild(s);})()`;
   return `javascript:${encodeURIComponent(code)}`;
}

function buildResetTokenBookmarklet() {
   const code = `(()=>{localStorage.removeItem('karamax_reamak_import_token');alert('Karamax REAMAK token очищено. Запусти Hunter ще раз і введи новий токен.');})()`;
   return `javascript:${encodeURIComponent(code)}`;
}

export default function ReamakHunterPage() {
   const { theme, mode } = useCRMTheme();
   const [origin, setOrigin] = useState('https://karamax.com.ua');
   const [copied, setCopied] = useState('');

   useEffect(() => {
      if (typeof window !== 'undefined') setOrigin(window.location.origin);
   }, []);

   const hunterBookmarklet = useMemo(() => buildHunterBookmarklet(origin), [origin]);
   const resetBookmarklet = useMemo(() => buildResetTokenBookmarklet(), []);

   const copy = async (value, label) => {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
   };

   const panelSx = {
      border: `1px solid ${theme.border}`,
      borderRadius: 2,
      background: mode === 'light' ? '#fff' : 'rgba(255,255,255,0.035)',
   };

   const bookmarkSx = {
      minHeight: 46,
      borderRadius: 1.5,
      px: 2,
      fontWeight: 900,
      textTransform: 'none',
      color: '#fff',
      bgcolor: theme.accent,
      '&:hover': { bgcolor: theme.accentLight || theme.accent },
   };

   return (
      <Box sx={{ maxWidth: 980, mx: 'auto', py: 2 }}>
         <Stack spacing={2.5}>
            <Stack spacing={0.75}>
               <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                     icon={<PestControlRoundedIcon />}
                     label="REAMAK Hunter"
                     sx={{ bgcolor: `${theme.accent}22`, color: theme.text, fontWeight: 800 }}
                  />
                  <Chip label="bookmarklet" sx={{ color: theme.textSoft, borderColor: theme.border }} variant="outlined" />
               </Stack>
               <Typography variant="h4" sx={{ fontWeight: 950, color: theme.text, letterSpacing: 0 }}>
                  Встановлення Hunter
               </Typography>
               <Typography sx={{ color: theme.textSoft, maxWidth: 760 }}>
                  Один раз додай кнопку в закладки браузера. Потім на сторінці REAMAK натискаєш цю закладку,
                  Hunter вмикається, і Alt+клік забирає об'єкт у базу парсингу.
               </Typography>
            </Stack>

            <Alert severity="info" sx={{ borderRadius: 2 }}>
               Якщо браузер не дає перетягнути кнопку, скопіюй код і створи закладку вручну: назва
               Karamax REAMAK Hunter, адреса закладки - скопійований код.
            </Alert>

            <Box sx={{ ...panelSx, p: 2.25 }}>
               <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                     <Tooltip title="Перетягни цю кнопку на панель закладок браузера">
                        <Button
                           component="a"
                           href={hunterBookmarklet}
                           startIcon={<PestControlRoundedIcon />}
                           sx={bookmarkSx}
                        >
                           Karamax REAMAK Hunter
                        </Button>
                     </Tooltip>
                     <Button
                        type="button"
                        variant="outlined"
                        startIcon={<ContentCopyRoundedIcon />}
                        onClick={() => copy(hunterBookmarklet, 'hunter')}
                        sx={{ borderColor: theme.border, color: theme.text, borderRadius: 1.5, minHeight: 46 }}
                     >
                        {copied === 'hunter' ? 'Скопійовано' : 'Скопіювати код'}
                     </Button>
                  </Stack>

                  <TextField
                     label="CRM origin"
                     value={origin}
                     onChange={(event) => setOrigin(event.target.value.trim())}
                     size="small"
                     helperText="Для локального тесту лишай localhost, для роботи з продакшну буде karamax.com.ua."
                     sx={{
                        maxWidth: 520,
                        '& .MuiOutlinedInput-root': { color: theme.text, borderRadius: 1.5 },
                        '& .MuiInputLabel-root, & .MuiFormHelperText-root': { color: theme.textSoft },
                        '& fieldset': { borderColor: theme.border },
                     }}
                  />
               </Stack>
            </Box>

            <Box sx={{ ...panelSx, p: 2.25 }}>
               <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                     <KeyRoundedIcon sx={{ color: theme.accent }} />
                     <Typography variant="h6" sx={{ fontWeight: 900, color: theme.text }}>
                        Токен
                     </Typography>
                  </Stack>
                  <Typography sx={{ color: theme.textSoft }}>
                     Перший запуск Hunter на REAMAK попросить токен і збереже його в localStorage саме на сайті REAMAK.
                     Якщо токен змінився, перетягни другу кнопку або натисни її на REAMAK.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                     <Button
                        component="a"
                        href={resetBookmarklet}
                        startIcon={<RestartAltRoundedIcon />}
                        sx={{
                           ...bookmarkSx,
                           bgcolor: mode === 'light' ? '#334155' : '#475569',
                           '&:hover': { bgcolor: '#64748b' },
                        }}
                     >
                        Скинути REAMAK токен
                     </Button>
                     <Button
                        type="button"
                        variant="outlined"
                        startIcon={<ContentCopyRoundedIcon />}
                        onClick={() => copy(resetBookmarklet, 'reset')}
                        sx={{ borderColor: theme.border, color: theme.text, borderRadius: 1.5, minHeight: 46 }}
                     >
                        {copied === 'reset' ? 'Скопійовано' : 'Скопіювати reset'}
                     </Button>
                  </Stack>
               </Stack>
            </Box>

            <Box sx={{ ...panelSx, p: 2.25 }}>
               <Stack spacing={1.25}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: theme.text }}>
                     Як користуватись
                  </Typography>
                  <Divider sx={{ borderColor: theme.border }} />
                  <Typography sx={{ color: theme.textSoft }}>1. Перетягни кнопку Karamax REAMAK Hunter на панель закладок.</Typography>
                  <Typography sx={{ color: theme.textSoft }}>2. Відкрий REAMAK, розгорни потрібне оголошення через “Детальніше”.</Typography>
                  <Typography sx={{ color: theme.textSoft }}>3. Натисни закладку Hunter. Курсор стане режимом вибору.</Typography>
                  <Typography sx={{ color: theme.textSoft }}>4. Затисни Alt і клікни по верхньому рядку або по деталях об'єкта.</Typography>
               </Stack>
            </Box>

            <Button
               component="a"
               href="/bookmarklets/reamak-hunter.js"
               target="_blank"
               rel="noreferrer"
               endIcon={<OpenInNewRoundedIcon />}
               sx={{ alignSelf: 'flex-start', color: theme.textSoft, textTransform: 'none' }}
            >
               Відкрити поточний JS Hunter
            </Button>
         </Stack>
      </Box>
   );
}
