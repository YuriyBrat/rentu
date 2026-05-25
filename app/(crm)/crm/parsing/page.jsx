'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Alert,
   Box,
   Button,
   Chip,
   Divider,
   Drawer,
   MenuItem,
   Stack,
   TextField,
   Typography,
} from '@mui/material';

import CallRoundedIcon from '@mui/icons-material/CallRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';
import ParsingRowCard, { STAGE_META } from './ParsingRowCard';

const DEMO_ITEMS = [
   {
      _id: 'demo-1',
      source: 'olx',
      sourceUrl: 'https://www.olx.ua/',
      importedAt: new Date().toISOString(),
      stage: 'raw',
      title: '2-кімнатна квартира біля парку',
      location_text: 'Львів, Франківський район',
      rooms: 2,
      square_tot: 58,
      floor: 4,
      floors: 9,
      cost: 78500,
      currency: 'USD',
      phone: '+380671112233',
      leadname: 'Власник',
      reviewStatus: 'owner',
      attrs: { phoneCount: 1, contactType: 'owner' },
      description: 'Сире оголошення з парсингу. Треба перевірити власника, актуальність ціни і фото.',
      images: ['/krm/logo-krm.png'],
   },
   {
      _id: 'demo-2',
      source: 'telegram',
      importedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      stage: 'processing',
      title: 'Оренда комерції, фасад',
      location_text: 'Львів, вул. Городоцька',
      square_tot: 96,
      floor: 1,
      cost: 1100,
      currency: 'USD',
      phone: '+380931234567',
      reviewStatus: 'realtor',
      attrs: { phoneCount: 4, contactType: 'realtor' },
      description: 'Оператор взяв у роботу. Перевіряємо чи це власник і чи не дубль нашого обʼєкта.',
      images: ['/krm/logo-krm.png'],
   },
];

const STAGE_OPTIONS = [
   ['all', 'Усі'],
   ['raw', 'Нові'],
   ['processing', 'В роботі'],
   ['called', 'Продзвонені'],
   ['qualified', 'База ринку'],
   ['duplicate', 'Дублі'],
   ['fake', 'Фейки'],
   ['rejected', 'Відхилені'],
   ['moved', 'В обʼєктах'],
];

const getFieldSx = (theme, mode) => ({
   '& .MuiOutlinedInput-root': {
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: theme.text,
      '& fieldset': { borderColor: theme.border },
      '&:hover fieldset': { borderColor: theme.accent },
      '&.Mui-focused fieldset': { borderColor: theme.accentLight },
   },
   '& .MuiInputLabel-root': { color: theme.textSoft },
   '& .MuiInputBase-input': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& textarea': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& .MuiSelect-icon': { color: theme.text },
});

function formatDateTime(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   });
}

function getAddress(item) {
   return item?.location_text ||
      [item?.location?.city, item?.location?.street, item?.location?.number].filter(Boolean).join(', ') ||
      '—';
}

export default function ParsingPage() {
   const { theme, mode } = useCRMTheme();
   const fieldSx = getFieldSx(theme, mode);

   const [q, setQ] = useState('');
   const [stage, setStage] = useState('all');
   const [source, setSource] = useState('all');
   const [items, setItems] = useState([]);
   const [sources, setSources] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [selected, setSelected] = useState(null);
   const [draft, setDraft] = useState({ callResult: '', reviewNote: '' });

   const load = async () => {
      setLoading(true);
      setError('');

      try {
         const params = new URLSearchParams();
         if (q.trim()) params.set('q', q.trim());
         if (stage) params.set('stage', stage);
         if (source) params.set('source', source);

         const res = await fetch(`/api/crm/parsing?${params.toString()}`, { cache: 'no-store' });
         const text = await res.text();
         const data = text ? JSON.parse(text) : {};

         if (!res.ok) throw new Error(data?.error || text || 'Не вдалося завантажити парсинг');

         setItems(Array.isArray(data?.items) ? data.items : []);
         setSources(Array.isArray(data?.sources) ? data.sources.filter(Boolean) : []);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Не вдалося завантажити парсинг');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
   }, []);

   useEffect(() => {
      const t = setTimeout(load, 350);
      return () => clearTimeout(t);
   }, [q, stage, source]);

   const visibleItems = useMemo(() => {
      if (items.length) return items;
      if (loading || error) return [];
      return DEMO_ITEMS;
   }, [items, loading, error]);

   const stats = useMemo(() => {
      return visibleItems.reduce((acc, item) => {
         const key = item.stage || 'raw';
         acc[key] = (acc[key] || 0) + 1;
         return acc;
      }, {});
   }, [visibleItems]);

   const patchItem = async (item, payload) => {
      if (String(item?._id || '').startsWith('demo-')) {
         const demoPayload = payload?.action === 'moveToObjects'
            ? { ...payload, stage: 'moved' }
            : payload;

         setItems((prev) => {
            const base = prev.length ? prev : DEMO_ITEMS;
            return base.map((x) => x._id === item._id ? { ...x, ...demoPayload } : x);
         });
         if (selected?._id === item._id) setSelected((prev) => ({ ...prev, ...demoPayload }));
         return;
      }

      const res = await fetch(`/api/crm/parsing/${item._id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Не вдалося оновити оголошення');

      setItems((prev) => prev.map((x) => x._id === item._id ? data.item : x));
      if (selected?._id === item._id) setSelected(data.item);
   };

   const handleStage = async (item, nextStage) => {
      try {
         await patchItem(item, {
            stage: nextStage,
            reviewStatus: nextStage === 'qualified' ? 'actual' : item.reviewStatus,
            lastCallAt: nextStage === 'called' || nextStage === 'qualified' ? new Date().toISOString() : item.lastCallAt,
         });
      } catch (e) {
         setError(e?.message || 'Не вдалося оновити статус');
      }
   };

   const handleSaveCall = async () => {
      if (!selected) return;

      try {
         await patchItem(selected, {
            stage: selected.stage === 'raw' ? 'called' : selected.stage,
            callResult: draft.callResult,
            reviewNote: draft.reviewNote,
            lastCallAt: new Date().toISOString(),
         });
      } catch (e) {
         setError(e?.message || 'Не вдалося зберегти продзвін');
      }
   };

   const handleMove = async (item) => {
      try {
         await patchItem(item, { action: 'moveToObjects' });
      } catch (e) {
         setError(e?.message || 'Не вдалося перенести в обʼєкти');
      }
   };

   const openItem = (item) => {
      setSelected(item);
      setDraft({
         callResult: item?.callResult || '',
         reviewNote: item?.reviewNote || '',
      });
   };

   return (
      <Box>
         <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.4}
            alignItems={{ xs: 'stretch', lg: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 2.2 }}
         >
            <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
               <Typography variant="h5" fontWeight={950} sx={{ color: theme.text, whiteSpace: 'nowrap', mr: 1 }}>
                  Парсинг
               </Typography>

               <TextField
                  placeholder="Пошук оголошення, адреси, телефону..."
                  size="small"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  sx={{ ...fieldSx, minWidth: 260, flex: 1, maxWidth: 420 }}
                  InputProps={{
                     startAdornment: <SearchRoundedIcon sx={{ mr: 1, opacity: 0.7, color: theme.textSoft }} />,
                  }}
               />

               <TextField select size="small" label="Статус" value={stage} onChange={(e) => setStage(e.target.value)} sx={{ ...fieldSx, minWidth: 160 }}>
                  {STAGE_OPTIONS.map(([value, label]) => (
                     <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
               </TextField>

               <TextField select size="small" label="Джерело" value={source} onChange={(e) => setSource(e.target.value)} sx={{ ...fieldSx, minWidth: 150 }}>
                  <MenuItem value="all">Усі</MenuItem>
                  {sources.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
               </TextField>

               <Button
                  onClick={() => {
                     setQ('');
                     setStage('all');
                     setSource('all');
                  }}
                  sx={{ height: 40, borderRadius: 3, fontWeight: 900, color: theme.text, border: `1px solid ${theme.border}`, px: 2 }}
               >
                  Скинути
               </Button>
            </Stack>
         </Stack>

         <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            {Object.entries(STAGE_META).map(([key, meta]) => (
               <Chip
                  key={key}
                  label={`${meta.label}: ${stats[key] || 0}`}
                  size="small"
                  sx={{
                     height: 25,
                     borderRadius: 1.5,
                     fontWeight: 900,
                     color: meta.color,
                     bgcolor: `${meta.color}14`,
                     border: `1px solid ${meta.color}35`,
                  }}
               />
            ))}
         </Stack>

         {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>{error}</Alert>}

         {!items.length && !loading && !error && (
            <Alert severity="info" sx={{ mb: 1.5, borderRadius: 2 }}>
               У базі поки немає записів, тому показую демо-рядки майбутнього потоку.
            </Alert>
         )}

         <Stack spacing={0.85}>
            {visibleItems.map((item) => (
               <ParsingRowCard
                  key={item._id}
                  item={item}
                  onOpen={openItem}
                  onStage={handleStage}
               />
            ))}
         </Stack>

         <Drawer
            anchor="right"
            open={!!selected}
            onClose={() => setSelected(null)}
            PaperProps={{
               sx: {
                  width: { xs: '100%', sm: 520 },
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  borderLeft: `1px solid ${theme.border}`,
               },
            }}
         >
            {selected && (
               <Stack spacing={1.5} sx={{ p: 2.2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                     <Box minWidth={0}>
                        <Typography sx={{ fontWeight: 950, fontSize: 19 }} noWrap>
                           {selected.title || 'Оголошення'}
                        </Typography>
                        <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                           {selected.source || 'manual'} · {formatDateTime(selected.importedAt)}
                        </Typography>
                     </Box>

                     <Chip
                        label={(STAGE_META[selected.stage] || STAGE_META.raw).label}
                        sx={{
                           fontWeight: 950,
                           color: (STAGE_META[selected.stage] || STAGE_META.raw).color,
                           bgcolor: `${(STAGE_META[selected.stage] || STAGE_META.raw).color}18`,
                        }}
                     />
                  </Stack>

                  <Divider sx={{ borderColor: theme.border }} />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                     <Chip label={getAddress(selected)} />
                     <Chip label={selected.rooms ? `${selected.rooms} кімн.` : 'Кімн. —'} />
                     <Chip label={selected.square_tot ? `${selected.square_tot} м²` : 'Площа —'} />
                     <Chip label={selected.cost ? `${Number(selected.cost).toLocaleString('uk-UA')} ${selected.currency || ''}` : 'Ціна —'} />
                  </Stack>

                  <Stack spacing={0.65}>
                     <Typography sx={{ color: theme.text, fontWeight: 950 }}>Контакт</Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 14 }}>
                        {selected.leadname || 'Імʼя —'} · {selected.phone || 'Телефон —'} · {selected.email || 'Email —'}
                     </Typography>
                  </Stack>

                  <Stack spacing={0.65}>
                     <Typography sx={{ color: theme.text, fontWeight: 950 }}>Опис</Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                        {selected.description || 'Опису немає'}
                     </Typography>
                  </Stack>

                  <TextField
                     label="Результат дзвінка"
                     value={draft.callResult}
                     onChange={(e) => setDraft((p) => ({ ...p, callResult: e.target.value }))}
                     fullWidth
                     multiline
                     minRows={3}
                     sx={fieldSx}
                  />

                  <TextField
                     label="Нотатка перевірки"
                     value={draft.reviewNote}
                     onChange={(e) => setDraft((p) => ({ ...p, reviewNote: e.target.value }))}
                     fullWidth
                     multiline
                     minRows={3}
                     sx={fieldSx}
                  />

                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                     <Button
                        startIcon={<CallRoundedIcon />}
                        onClick={handleSaveCall}
                        sx={{ borderRadius: 3, fontWeight: 950, color: theme.text, border: `1px solid ${theme.border}` }}
                     >
                        Зберегти продзвін
                     </Button>
                     <Button
                        startIcon={<DoneAllRoundedIcon />}
                        onClick={() => handleStage(selected, 'qualified')}
                        sx={{ borderRadius: 3, fontWeight: 950, color: '#0b0b12', bgcolor: '#22c55e' }}
                     >
                        В базу ринку
                     </Button>
                     <Button
                        startIcon={<HomeWorkRoundedIcon />}
                        onClick={() => handleMove(selected)}
                        sx={{
                           borderRadius: 3,
                           fontWeight: 950,
                           color: '#0b0b12',
                           background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                        }}
                     >
                        В обʼєкти
                     </Button>
                  </Stack>
               </Stack>
            )}
         </Drawer>
      </Box>
   );
}
