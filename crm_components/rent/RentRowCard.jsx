'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Chip,
   Button,
   Collapse,
   Divider,
   Grid,
} from '@mui/material';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import BedRoundedIcon from '@mui/icons-material/BedRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function formatDate(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleDateString('uk-UA');
}

function getMainImage(item) {
   const images = item?.images || [];
   return images.find((x) => x?.isMain) || images[0] || null;
}

function getOwner(item) {
   const owners = item?.owners || [];
   return owners.find((x) => x?.isPrimary) || owners[0] || null;
}

function getStatusMeta(statusRent) {
   if (statusRent === 'rentActual') {
      return {
         label: 'Актуальний',
         color: '#d1fae5',
         bg: 'rgba(16,185,129,0.16)',
         border: '1px solid rgba(16,185,129,0.28)',
      };
   }

   if (statusRent === 'rentPause') {
      return {
         label: 'Пауза',
         color: '#fde68a',
         bg: 'rgba(245,158,11,0.14)',
         border: '1px solid rgba(245,158,11,0.24)',
      };
   }

   if (statusRent === 'rentRented') {
      return {
         label: 'Зданий',
         color: '#ddd6fe',
         bg: 'rgba(139,92,246,0.16)',
         border: '1px solid rgba(139,92,246,0.24)',
      };
   }

   return {
      label: 'Не оренда',
      color: '#fff',
      bg: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.10)',
   };
}

function getEstateLabel(type) {
   if (type === 'flat') return 'Квартира';
   if (type === 'house') return 'Будинок';
   if (type === 'commerce') return 'Комерція';
   if (type === 'land') return 'Ділянка';
   return 'Об’єкт';
}

function MetaPill({ icon, label, value }) {
   return (
      <Stack
         direction="row"
         spacing={0.8}
         alignItems="center"
         sx={{
            px: 1.1,
            py: 0.8,
            borderRadius: 2.5,
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            minWidth: 0,
         }}
      >
         <Box sx={{ color: 'rgba(255,255,255,0.62)', display: 'flex' }}>{icon}</Box>
         <Stack spacing={0.15} minWidth={0}>
            <Typography sx={{ color: 'rgba(255,255,255,0.56)', fontSize: 11, lineHeight: 1.1 }}>
               {label}
            </Typography>
            <Typography
               sx={{
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1.1,
               }}
               noWrap
            >
               {value || '—'}
            </Typography>
         </Stack>
      </Stack>
   );
}

export default function RentRowCard({ item }) {
   const [open, setOpen] = useState(false);

   const image = getMainImage(item);
   const owner = getOwner(item);
   const statusMeta = getStatusMeta(item?.statusRent);

   const shortConditions = useMemo(
      () => (item?.rentOptions?.conditions || []).filter(Boolean).slice(0, 3),
      [item]
   );

   const priceText = useMemo(() => {
      const price = item?.rentOptions?.price;
      const currency = item?.rentOptions?.currency || 'USD';
      if (!price) return 'Ціна не вказана';
      return `${price.toLocaleString('uk-UA')} ${currency}`;
   }, [item]);

   const ownerPhone = owner?.phones?.[0] || '';

   return (
      <Box
         sx={{
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(255,255,255,0.03)',
            overflow: 'hidden',
            boxShadow: open ? '0 18px 44px rgba(0,0,0,0.22)' : 'none',
            transition: '0.2s ease',
         }}
      >
         <Box sx={{ p: 1.2 }}>
            {/* <Stack
               direction={{ xs: 'column', xl: 'row' }}
               spacing={1.2}
               alignItems={{ xs: 'stretch', xl: 'center' }}
            > */}
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     md: '160px minmax(0, 1fr)',
                     lg: '160px minmax(0, 1fr) 220px',
                  },
                  gap: 1.2,
                  alignItems: 'center',
               }}
            >
               {/* photo */}
               <Box
                  sx={{
                     width: { xs: '100%', sm: 160 },
                     minWidth: { xs: '100%', sm: 160 },
                     maxWidth: { xs: '100%', sm: 160 },
                     height: 116,
                     borderRadius: 3,
                     overflow: 'hidden',
                     bgcolor: 'rgba(255,255,255,0.04)',
                     border: '1px solid rgba(255,255,255,0.06)',
                     flexShrink: 0,
                  }}
               >
                  {image?.url ? (
                     <Box
                        component="img"
                        src={image.url}
                        alt={item?.title || 'rent'}
                        sx={{
                           width: '100%',
                           height: '100%',
                           objectFit: 'cover',
                           display: 'block',
                        }}
                     />
                  ) : (
                     <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{ width: '100%', height: '100%' }}
                     >
                        <Typography sx={{ color: 'rgba(255,255,255,0.52)', fontWeight: 700 }}>
                           Без фото
                        </Typography>
                     </Stack>
                  )}
               </Box>

               {/* main info */}
               <Stack spacing={0.9} sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                     direction={{ xs: 'column', md: 'row' }}
                     spacing={1}
                     alignItems={{ xs: 'flex-start', md: 'center' }}
                     justifyContent="space-between"
                  >
                     <Stack spacing={0.55} minWidth={0}>
                        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                           <Chip
                              label={statusMeta.label}
                              sx={{
                                 color: statusMeta.color,
                                 bgcolor: statusMeta.bg,
                                 border: statusMeta.border,
                                 fontWeight: 900,
                              }}
                           />
                           <Chip
                              label={getEstateLabel(item?.type_estate)}
                              sx={{
                                 color: '#fff',
                                 bgcolor: 'rgba(255,255,255,0.05)',
                                 border: '1px solid rgba(255,255,255,0.08)',
                              }}
                           />
                           {item?.isPublic && (
                              <Chip
                                 label="На сайті"
                                 sx={{
                                    color: '#bfdbfe',
                                    bgcolor: 'rgba(59,130,246,0.14)',
                                    border: '1px solid rgba(59,130,246,0.24)',
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
                              color: 'rgba(255,255,255,0.66)',
                              fontSize: 13,
                           }}
                           noWrap
                        >
                           {item?.location_text ||
                              [item?.location?.city, item?.location?.street, item?.location?.number]
                                 .filter(Boolean)
                                 .join(', ') ||
                              'Адреса не вказана'}
                        </Typography>
                     </Stack>

                     <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={0.35}>
                        <Typography sx={{ color: '#fff', fontSize: 22, fontWeight: 950 }}>
                           {priceText}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.56)', fontSize: 12 }}>
                           оренда
                        </Typography>
                     </Stack>
                  </Stack>

                  <Stack direction="row" spacing={0.9} flexWrap="wrap" useFlexGap>
                     <MetaPill
                        icon={<BedRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Кімнат"
                        value={item?.rooms || '—'}
                     />
                     <MetaPill
                        icon={<SquareFootRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Площа"
                        value={item?.square_tot ? `${item.square_tot} м²` : '—'}
                     />
                     <MetaPill
                        icon={<ApartmentRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Поверх"
                        value={
                           item?.floor
                              ? `${item.floor}${item?.floors ? ` / ${item.floors}` : ''}`
                              : '—'
                        }
                     />
                     <MetaPill
                        icon={<CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Доступний з"
                        value={formatDate(item?.rentOptions?.availableFrom)}
                     />
                     <MetaPill
                        icon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
                        label="Актуальність"
                        value={formatDate(item?.rentOptions?.lastActualizedAt)}
                     />
                     <MetaPill
                        icon={<PhoneRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Контакт"
                        value={owner?.name || ownerPhone || '—'}
                     />
                  </Stack>

                  {!!shortConditions.length && (
                     <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                        {shortConditions.map((x, idx) => (
                           <Chip
                              key={`${x}-${idx}`}
                              label={x}
                              sx={{
                                 color: '#fff',
                                 bgcolor: 'rgba(255,255,255,0.05)',
                                 border: '1px solid rgba(255,255,255,0.08)',
                              }}
                           />
                        ))}
                     </Stack>
                  )}
               </Stack>

               {/* actions */}
               <Stack
                  spacing={0.8}
                  alignItems={{ xs: 'stretch', xl: 'flex-end' }}
                  sx={{ minWidth: { xl: 138 } }}
               >
                  <Button
                     onClick={() => setOpen((p) => !p)}
                     endIcon={open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                     sx={{
                        borderRadius: 3,
                        color: '#fff',
                        fontWeight: 900,
                        border: '1px solid rgba(255,255,255,0.10)',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        px: 1.4,
                     }}
                  >
                     {open ? 'Згорнути' : 'Детальніше'}
                  </Button>

                  <Button
                     sx={{
                        borderRadius: 3,
                        color: '#0b0b12',
                        fontWeight: 900,
                        background:
                           'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                        boxShadow: '0 12px 28px rgba(139,92,246,0.25)',
                        px: 1.4,
                        '&:hover': {
                           boxShadow: '0 16px 36px rgba(139,92,246,0.35)',
                        },
                     }}
                  >
                     Редагувати
                  </Button>
               </Stack>
               {/* </Stack> */}
            </Box>
         </Box>

         <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

            <Box sx={{ p: 1.4 }}>
               <Grid container spacing={1.4}>
                  <Grid item xs={12} lg={7}>
                     <Stack spacing={1.2}>
                        {!!(item?.images || []).length && (
                           <Grid container spacing={1}>
                              {(item.images || []).map((img, idx) => (
                                 <Grid item xs={6} sm={4} md={3} key={idx}>
                                    <Box
                                       component="img"
                                       src={img?.url}
                                       alt={`img-${idx}`}
                                       sx={{
                                          width: '100%',
                                          height: 112,
                                          objectFit: 'cover',
                                          display: 'block',
                                          borderRadius: 2.5,
                                          border: '1px solid rgba(255,255,255,0.08)',
                                          bgcolor: 'rgba(255,255,255,0.03)',
                                       }}
                                    />
                                 </Grid>
                              ))}
                           </Grid>
                        )}

                        {!!item?.description && (
                           <Box
                              sx={{
                                 p: 1.2,
                                 borderRadius: 3,
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.06)',
                              }}
                           >
                              <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.6 }}>
                                 Опис
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
                                 {item.description}
                              </Typography>
                           </Box>
                        )}

                        {!!item?.rentOptions?.adText && (
                           <Box
                              sx={{
                                 p: 1.2,
                                 borderRadius: 3,
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.06)',
                              }}
                           >
                              <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.6 }}>
                                 Текст для реклами
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
                                 {item.rentOptions.adText}
                              </Typography>
                           </Box>
                        )}

                        {!!item?.rentOptions?.notes && (
                           <Box
                              sx={{
                                 p: 1.2,
                                 borderRadius: 3,
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.06)',
                              }}
                           >
                              <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.6 }}>
                                 Нотатки по оренді
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
                                 {item.rentOptions.notes}
                              </Typography>
                           </Box>
                        )}
                     </Stack>
                  </Grid>

                  <Grid item xs={12} lg={5}>
                     <Stack spacing={1.2}>
                        <Box
                           sx={{
                              p: 1.2,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                           }}
                        >
                           <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.8 }}>
                              Орендні деталі
                           </Typography>

                           <Stack spacing={0.7}>
                              <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                 <b style={{ color: '#fff' }}>Ціна:</b> {priceText}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                 <b style={{ color: '#fff' }}>Доступність:</b>{' '}
                                 {formatDate(item?.rentOptions?.availableFrom)}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                 <b style={{ color: '#fff' }}>Остання актуальність:</b>{' '}
                                 {formatDate(item?.rentOptions?.lastActualizedAt)}
                              </Typography>
                           </Stack>
                        </Box>

                        {!!(item?.rentOptions?.conditions || []).length && (
                           <Box
                              sx={{
                                 p: 1.2,
                                 borderRadius: 3,
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.06)',
                              }}
                           >
                              <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.8 }}>
                                 Умови / особливості
                              </Typography>
                              <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                                 {item.rentOptions.conditions.map((x, idx) => (
                                    <Chip
                                       key={`${x}-${idx}`}
                                       label={x}
                                       sx={{
                                          color: '#fff',
                                          bgcolor: 'rgba(255,255,255,0.05)',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                       }}
                                    />
                                 ))}
                              </Stack>
                           </Box>
                        )}

                        {!!(item?.rentOptions?.furniture || []).length && (
                           <Box
                              sx={{
                                 p: 1.2,
                                 borderRadius: 3,
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.06)',
                              }}
                           >
                              <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.8 }}>
                                 Меблі
                              </Typography>
                              <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                                 {item.rentOptions.furniture.map((x, idx) => (
                                    <Chip
                                       key={`${x}-${idx}`}
                                       label={x}
                                       sx={{
                                          color: '#fff',
                                          bgcolor: 'rgba(255,255,255,0.05)',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                       }}
                                    />
                                 ))}
                              </Stack>
                           </Box>
                        )}

                        {!!(item?.rentOptions?.appliances || []).length && (
                           <Box
                              sx={{
                                 p: 1.2,
                                 borderRadius: 3,
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.06)',
                              }}
                           >
                              <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.8 }}>
                                 Техніка
                              </Typography>
                              <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                                 {item.rentOptions.appliances.map((x, idx) => (
                                    <Chip
                                       key={`${x}-${idx}`}
                                       label={x}
                                       sx={{
                                          color: '#fff',
                                          bgcolor: 'rgba(255,255,255,0.05)',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                       }}
                                    />
                                 ))}
                              </Stack>
                           </Box>
                        )}

                        {!!(item?.owners || []).length && (
                           <Box
                              sx={{
                                 p: 1.2,
                                 borderRadius: 3,
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.06)',
                              }}
                           >
                              <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.8 }}>
                                 Контакти
                              </Typography>

                              <Stack spacing={0.9}>
                                 {item.owners.map((ownerItem, idx) => (
                                    <Box
                                       key={idx}
                                       sx={{
                                          p: 1,
                                          borderRadius: 2.5,
                                          bgcolor: 'rgba(255,255,255,0.03)',
                                          border: '1px solid rgba(255,255,255,0.06)',
                                       }}
                                    >
                                       <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                                          {ownerItem?.name || `Контакт ${idx + 1}`}
                                          {ownerItem?.isPrimary ? ' • головний' : ''}
                                       </Typography>

                                       {!!ownerItem?.phones?.length && (
                                          <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.4 }}>
                                             Тел: {ownerItem.phones.join(', ')}
                                          </Typography>
                                       )}

                                       {!!ownerItem?.emails?.length && (
                                          <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.2 }}>
                                             Email: {ownerItem.emails.join(', ')}
                                          </Typography>
                                       )}

                                       {!!ownerItem?.notes && (
                                          <Typography sx={{ color: 'rgba(255,255,255,0.62)', mt: 0.5 }}>
                                             {ownerItem.notes}
                                          </Typography>
                                       )}
                                    </Box>
                                 ))}
                              </Stack>
                           </Box>
                        )}
                     </Stack>
                  </Grid>
               </Grid>
            </Box>
         </Collapse>
      </Box>
   );
}