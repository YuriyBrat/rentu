'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PestControlRoundedIcon from '@mui/icons-material/PestControlRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';
import ImageLightbox from '@/crm_components/ImageLightbox';

const BASE_STAGES = 'base,inspection';

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
   '& .MuiInputBase-input': { color: `${theme.text} !important`, WebkitTextFillColor: theme.text },
});

function formatMoney(value, currency = 'USD') {
   if (!value && value !== 0) return '-';
   return `${Number(value).toLocaleString('uk-UA')} ${currency || ''}`;
}

function formatDate(value) {
   if (!value) return '-';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '-';
   return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatTime(value) {
   if (!value) return '';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '';
   return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(value) {
   if (!value) return '-';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '-';
   return d.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   });
}

function getImageUrl(image) {
   if (typeof image === 'string') return image;
   return image?.variants?.card || image?.variants?.full || image?.url || image?.sourceUrl || '';
}

function normalizeImages(images) {
   return (Array.isArray(images) ? images : [])
      .map((image) => {
         const url = getImageUrl(image);
         return url ? { ...(typeof image === 'object' ? image : {}), url } : null;
      })
      .filter(Boolean);
}

function getAddress(item) {
   return item?.location_text ||
      [item?.location?.city, item?.location?.street, item?.location?.number].filter(Boolean).join(', ') ||
      '-';
}

function getOwnerText(item) {
   const owners = Array.isArray(item?.owners) ? item.owners : [];
   const owner = owners[0] || {};
   const phones = Array.isArray(owner?.phones) ? owner.phones : [];
   return phones[0] || owner?.name || '-';
}

function getEmployeeName(employee) {
   if (!employee) return '';
   return [employee.fullName, employee.name, employee.surname].filter(Boolean).join(' ').trim() ||
      employee.email ||
      employee.phone ||
      '';
}

function getEmployeeInitials(employee) {
   const name = getEmployeeName(employee);
   if (!name) return '';
   const parts = name.split(/\s+/).filter(Boolean);
   return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
}

function getContactMeta(item) {
   if (item?.visualTags?.isRealtorObject) {
      return { label: 'Маклер', short: 'МК', color: '#ef4444', icon: <PestControlRoundedIcon fontSize="small" /> };
   }

   const owners = Array.isArray(item?.owners) ? item.owners : [];
   const activeOwner = owners.find((owner) => owner?.status === 'active') || owners[0];
   const hasOwnerContact = !!activeOwner?.name || (Array.isArray(activeOwner?.phones) && activeOwner.phones.length > 0);

   if (hasOwnerContact) {
      return { label: 'Власник', short: 'ВЛ', color: '#22c55e', icon: <PersonRoundedIcon fontSize="small" /> };
   }

   return { label: 'Невідомо', short: '?', color: '#f59e0b', icon: <PersonRoundedIcon fontSize="small" /> };
}

function getStageMeta(stage) {
   if (!stage) return { label: "Об'єкт", color: '#14b8a6' };
   if (stage === 'base') return { label: 'База', color: '#22c55e' };
   if (stage === 'inspection') return { label: 'Огляд', color: '#f59e0b' };
   if (stage === 'rs') return { label: 'РС', color: '#14b8a6' };
   if (stage === 'ds') return { label: 'ДС', color: '#8b5cf6' };
   if (stage === 'zs') return { label: 'ЗС', color: '#0ea5e9' };
   return { label: "Об'єкт", color: '#14b8a6' };
}

function getRoomFloorText(item) {
   const rooms = item?.rooms ? `${item.rooms}к` : '-';
   const floor = item?.floor || item?.floors ? `${item?.floor || '-'}/${item?.floors || '-'}` : '';
   return floor ? `${rooms} · ${floor}` : rooms;
}

function BaseRowCard({ item, onRefresh }) {
   const { theme, mode } = useCRMTheme();
   const [expanded, setExpanded] = useState(false);
   const [lightboxOpen, setLightboxOpen] = useState(false);
   const [lightboxIndex, setLightboxIndex] = useState(0);
   const images = useMemo(() => normalizeImages(item?.images), [item?.images]);
   const stage = getStageMeta(item?.crmStage);
   const contact = getContactMeta(item);
   const assigneeName = getEmployeeName(item?.assignee);
   const assigneeInitials = getEmployeeInitials(item?.assignee);
   const createdAt = item?.createdAt || item?.importedAt;

   const iconButtonSx = {
      width: 31,
      height: 31,
      borderRadius: 2,
      color: theme.text,
      border: `1px solid ${theme.border}`,
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.035)',
      '&:hover': { bgcolor: theme.hover },
   };

   return (
      <Box
         sx={{
            minHeight: 66,
            px: 1.05,
            py: 0.8,
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.025)',
            display: 'grid',
            gridTemplateColumns: {
               xs: '42px 1fr',
               lg: '44px minmax(210px, 1.35fr) 84px 74px 96px minmax(145px, 0.75fr) 82px 46px minmax(142px, auto)',
            },
            gap: 0.8,
            alignItems: 'center',
            boxShadow: mode === 'light' ? '0 10px 24px rgba(124,58,237,0.05)' : 'none',
         }}
      >
         <Box
            component="img"
            src={images[0]?.url || '/krm/logo-krm.png'}
            alt=""
            sx={{
               width: 40,
               height: 40,
               borderRadius: 1.5,
               objectFit: 'cover',
               border: `1px solid ${theme.border}`,
            }}
         />

         <Stack spacing={0.25} minWidth={0}>
            <Stack direction="row" spacing={0.6} alignItems="center" minWidth={0}>
               <Chip
                  label={stage.label}
                  size="small"
                  onClick={() => {
                     if (item?.crmStage === 'base') {
                        // Later this can open the full status dialog with inspection details.
                     }
                  }}
                  sx={{
                     height: 23,
                     borderRadius: 1.5,
                     fontSize: 10.5,
                     fontWeight: 950,
                     color: stage.color,
                     bgcolor: `${stage.color}18`,
                     border: `1px solid ${stage.color}45`,
                     cursor: item?.crmStage === 'base' ? 'pointer' : 'default',
                  }}
               />

               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13.3 }} noWrap>
                  {item?.title || 'Без назви'}
               </Typography>
            </Stack>

            <Typography sx={{ color: theme.textSoft, fontSize: 11.8 }} noWrap>
               {getAddress(item)}
            </Typography>
         </Stack>

         <Typography sx={{ color: theme.textSoft, fontSize: 12.2, display: { xs: 'none', lg: 'block' } }}>
            {getRoomFloorText(item)}
         </Typography>

         <Typography sx={{ color: theme.textSoft, fontSize: 12.2, display: { xs: 'none', lg: 'block' } }}>
            {item?.square_tot ? `${item.square_tot} м2` : '-'}
         </Typography>

         <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.2, display: { xs: 'none', lg: 'block' } }}>
            {formatMoney(item?.cost, item?.currency)}
         </Typography>

         <Stack spacing={0.15} sx={{ minWidth: 0, display: { xs: 'none', lg: 'flex' } }}>
            <Typography sx={{ color: theme.text, fontWeight: 850, fontSize: 12.4 }} noWrap>
               {getOwnerText(item)}
            </Typography>
            <Tooltip title={contact.label}>
               <Stack direction="row" spacing={0.35} alignItems="center" sx={{ color: contact.color, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', '& svg': { fontSize: 14 } }}>{contact.icon}</Box>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 950, lineHeight: 1 }} noWrap>
                     {contact.label}
                  </Typography>
               </Stack>
            </Tooltip>
         </Stack>

         <Tooltip title={`Створено: ${formatDateTime(createdAt)}\nОновлено: ${formatDateTime(item?.updatedAt)}`}>
            <Stack alignItems="center" spacing={0.05} sx={{ minWidth: 0, display: { xs: 'none', lg: 'flex' }, cursor: 'help' }}>
               <Typography sx={{ color: theme.text, fontSize: 12.1, lineHeight: 1.05, fontWeight: 750 }}>
                  {formatDate(createdAt)}
               </Typography>
               <Typography sx={{ color: theme.textSoft, fontSize: 10.5, lineHeight: 1.05, fontWeight: 450 }}>
                  {formatTime(createdAt)}
               </Typography>
            </Stack>
         </Tooltip>

         <Tooltip title={assigneeName || 'Відповідальний не призначений'}>
            <Stack
               alignItems="center"
               justifyContent="center"
               sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  display: { xs: 'none', lg: 'flex' },
                  color: assigneeName ? '#0b0b12' : theme.textSoft,
                  bgcolor: assigneeName ? theme.accent : 'rgba(148,163,184,0.12)',
                  border: `1px solid ${assigneeName ? 'transparent' : 'rgba(148,163,184,0.28)'}`,
                  fontSize: 11,
                  fontWeight: 950,
                  lineHeight: 1,
               }}
            >
               {assigneeInitials || '-'}
            </Stack>
         </Tooltip>

         <Stack direction="row" spacing={0.35} alignItems="center" justifyContent="flex-end" sx={{ gridColumn: { xs: '1 / -1', lg: 'auto' } }}>
            <Tooltip title={`Оновлено: ${formatDateTime(item?.updatedAt)}`}>
               <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                     width: 35,
                     height: 35,
                     borderRadius: 2,
                     border: '1px solid rgba(148,163,184,0.28)',
                     bgcolor: 'rgba(148,163,184,0.12)',
                     color: theme.textSoft,
                  }}
               >
                  <AccessTimeRoundedIcon sx={{ fontSize: 21 }} />
               </Stack>
            </Tooltip>

            <Typography sx={{ color: theme.textSoft, fontSize: 11, mr: 'auto', display: { xs: 'block', lg: 'none' } }}>
               {stage.label} · {contact.label} · {assigneeName || 'без відповідального'}
            </Typography>

            <Tooltip title={expanded ? 'Згорнути' : 'Розгорнути'}>
               <IconButton onClick={() => setExpanded((value) => !value)} sx={iconButtonSx}>
                  {expanded ? <KeyboardArrowUpRoundedIcon fontSize="small" /> : <KeyboardArrowDownRoundedIcon fontSize="small" />}
               </IconButton>
            </Tooltip>

            <Tooltip title="Відкрити об'єкт">
               <IconButton
                  component="a"
                  href={`/crm/objects3?property=${item._id}`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{
                     ...iconButtonSx,
                     color: '#0b0b12',
                     background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                     borderColor: 'transparent',
                  }}
               >
                  <VisibilityRoundedIcon fontSize="small" />
               </IconButton>
            </Tooltip>
         </Stack>

         {expanded && (
            <Box
               sx={{
                  gridColumn: '1 / -1',
                  mt: 0.2,
                  p: 1.15,
                  borderRadius: 2,
                  border: `1px solid ${theme.border}`,
                  bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.022)',
               }}
            >
               <Box
                  sx={{
                     display: 'grid',
                     gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr)' },
                     gap: 1.15,
                     alignItems: 'start',
                  }}
               >
                  <Stack spacing={0.55} minWidth={0}>
                     <Box sx={{ display: 'grid', gridTemplateColumns: '150px minmax(0, 1fr)', gap: 0.5, alignItems: 'start' }}>
                        <Box
                           component="button"
                           type="button"
                           onClick={() => {
                              if (!images.length) return;
                              setLightboxIndex(0);
                              setLightboxOpen(true);
                           }}
                           sx={{
                              p: 0,
                              width: '100%',
                              aspectRatio: '1 / 1',
                              borderRadius: 2,
                              border: `1px solid ${theme.border}`,
                              overflow: 'hidden',
                              cursor: images.length ? 'zoom-in' : 'default',
                              bgcolor: 'transparent',
                           }}
                        >
                           <Box component="img" src={images[0]?.url || '/krm/logo-krm.png'} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.5 }}>
                           {images.slice(1, 10).map((image, thumbIndex) => {
                              const index = thumbIndex + 1;
                              return (
                                 <Box
                                    key={`${image.url}-${index}`}
                                    component="button"
                                    type="button"
                                    onClick={() => {
                                       setLightboxIndex(index);
                                       setLightboxOpen(true);
                                    }}
                                    sx={{
                                       p: 0,
                                       aspectRatio: '1 / 1',
                                       borderRadius: 1.2,
                                       border: `1px solid ${theme.border}`,
                                       overflow: 'hidden',
                                       cursor: 'zoom-in',
                                       bgcolor: 'transparent',
                                    }}
                                 >
                                    <Box component="img" src={image.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                 </Box>
                              );
                           })}
                        </Box>
                     </Box>

                     {images.length > 10 && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.5 }}>
                           {images.slice(10, 18).map((image, thumbIndex) => {
                              const index = thumbIndex + 10;
                              return (
                                 <Box
                                    key={`${image.url}-${index}`}
                                    component="button"
                                    type="button"
                                    onClick={() => {
                                       setLightboxIndex(index);
                                       setLightboxOpen(true);
                                    }}
                                    sx={{
                                       p: 0,
                                       aspectRatio: '1 / 1',
                                       borderRadius: 1.2,
                                       border: `1px solid ${theme.border}`,
                                       overflow: 'hidden',
                                       cursor: 'zoom-in',
                                       bgcolor: 'transparent',
                                    }}
                                 >
                                    <Box component="img" src={image.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                 </Box>
                              );
                           })}
                        </Box>
                     )}
                  </Stack>

                  <Stack spacing={0.9} minWidth={0}>
                     <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={stage.label} sx={{ color: stage.color, bgcolor: `${stage.color}18`, border: `1px solid ${stage.color}45` }} />
                        <Chip size="small" label={`Контакт: ${contact.label}`} sx={{ color: contact.color, bgcolor: `${contact.color}18`, border: `1px solid ${contact.color}45` }} />
                        <Chip size="small" label={`Відповідальний: ${assigneeName || '-'}`} />
                        <Chip size="small" label={`ID: ${item?._id}`} />
                        <Chip size="small" label={`Фото: ${images.length}`} />
                        {!!item?.source && <Chip size="small" label={`Джерело: ${item.source}`} />}
                     </Stack>

                     <Box sx={{ p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: mode === 'light' ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.025)' }}>
                        <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900 }}>Ціна</Typography>
                        <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 20, lineHeight: 1.15 }}>
                           {formatMoney(item?.cost, item?.currency)}
                        </Typography>
                     </Box>

                     <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={`Контакт: ${getOwnerText(item)}`} />
                        <Chip size="small" label={item?.rooms ? `${item.rooms} кім.` : 'Кімнати -'} />
                        <Chip size="small" label={item?.square_tot ? `${item.square_tot} м2` : 'Площа -'} />
                        <Chip size="small" label={item?.floor || item?.floors ? `${item.floor || '-'}/${item.floors || '-'} поверх` : 'Поверх -'} />
                        <Chip size="small" label={`Створено: ${formatDateTime(createdAt)}`} />
                        <Chip size="small" label={`Оновлено: ${formatDateTime(item?.updatedAt)}`} />
                     </Stack>

                     <Stack spacing={0.35}>
                        <Typography sx={{ color: theme.text, fontSize: 13, fontWeight: 950 }}>Опис</Typography>
                        <Typography sx={{ color: theme.textSoft, fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                           {item?.description || 'Опису немає'}
                        </Typography>
                     </Stack>
                  </Stack>
               </Box>
            </Box>
         )}

         <ImageLightbox
            open={lightboxOpen}
            images={images}
            index={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            onChangeIndex={setLightboxIndex}
         />
      </Box>
   );
}

export default function BasePage() {
   const { theme, mode } = useCRMTheme();
   const fieldSx = getFieldSx(theme, mode);
   const [q, setQ] = useState('');
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const load = async (query = q) => {
      setLoading(true);
      setError('');

      try {
         const buildParams = (crmStage) => {
            const params = new URLSearchParams();
            params.set('mode', 'sale');
            params.set('crmStage', crmStage);
            params.set('pageSize', '100');
            if (query.trim()) params.set('q', query.trim());
            return params;
         };

         const baseParams = buildParams(BASE_STAGES);
         const workParams = buildParams('work');

         const [baseRes, workRes] = await Promise.all([
            fetch(`/api/crm/properties?${baseParams.toString()}`, { cache: 'no-store' }),
            fetch(`/api/crm/properties?${workParams.toString()}`, { cache: 'no-store' }),
         ]);

         const [baseText, workText] = await Promise.all([baseRes.text(), workRes.text()]);
         const baseData = baseText ? JSON.parse(baseText) : {};
         const workData = workText ? JSON.parse(workText) : {};

         if (!baseRes.ok) throw new Error(baseData?.error || baseText || 'Не вдалося завантажити базу');
         if (!workRes.ok) throw new Error(workData?.error || workText || 'Не вдалося завантажити обʼєкти');

         const merged = new Map();
         [...(baseData.items || []), ...(workData.items || [])].forEach((item) => {
            if (item?._id) merged.set(String(item._id), item);
         });

         setItems(
            Array.from(merged.values()).sort((a, b) => {
               const left = new Date(a.updatedAt || a.createdAt || 0).getTime();
               const right = new Date(b.updatedAt || b.createdAt || 0).getTime();
               return right - left;
            })
         );
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Не вдалося завантажити базу');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
   }, []);

   useEffect(() => {
      const t = setTimeout(() => load(q), 350);
      return () => clearTimeout(t);
   }, [q]);

   const stats = useMemo(() => {
      return items.reduce((acc, item) => {
         const key = item.crmStage === 'base' ? 'base' : item.crmStage === 'inspection' ? 'inspection' : 'object';
         acc[key] = (acc[key] || 0) + 1;
         return acc;
      }, {});
   }, [items]);

   return (
      <Box>
         <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            <Typography variant="h5" fontWeight={950} sx={{ color: theme.text, whiteSpace: 'nowrap', mr: 0.5 }}>
               База
            </Typography>

            <TextField
               placeholder="Пошук"
               size="small"
               value={q}
               onChange={(e) => setQ(e.target.value)}
               sx={{ ...fieldSx, width: { xs: '100%', sm: 260, md: 320 } }}
               InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, opacity: 0.7, color: theme.textSoft }} /> }}
            />

            <Button onClick={() => setQ('')} sx={{ minHeight: 38, borderRadius: 2.2, fontWeight: 950, color: theme.text, border: `1px solid ${theme.border}` }}>
               Скинути
            </Button>
         </Stack>

         <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            <Chip size="small" label={`База: ${stats.base || 0}`} sx={{ color: '#22c55e', bgcolor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', fontWeight: 900 }} />
            <Chip size="small" label={`Огляд: ${stats.inspection || 0}`} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', fontWeight: 900 }} />
            <Chip size="small" label={`Об'єкт: ${stats.object || 0}`} sx={{ color: '#14b8a6', bgcolor: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.35)', fontWeight: 900 }} />
         </Stack>

         {!!error && <Typography sx={{ color: '#ef4444', mb: 1.5 }}>{error}</Typography>}
         {loading && <Typography sx={{ color: theme.textSoft, mb: 1.5 }}>Завантаження...</Typography>}

         <Stack spacing={0.85}>
            {items.map((item) => (
               <BaseRowCard key={item._id} item={item} onRefresh={() => load()} />
            ))}
         </Stack>
      </Box>
   );
}
