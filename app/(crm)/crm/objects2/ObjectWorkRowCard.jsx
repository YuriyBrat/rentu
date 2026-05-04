'use client';

import { useState } from 'react';
import {
   Box,
   Typography,
   Button,
   TextField,
   Stack,
   Chip,
   Collapse,
   Divider,
   IconButton,
   Tooltip,
   Grid,
   MenuItem,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import BedRoundedIcon from '@mui/icons-material/BedRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';


const darkFieldSx = {
   '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: '#fff',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.14)' },
      '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.45)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(168,85,247,0.9)' },
   },
   '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.75)',
   },
   '& .MuiInputBase-input': {
      color: '#fff',
   },
   '& .MuiSelect-icon': {
      color: '#fff',
   },
};


function formatMoney(value, currency = 'USD') {
   if (!value && value !== 0) return '—';
   return `${Number(value).toLocaleString('uk-UA')} ${currency || ''}`;
}

function formatDate(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleDateString('uk-UA');
}

function getImageUrl(item) {
   const images = Array.isArray(item?.images) ? item.images : [];
   const visible = images
      .filter((img) => !img?.isHidden)
      .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));

   const main = visible.find((img) => img?.isMain) || visible[0];

   return (
      main?.variants?.branded ||
      main?.brandedUrl ||
      main?.variants?.card ||
      main?.processedUrl ||
      main?.variants?.preview ||
      main?.url ||
      '/krm/logo-krm.png'
   );
}

function getEmployeeName(employee) {
   if (!employee) return '—';

   return (
      employee.fullName ||
      [employee.surname, employee.name].filter(Boolean).join(' ') ||
      employee.name ||
      employee.email ||
      '—'
   );
}

function getActualityLabel(group) {
   if (group === 'active') return 'Актуальний';
   if (group === 'paused') return 'Зупинений';
   if (group === 'inactive') return 'Неактуальний';
   return 'Статус';
}

function getRentStatusLabel(statusRent) {
   if (statusRent === 'rentActual') return 'Оренда актуальна';
   if (statusRent === 'rentPause') return 'Оренда пауза';
   if (statusRent === 'rentRented') return 'Зданий';
   return '';
}

function getEstateLabel(type) {
   if (type === 'flat') return 'Квартира';
   if (type === 'house') return 'Будинок';
   if (type === 'commerce') return 'Комерція';
   if (type === 'land') return 'Ділянка';
   return type || 'Об’єкт';
}

function InfoPill({ icon, label, value }) {
   return (
      <Stack
         direction="row"
         spacing={0.7}
         alignItems="center"
         sx={{
            px: 1,
            py: 0.75,
            borderRadius: 2.5,
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            minWidth: 0,
         }}
      >
         <Box sx={{ color: 'rgba(255,255,255,0.58)', display: 'flex' }}>
            {icon}
         </Box>

         <Stack spacing={0.1} minWidth={0}>
            <Typography sx={{ color: 'rgba(255,255,255,0.52)', fontSize: 10.5, lineHeight: 1 }}>
               {label}
            </Typography>
            <Typography
               sx={{ color: '#fff', fontSize: 12.5, fontWeight: 850, lineHeight: 1.1 }}
               noWrap
            >
               {value || '—'}
            </Typography>
         </Stack>
      </Stack>
   );
}

function DetailBox({ title, children }) {
   return (
      <Box
         sx={{
            p: 1.2,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            height: '100%',
         }}
      >
         <Typography sx={{ color: '#fff', fontWeight: 900, mb: 0.8 }}>
            {title}
         </Typography>
         <Stack spacing={0.55}>{children}</Stack>
      </Box>
   );
}

function DetailLine({ label, value }) {
   if (!value && value !== 0) return null;

   return (
      <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: 13 }}>
         <b style={{ color: '#fff' }}>{label}:</b> {value}
      </Typography>
   );
};

const handleAddNote = async () => {
   try {
      const res = await fetch(`/api/crm/properties/${item._id}/add-note`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            text: noteText,
            type: noteType,
         }),
      });

      if (!res.ok) throw new Error('Помилка');

      setNoteText('');

      // тут або перезавантажити список
      // або оновити локально (краще поки reload)
      window.location.reload();

   } catch (e) {
      console.error(e);
   }
};

const handleAddAdText = async () => {
   try {
      const res = await fetch(`/api/crm/properties/${item._id}/add-ad-text`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            title: adTitle,
            text: adText,
            note: adNote,
         }),
      });

      if (!res.ok) throw new Error();

      setAdTitle('');
      setAdText('');
      setAdNote('');

      window.location.reload();
   } catch (e) {
      console.error(e);
   }
};




function getPlatformLabel(platform) {
   if (platform === 'olx') return 'OLX';
   if (platform === 'dimria') return 'DIM.RIA';
   if (platform === 'rieltor') return 'RIELTOR';
   if (platform === 'facebook') return 'Facebook';
   if (platform === 'instagram') return 'Instagram';
   if (platform === 'site') return 'Сайт';
   return 'Інше';
}

function getAdStatusLabel(status) {
   if (status === 'active') return 'Активна';
   if (status === 'paused') return 'Пауза';
   if (status === 'archived') return 'Архів';
   if (status === 'problem') return 'Проблема';
   return '—';
}



export default function ObjectWorkRowCard({ item, onEdit, onView, onDelete }) {
   const [open, setOpen] = useState(false);

   const [noteText, setNoteText] = useState('');
   const [noteType, setNoteType] = useState('note');

   const [adTitle, setAdTitle] = useState('');
   const [adText, setAdText] = useState('');
   const [adNote, setAdNote] = useState('');



   const [adPlatform, setAdPlatform] = useState('olx');
   const [adUrl, setAdUrl] = useState('');
   const [adTitleLink, setAdTitleLink] = useState('');
   const [adNoteLink, setAdNoteLink] = useState('');


   const image = getImageUrl(item);
   const assigneeName = getEmployeeName(item?.assignee);
   const createdByName = getEmployeeName(item?.createdByEmployee);

   const locationText =
      item?.location_text ||
      [item?.location?.city, item?.location?.street, item?.location?.number]
         .filter(Boolean)
         .join(', ') ||
      'Адреса не вказана';

   const rentStatusLabel = getRentStatusLabel(item?.statusRent);
   const hasRent = item?.statusRent && item.statusRent !== 'rentNo';


   const handleAddAdvertisingLink = async () => {
      if (!adUrl.trim()) return;

      const res = await fetch(`/api/crm/properties/${item._id}/advertising-links`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            platform: adPlatform,
            url: adUrl.trim(),
            title: adTitleLink.trim(),
            note: adNoteLink.trim(),
            status: 'active',
         }),
      });

      if (!res.ok) {
         alert('Не вдалося додати посилання');
         return;
      }

      setAdUrl('');
      setAdTitleLink('');
      setAdNoteLink('');

      window.location.reload();
   };


   return (
      <Box
         sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(255,255,255,0.03)',
            boxShadow: open ? '0 18px 44px rgba(0,0,0,0.22)' : 'none',
         }}
      >
         <Box sx={{ p: 1.15 }}>
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     md: '150px minmax(0, 1fr)',
                     lg: '150px minmax(0, 1fr) 210px',
                  },
                  gap: 1.15,
                  alignItems: 'center',
               }}
            >
               <Box
                  sx={{
                     height: 108,
                     borderRadius: 3,
                     overflow: 'hidden',
                     border: '1px solid rgba(255,255,255,0.07)',
                     bgcolor: 'rgba(255,255,255,0.04)',
                  }}
               >
                  <Box
                     component="img"
                     src={image}
                     alt={item?.title || 'object'}
                     sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                     }}
                  />
               </Box>

               <Stack spacing={0.8} minWidth={0}>
                  <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                     <Chip
                        label={getActualityLabel(item?.actualityGroup)}
                        size="small"
                        sx={{
                           color: '#d1fae5',
                           bgcolor: 'rgba(16,185,129,0.13)',
                           border: '1px solid rgba(16,185,129,0.22)',
                           fontWeight: 850,
                        }}
                     />

                     <Chip
                        label={getEstateLabel(item?.type_estate)}
                        size="small"
                        sx={{
                           color: '#fff',
                           bgcolor: 'rgba(255,255,255,0.05)',
                           border: '1px solid rgba(255,255,255,0.08)',
                           fontWeight: 800,
                        }}
                     />

                     <Chip
                        label={item?.type_deal || 'Угода'}
                        size="small"
                        sx={{
                           color: '#ddd6fe',
                           bgcolor: 'rgba(139,92,246,0.15)',
                           border: '1px solid rgba(139,92,246,0.24)',
                           fontWeight: 800,
                        }}
                     />

                     {hasRent && (
                        <Chip
                           label={rentStatusLabel}
                           size="small"
                           sx={{
                              color: '#bfdbfe',
                              bgcolor: 'rgba(59,130,246,0.13)',
                              border: '1px solid rgba(59,130,246,0.22)',
                              fontWeight: 800,
                           }}
                        />
                     )}

                     {item?.isPublic && (
                        <Chip
                           label="На сайті"
                           size="small"
                           sx={{
                              color: '#bbf7d0',
                              bgcolor: 'rgba(34,197,94,0.13)',
                              border: '1px solid rgba(34,197,94,0.22)',
                           }}
                        />
                     )}
                  </Stack>

                  <Typography
                     sx={{
                        color: '#fff',
                        fontWeight: 950,
                        fontSize: { xs: 16, md: 18 },
                        lineHeight: 1.15,
                     }}
                     noWrap
                  >
                     {item?.title || 'Без назви'}
                  </Typography>

                  <Typography
                     sx={{
                        color: 'rgba(255,255,255,0.64)',
                        fontSize: 13,
                     }}
                     noWrap
                  >
                     {locationText}
                  </Typography>

                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                     <InfoPill
                        icon={<PaidRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Продаж"
                        value={item?.cost ? formatMoney(item.cost, item.currency) : '—'}
                     />

                     {hasRent && (
                        <InfoPill
                           icon={<HomeWorkRoundedIcon sx={{ fontSize: 16 }} />}
                           label="Оренда"
                           value={
                              item?.rentOptions?.price
                                 ? formatMoney(item.rentOptions.price, item.rentOptions.currency)
                                 : '—'
                           }
                        />
                     )}

                     <InfoPill
                        icon={<BedRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Кімнат"
                        value={item?.rooms || '—'}
                     />

                     <InfoPill
                        icon={<SquareFootRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Площа"
                        value={item?.square_tot ? `${item.square_tot} м²` : '—'}
                     />

                     <InfoPill
                        icon={<ApartmentRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Поверх"
                        value={
                           item?.floor
                              ? `${item.floor}${item?.floors ? ` / ${item.floors}` : ''}`
                              : '—'
                        }
                     />

                     <InfoPill
                        icon={<PersonRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Відповідальний"
                        value={assigneeName}
                     />
                  </Stack>
               </Stack>

               <Stack spacing={0.75} alignItems={{ xs: 'stretch', lg: 'flex-end' }}>
                  <Button
                     onClick={() => setOpen((p) => !p)}
                     endIcon={open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                     sx={{
                        borderRadius: 3,
                        color: '#fff',
                        fontWeight: 900,
                        border: '1px solid rgba(255,255,255,0.10)',
                        bgcolor: 'rgba(255,255,255,0.04)',
                     }}
                  >
                     {open ? 'Згорнути' : 'Детальніше'}
                  </Button>

                  <Button
                     onClick={() => onView?.(item)}
                     startIcon={<VisibilityRoundedIcon />}
                     sx={{
                        borderRadius: 3,
                        color: '#fff',
                        fontWeight: 850,
                        border: '1px solid rgba(139,92,246,0.25)',
                        bgcolor: 'rgba(139,92,246,0.10)',
                     }}
                  >
                     Перейти
                  </Button>

                  <Stack direction="row" spacing={0.75}>
                     <Tooltip title="Редагувати">
                        <IconButton
                           onClick={() => onEdit?.(item)}
                           sx={{
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.10)',
                              bgcolor: 'rgba(255,255,255,0.04)',
                           }}
                        >
                           <EditRoundedIcon />
                        </IconButton>
                     </Tooltip>

                     <Tooltip title="Видалити">
                        <IconButton
                           onClick={() => onDelete?.(item)}
                           sx={{
                              color: '#ffb4b4',
                              border: '1px solid rgba(255,82,82,0.20)',
                              bgcolor: 'rgba(255,82,82,0.06)',
                           }}
                        >
                           <DeleteOutlineRoundedIcon />
                        </IconButton>
                     </Tooltip>
                  </Stack>
               </Stack>
            </Box>
         </Box>

         {!!item?.advertisingLinks?.length && (
            <Box
               sx={{
                  px: 1.15,
                  pb: 1,
               }}
            >
               <Stack
                  direction="row"
                  spacing={0.7}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{
                     pt: 0.8,
                     borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}
               >
                  {item.advertisingLinks.slice(0, 8).map((link) => (
                     <Button
                        key={link._id || link.url}
                        component="a"
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        sx={{
                           minHeight: 26,
                           px: 1,
                           py: 0.25,
                           borderRadius: 999,
                           fontSize: 11,
                           fontWeight: 900,
                           color:
                              link.status === 'problem'
                                 ? '#fecaca'
                                 : link.status === 'paused'
                                    ? '#fde68a'
                                    : '#bfdbfe',
                           bgcolor:
                              link.status === 'problem'
                                 ? 'rgba(239,68,68,0.12)'
                                 : link.status === 'paused'
                                    ? 'rgba(245,158,11,0.12)'
                                    : 'rgba(59,130,246,0.12)',
                           border:
                              link.status === 'problem'
                                 ? '1px solid rgba(239,68,68,0.22)'
                                 : link.status === 'paused'
                                    ? '1px solid rgba(245,158,11,0.22)'
                                    : '1px solid rgba(59,130,246,0.22)',
                        }}
                     >
                        {getPlatformLabel(link.platform)}
                     </Button>
                  ))}
               </Stack>
            </Box>
         )}


         <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

            <Box sx={{ p: 1.35 }}>
               <DetailBox title="Історія роботи">
                  <Stack spacing={1}>
                     <Stack direction="row" spacing={1}>
                        <Button
                           size="small"
                           variant={noteType === 'note' ? 'contained' : 'outlined'}
                           onClick={() => setNoteType('note')}
                        >
                           Нотатка
                        </Button>
                        <Button
                           size="small"
                           variant={noteType === 'call' ? 'contained' : 'outlined'}
                           onClick={() => setNoteType('call')}
                        >
                           Дзвінок
                        </Button>
                        <Button
                           size="small"
                           variant={noteType === 'message' ? 'contained' : 'outlined'}
                           onClick={() => setNoteType('message')}
                        >
                           Переписка
                        </Button>
                        <Button
                           size="small"
                           variant={noteType === 'meeting' ? 'contained' : 'outlined'}
                           onClick={() => setNoteType('meeting')}
                        >
                           Зустріч
                        </Button>
                     </Stack>

                     <TextField
                        size="small"
                        multiline
                        minRows={2}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Додати запис..."
                        fullWidth
                     />

                     <Button
                        variant="contained"
                        onClick={handleAddNote}
                        disabled={!noteText.trim()}
                     >
                        Додати
                     </Button>

                     <Divider sx={{ my: 1 }} />

                     {(item?.workHistory || []).slice(0, 5).map((n, i) => (
                        <Box key={i}>
                           <Typography sx={{ fontSize: 12, color: '#aaa' }}>
                              {new Date(n.createdAt).toLocaleString('uk-UA')}
                           </Typography>
                           <Typography sx={{ fontSize: 13 }}>
                              [{n.type}] {n.text}
                           </Typography>
                        </Box>
                     ))}
                  </Stack>
               </DetailBox>

               <Grid container spacing={1.2}>
                  <Grid item xs={12} md={6}>
                     <DetailBox title="Робочий стан">
                        <DetailLine label="Група" value={getActualityLabel(item?.actualityGroup)} />
                        <DetailLine label="Статус роботи" value={item?.actualityStatus} />
                        <DetailLine label="Примітка" value={item?.actualityNote} />
                        <DetailLine label="Відповідальний" value={assigneeName} />
                        <DetailLine label="Хто вніс" value={createdByName} />
                     </DetailBox>
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <DetailBox title="Основні дані">
                        <DetailLine label="Тип об’єкта" value={getEstateLabel(item?.type_estate)} />
                        <DetailLine label="Тип угоди" value={item?.type_deal} />
                        <DetailLine label="Ціна продажу" value={formatMoney(item?.cost, item?.currency)} />
                        <DetailLine label="Адреса" value={locationText} />
                        <DetailLine label="Створено" value={formatDate(item?.createdAt)} />
                     </DetailBox>
                  </Grid>

                  {hasRent && (
                     <Grid item xs={12} md={6}>
                        <DetailBox title="Оренда">
                           <DetailLine label="Статус" value={rentStatusLabel} />
                           <DetailLine label="Назва оренди" value={item?.rentOptions?.rentTitle} />
                           <DetailLine
                              label="Ціна оренди"
                              value={formatMoney(item?.rentOptions?.price, item?.rentOptions?.currency)}
                           />
                           <DetailLine label="Доступний з" value={formatDate(item?.rentOptions?.availableFrom)} />
                           <DetailLine label="Актуальність" value={formatDate(item?.rentOptions?.lastActualizedAt)} />
                           <DetailLine label="Нотатки" value={item?.rentOptions?.notes} />
                        </DetailBox>
                     </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                     <DetailBox title="Характеристики">
                        <DetailLine label="Кімнат" value={item?.rooms} />
                        <DetailLine label="Загальна площа" value={item?.square_tot ? `${item.square_tot} м²` : ''} />
                        <DetailLine label="Житлова" value={item?.square_liv ? `${item.square_liv} м²` : ''} />
                        <DetailLine label="Кухня" value={item?.square_kit ? `${item.square_kit} м²` : ''} />
                        <DetailLine label="Поверх" value={item?.floor ? `${item.floor}/${item?.floors || '—'}` : ''} />
                        <DetailLine label="Стіни" value={item?.type_walls} />
                        <DetailLine label="Будівля" value={item?.type_building} />
                     </DetailBox>
                  </Grid>



                  {!!item?.description && (
                     <Grid item xs={12}>
                        <DetailBox title="Опис">
                           <Typography sx={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>
                              {item.description}
                           </Typography>
                        </DetailBox>
                     </Grid>
                  )}


                  <DetailBox title="Рекламні тексти">
                     <Stack spacing={1}>
                        <TextField
                           size="small"
                           value={adTitle}
                           onChange={(e) => setAdTitle(e.target.value)}
                           placeholder="Назва (наприклад OLX варіант 1)"
                        />

                        <TextField
                           size="small"
                           multiline
                           minRows={2}
                           value={adText}
                           onChange={(e) => setAdText(e.target.value)}
                           placeholder="Текст реклами..."
                        />

                        <TextField
                           size="small"
                           value={adNote}
                           onChange={(e) => setAdNote(e.target.value)}
                           placeholder="Нотатка"
                        />

                        <Button
                           variant="contained"
                           onClick={handleAddAdText}
                           disabled={!adText.trim()}
                        >
                           Додати текст
                        </Button>

                        <Divider sx={{ my: 1 }} />

                        {(item?.advertisingTexts || []).slice(0, 5).map((t, i) => (
                           <Box key={i}>
                              <Typography sx={{ fontSize: 12, color: '#aaa' }}>
                                 {new Date(t.createdAt).toLocaleString('uk-UA')}
                              </Typography>

                              <Typography sx={{ fontWeight: 700 }}>
                                 {t.title}
                              </Typography>

                              <Typography sx={{ fontSize: 13 }}>
                                 {t.text}
                              </Typography>

                              {!!t.note && (
                                 <Typography sx={{ fontSize: 12, color: '#888' }}>
                                    {t.note}
                                 </Typography>
                              )}
                           </Box>
                        ))}
                     </Stack>
                  </DetailBox>



                  {!!item?.advertisingLinks?.length && (
                     <Grid item xs={12}>
                        <DetailBox title="Реклама на сайтах">
                           <Stack spacing={0.8}>
                              {item.advertisingLinks.map((link) => (
                                 <Box
                                    key={link._id || link.url}
                                    sx={{
                                       p: 1,
                                       borderRadius: 2.5,
                                       bgcolor: 'rgba(255,255,255,0.03)',
                                       border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                 >
                                    <Stack
                                       direction={{ xs: 'column', md: 'row' }}
                                       spacing={0.8}
                                       alignItems={{ xs: 'flex-start', md: 'center' }}
                                    >
                                       <Chip
                                          label={getPlatformLabel(link.platform)}
                                          size="small"
                                          sx={{
                                             color: '#bfdbfe',
                                             bgcolor: 'rgba(59,130,246,0.12)',
                                             border: '1px solid rgba(59,130,246,0.22)',
                                             fontWeight: 900,
                                          }}
                                       />

                                       <Chip
                                          label={getAdStatusLabel(link.status)}
                                          size="small"
                                          sx={{
                                             color: '#fff',
                                             bgcolor: 'rgba(255,255,255,0.05)',
                                             border: '1px solid rgba(255,255,255,0.08)',
                                          }}
                                       />

                                       <Button
                                          component="a"
                                          href={link.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          size="small"
                                          sx={{
                                             color: '#c4b5fd',
                                             fontWeight: 900,
                                             textTransform: 'none',
                                          }}
                                       >
                                          Відкрити рекламу
                                       </Button>
                                    </Stack>

                                    {!!link.title && (
                                       <Typography sx={{ color: '#fff', fontWeight: 850, mt: 0.7 }}>
                                          {link.title}
                                       </Typography>
                                    )}

                                    {!!link.note && (
                                       <Typography sx={{ color: 'rgba(255,255,255,0.66)', fontSize: 13, mt: 0.35 }}>
                                          {link.note}
                                       </Typography>
                                    )}
                                 </Box>
                              ))}
                           </Stack>
                        </DetailBox>
                     </Grid>
                  )}

                  <DetailBox title="Додати рекламу">
                     <Grid container spacing={1}>
                        <Grid item xs={12} md={3}>
                           <TextField
                              select
                              size="small"
                              label="Платформа"
                              value={adPlatform}
                              onChange={(e) => setAdPlatform(e.target.value)}
                              fullWidth
                              sx={darkFieldSx}
                           >
                              <MenuItem value="olx">OLX</MenuItem>
                              <MenuItem value="dimria">DIM.RIA</MenuItem>
                              <MenuItem value="rieltor">RIELTOR</MenuItem>
                              <MenuItem value="facebook">Facebook</MenuItem>
                              <MenuItem value="instagram">Instagram</MenuItem>
                              <MenuItem value="site">Сайт</MenuItem>
                              <MenuItem value="other">Інше</MenuItem>
                           </TextField>
                        </Grid>

                        <Grid item xs={12} md={9}>
                           <TextField
                              size="small"
                              label="Посилання"
                              value={adUrl}
                              onChange={(e) => setAdUrl(e.target.value)}
                              fullWidth
                              sx={darkFieldSx}
                           />
                        </Grid>

                        <Grid item xs={12} md={5}>
                           <TextField
                              size="small"
                              label="Назва / примітка коротко"
                              value={adTitleLink}
                              onChange={(e) => setAdTitleLink(e.target.value)}
                              fullWidth
                              sx={darkFieldSx}
                           />
                        </Grid>

                        <Grid item xs={12} md={5}>
                           <TextField
                              size="small"
                              label="Нотатка"
                              value={adNoteLink}
                              onChange={(e) => setAdNoteLink(e.target.value)}
                              fullWidth
                              sx={darkFieldSx}
                           />
                        </Grid>

                        <Grid item xs={12} md={2}>
                           <Button
                              onClick={handleAddAdvertisingLink}
                              disabled={!adUrl.trim()}
                              fullWidth
                              sx={{
                                 height: '100%',
                                 minHeight: 40,
                                 borderRadius: 2.5,
                                 fontWeight: 900,
                                 color: '#0b0b12',
                                 background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                              }}
                           >
                              Додати
                           </Button>
                        </Grid>
                     </Grid>
                  </DetailBox>

               </Grid>
            </Box>
         </Collapse>
      </Box>
   );
}