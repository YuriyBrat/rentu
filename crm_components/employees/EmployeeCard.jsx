'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Chip,
   Collapse,
   Divider,
   Grid,
   IconButton,
   Avatar,
   Tooltip,
   Button,
} from '@mui/material';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import SubdirectoryArrowRightRoundedIcon from '@mui/icons-material/SubdirectoryArrowRightRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import EmployeePhotoGallery from './EmployeePhotoGallery';
import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

const roleMeta = {
   owner: { bg: '#e9d5ff', color: '#111', label: 'Власник' },
   admin: { bg: '#c4b5fd', color: '#111', label: 'Адміністратор' },
   manager: { bg: '#93c5fd', color: '#111', label: 'Менеджер' },
   realtor: { bg: '#5eead4', color: '#111', label: 'Рієлтор' },
   callcenter: { bg: '#fde68a', color: '#111', label: 'Кол-центр' },
   viewer: { bg: '#d1d5db', color: '#111', label: 'Перегляд' },
};

const noteStyles = {
   positive: {
      color: '#86efac',
      bg: 'rgba(34,197,94,0.14)',
      border: '1px solid rgba(34,197,94,0.22)',
      label: 'Позитивна',
   },
   negative: {
      color: '#fca5a5',
      bg: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.22)',
      label: 'Негативна',
   },
   info: {
      color: '#fde68a',
      bg: 'rgba(250,204,21,0.12)',
      border: '1px solid rgba(250,204,21,0.22)',
      label: 'Інформуюча',
   },
   important: {
      color: '#93c5fd',
      bg: 'rgba(59,130,246,0.12)',
      border: '1px solid rgba(59,130,246,0.22)',
      label: 'Важлива',
   },
};

const phoneTypeLabel = {
   personal: 'Особистий',
   work: 'Робочий',
   other: 'Інший',
};

phoneTypeLabel.personal = 'Основний';
phoneTypeLabel.work = 'Робочий';
phoneTypeLabel.other = 'Інший';

function normalizePhone(phone, idx = 0) {
   if (typeof phone === 'string') {
      return {
         number: phone,
         type: idx === 0 ? 'personal' : 'work',
         note: '',
         showInPortfolio: idx === 0,
         isPrimary: idx === 0,
      };
   }

   return {
      number: phone?.number || phone?.value || '',
      type: phone?.type || 'work',
      note: phone?.note || '',
      showInPortfolio: !!phone?.showInPortfolio,
      isPrimary: !!phone?.isPrimary,
   };
}

function getPhoneDisplayLabel(phone) {
   if (phone?.isPrimary) return 'Основний';
   return phoneTypeLabel[phone?.type] || 'Інший';
}

function formatDateTime(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   });
}

function formatDateOnly(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleDateString('uk-UA');
}

export default function EmployeeCard({ item, canManage = false, onEdit, onChanged, hierarchyLevel = 0, hasSubordinates = false }) {
   const [open, setOpen] = useState(false);
   const [galleryOpen, setGalleryOpen] = useState(false);
   const { theme, mode } = useCRMTheme();
   const isLight = mode === 'light';
   const isLuxury = mode === 'luxury';
   const TEXT = theme?.text || '#fff';
   const SOFT = theme?.textSoft || 'rgba(255,255,255,0.62)';
   const BORDER = theme?.border || 'rgba(255,255,255,0.08)';
   const role = roleMeta[item.role] || roleMeta.viewer;
   const CARD_BG = isLight
      ? 'rgba(255,255,255,0.72)'
      : isLuxury
         ? 'rgba(255,255,255,0.026)'
         : 'rgba(255,255,255,0.03)';
   const CHILD_BG = isLight
      ? 'rgba(124,58,237,0.045)'
      : isLuxury
         ? 'rgba(212,175,55,0.045)'
         : 'rgba(255,255,255,0.026)';
   const SECTION_BG = isLight ? 'rgba(255,255,255,0.64)' : 'rgba(255,255,255,0.03)';
   const HOVER_BG = isLight ? 'rgba(124,58,237,0.07)' : 'rgba(255,255,255,0.045)';
   const roleChipSx = isLight
      ? {
         bgcolor: role.bg,
         color: '#111827',
         border: '1px solid rgba(17,24,39,0.08)',
      }
      : {
         bgcolor: role.bg,
         color: role.color,
      };
   const activeChipSx = item.isActive
      ? isLight
         ? {
            bgcolor: '#dcfce7',
            color: '#047857',
            border: '1px solid rgba(4,120,87,0.18)',
         }
         : {
            bgcolor: 'rgba(34,197,94,0.16)',
            color: '#86efac',
            border: '1px solid transparent',
         }
      : isLight
         ? {
            bgcolor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid rgba(185,28,28,0.18)',
         }
         : {
            bgcolor: 'rgba(239,68,68,0.16)',
            color: '#fca5a5',
            border: '1px solid transparent',
         };
   const lastNote = useMemo(() => {
      if (!Array.isArray(item.notes) || !item.notes.length) return null;
      return [...item.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
   }, [item.notes]);

   const initials = (item.name || '?')
      .split(' ')
      .map((x) => x[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
   const rawPhones = (item.phones || []).map(normalizePhone).filter((phone) => phone.number);
   const phones = rawPhones.map((phone) => ({
      ...phone,
      isPrimary: false,
      showInPortfolio: false,
   }));
   const primaryPhoto = (item.photos || []).find((photo) => photo.isPrimary && !photo.isHidden) || (item.photos || []).find((photo) => !photo.isHidden);
   const headerPhotoUrl = primaryPhoto?.url || item.livePhoto?.url || item.avatarUrl || '';
   const headerPhone = rawPhones.find((phone) => phone.isPrimary)
      || rawPhones.find((phone) => phone.showInPortfolio)
      || rawPhones[0]
      || null;
   const visiblePhotosCount = [
      ...(item.livePhoto?.url && !item.livePhoto?.isHidden ? [item.livePhoto] : []),
      ...(item.photos || []).filter((photo) => !photo.isHidden && photo.showInPortfolio),
   ].length;

   return (
      <Box
         sx={{
            alignSelf: 'stretch',
            boxSizing: 'border-box',
            border: `1px solid ${BORDER}`,
            borderRadius: 3.5,
            bgcolor: hierarchyLevel ? CHILD_BG : CARD_BG,
            overflow: 'hidden',
            transition: '0.18s ease',
            position: 'relative',
            '&::before': hierarchyLevel ? {
               content: '""',
               position: 'absolute',
               left: 0,
               top: 0,
               bottom: 0,
               width: 3,
               bgcolor: theme?.accent || 'rgba(99,102,241,0.85)',
               boxShadow: `0 0 16px ${theme?.glow || 'rgba(99,102,241,0.4)'}`,
            } : undefined,
            '&:hover': {
               borderColor: theme?.accent || 'rgba(139,92,246,0.22)',
               bgcolor: HOVER_BG,
               boxShadow: isLight ? '0 10px 26px rgba(124,58,237,0.08)' : '0 10px 26px rgba(0,0,0,0.16)',
            },
            '& b': {
               color: `${TEXT} !important`,
            },
         }}
      >
         <Box sx={{ px: 1.2, py: 0.95 }}>
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     lg: '300px 160px minmax(0,1fr) 150px 86px 90px 44px',
                  },
                  gap: 1,
                  alignItems: 'center',
               }}
            >
               {/* LEFT */}
                <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                  {hierarchyLevel > 0 && (
                     <Tooltip title="Підпорядкований працівник">
                        <Box
                           sx={{
                              width: 26,
                              display: 'flex',
                              justifyContent: 'center',
                              flexShrink: 0,
                           }}
                        >
                           <SubdirectoryArrowRightRoundedIcon
                              sx={{
                              color: theme?.accentLight || 'rgba(167,139,250,0.92)',
                                 fontSize: 23,
                              }}
                           />
                        </Box>
                     </Tooltip>
                  )}

                  {hasSubordinates && (
                     <Tooltip title="Керівник команди">
                        <Box
                           sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: isLight ? '#92400e' : '#fde68a',
                              bgcolor: isLight ? 'rgba(217,119,6,0.1)' : 'rgba(250,204,21,0.12)',
                              border: isLight ? '1px solid rgba(217,119,6,0.18)' : '1px solid rgba(250,204,21,0.22)',
                           }}
                        >
                           <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                     </Tooltip>
                  )}

                  <Avatar
                     onClick={() => setGalleryOpen(true)}
                     src={headerPhotoUrl}
                     sx={{
                        width: 42,
                        height: 42,
                        fontWeight: 900,
                        bgcolor: item.color || '#7c3aed',
                        flexShrink: 0,
                        cursor: 'pointer',
                     }}
                  >
                     {initials}
                  </Avatar>

                  <Stack spacing={0.18} minWidth={0}>
                     <Tooltip title={item.name || ''}>
                        <Typography
                           sx={{
                              color: TEXT,
                              fontWeight: 850,
                              fontSize: 14,
                              lineHeight: 1.1,
                           }}
                           noWrap
                        >
                           {item.name}
                        </Typography>
                     </Tooltip>

                     <Typography
                        sx={{
                            color: SOFT,
                           fontSize: 11.5,
                           lineHeight: 1.1,
                        }}
                        noWrap
                     >
                        {item.position || '—'}
                     </Typography>

                     {headerPhone && (
                        <Typography
                           sx={{
                              color: isLight ? 'rgba(26,26,26,0.78)' : 'rgba(255,255,255,0.76)',
                              fontSize: 11.5,
                              lineHeight: 1.15,
                           }}
                           noWrap
                           title={`${headerPhone.number} · ${phoneTypeLabel[headerPhone.type] || 'Інший'}${headerPhone.note ? ` · ${headerPhone.note}` : ''}`}
                        >
                           {phoneTypeLabel[headerPhone.type] || 'Інший'}: {headerPhone.number}
                        </Typography>
                     )}
                  </Stack>
               </Stack>

               {/* ROLE + ACTIVE */}
               <Stack spacing={0.35} minWidth={0}>
                  <Chip
                     label={role.label}
                     size="small"
                     sx={{
                        alignSelf: 'flex-start',
                        backgroundColor: `${roleChipSx.bgcolor} !important`,
                        color: `${roleChipSx.color} !important`,
                        border: roleChipSx.border,
                        fontWeight: 900,
                        borderRadius: 999,
                        height: 24,
                        '& .MuiChip-label': {
                           color: `${roleChipSx.color} !important`,
                        },
                     }}
                  />

                  <Chip
                     label={item.isActive ? 'Активний' : 'Звільнений'}
                     size="small"
                     sx={{
                        alignSelf: 'flex-start',
                        backgroundColor: `${activeChipSx.bgcolor} !important`,
                        color: `${activeChipSx.color} !important`,
                        border: activeChipSx.border,
                        fontWeight: 800,
                        borderRadius: 999,
                        height: 22,
                        '& .MuiChip-label': {
                           color: `${activeChipSx.color} !important`,
                        },
                     }}
                  />
               </Stack>

               {/* CENTER */}
               <Stack spacing={0.18} minWidth={0}>
                  <Typography
                     sx={{
                        color: TEXT,
                        fontSize: 12.8,
                        fontWeight: 700,
                        lineHeight: 1.22,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.44em',
                     }}
                     title={item.about || ''}
                  >
                     {item.about || 'Без опису'}
                  </Typography>

                  {!!lastNote && (
                     <Typography
                        sx={{
                        color: noteStyles[lastNote.type]?.color || SOFT,
                           fontSize: 11,
                           lineHeight: 1.1,
                           whiteSpace: 'nowrap',
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                        }}
                        title={lastNote.text}
                     >
                        {lastNote.text}
                     </Typography>
                  )}
               </Stack>

               {/* RIGHT */}
               <Stack spacing={0.12} alignItems={{ xs: 'flex-start', lg: 'flex-end' }}>
                  <Typography
                     sx={{
                        color: TEXT,
                        fontWeight: 750,
                        fontSize: 12.3,
                        lineHeight: 1.1,
                     }}
                     noWrap
                  >
                     {item.login || '—'}
                  </Typography>

                  <Typography
                     sx={{
                        color: SOFT,
                        fontSize: 10.5,
                        lineHeight: 1.1,
                     }}
                     noWrap
                  >
                     логін
                  </Typography>
               </Stack>

               <Box
                  onClick={() => setGalleryOpen(true)}
                  sx={{
                     width: 76,
                     height: 58,
                     justifySelf: { xs: 'flex-start', lg: 'end' },
                     borderRadius: 2,
                     overflow: 'hidden',
                     border: `1px solid ${BORDER}`,
                     bgcolor: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.04)',
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     flexShrink: 0,
                  }}
               >
                  {headerPhotoUrl ? (
                     <Box
                        component="img"
                        src={headerPhotoUrl}
                        alt={item.name || ''}
                        sx={{
                           width: '100%',
                           height: '100%',
                           objectFit: 'cover',
                        }}
                     />
                  ) : (
                     <PhotoLibraryRoundedIcon sx={{ color: SOFT }} />
                  )}
               </Box>

               <Stack alignItems={{ xs: 'flex-start', lg: 'flex-end' }}>
                  {canManage && (
                     <Button
                        onClick={() => onEdit?.(item)}
                        startIcon={<EditRoundedIcon />}
                        size="small"
                        sx={{
                           color: TEXT,
                           border: `1px solid ${BORDER}`,
                           borderRadius: 2.5,
                           minWidth: 84,
                           height: 34,
                        }}
                     >
                        Змінити
                     </Button>
                  )}
               </Stack>

               {/* ARROW */}
               <Stack alignItems={{ xs: 'flex-end', lg: 'center' }}>
                  <IconButton
                     onClick={() => setOpen((p) => !p)}
                     sx={{
                        color: SOFT,
                        border: `1px solid ${BORDER}`,
                        width: 34,
                        height: 34,
                        borderRadius: 2.5,
                        bgcolor: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.03)',
                     }}
                  >
                     {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                  </IconButton>
               </Stack>
            </Box>
         </Box>

         <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ borderColor: BORDER }} />

            <Box sx={{ p: 1.3 }}>
               <Grid container spacing={1.2}>
                  <Grid item xs={12} lg={7}>
                     <Stack spacing={1.1}>
                        <Box
                           sx={{
                              p: 1.2,
                              borderRadius: 3,
                              bgcolor: SECTION_BG,
                              border: `1px solid ${BORDER}`,
                           }}
                        >
                           <Typography sx={{ color: TEXT, fontWeight: 850, mb: 0.8 }}>
                              Контакти
                           </Typography>

                           <Stack spacing={0.7}>
                              <Stack direction="row" spacing={0.7} alignItems="flex-start">
                                 <PhoneRoundedIcon sx={{ color: SOFT, fontSize: 17, mt: 0.25 }} />
                                 <Stack spacing={0.45}>
                                    {phones.length ? phones.map((phone, idx) => (
                                       <Typography key={`${phone.number}-${idx}`} sx={{ color: isLight ? 'rgba(26,26,26,0.78)' : 'rgba(255,255,255,0.76)' }}>
                                          {phone.number} · {phoneTypeLabel[phone.type] || 'Інший'}
                                          {phone.note ? ` · ${phone.note}` : ''}
                                       </Typography>
                                    )) : (
                                       <Typography sx={{ color: 'rgba(255,255,255,0.76)' }}>—</Typography>
                                    )}
                                 </Stack>
                              </Stack>

                              <Stack direction="row" spacing={0.7} alignItems="center">
                                 <AlternateEmailRoundedIcon sx={{ color: SOFT, fontSize: 17 }} />
                                 <Typography sx={{ color: isLight ? 'rgba(26,26,26,0.78)' : 'rgba(255,255,255,0.76)' }}>
                                    {(item.emails || []).join(', ') || '—'}
                                 </Typography>
                              </Stack>

                              <Stack direction="row" spacing={0.7} alignItems="center">
                                 <BadgeRoundedIcon sx={{ color: SOFT, fontSize: 17 }} />
                                 <Typography sx={{ color: isLight ? 'rgba(26,26,26,0.78)' : 'rgba(255,255,255,0.76)' }}>
                                    Telegram: {item.telegram || '—'}
                                 </Typography>
                              </Stack>
                           </Stack>
                        </Box>

                        <Box
                           sx={{
                              p: 1.2,
                              borderRadius: 3,
                              bgcolor: SECTION_BG,
                              border: `1px solid ${BORDER}`,
                           }}
                        >
                           <Typography sx={{ color: TEXT, fontWeight: 850, mb: 0.8 }}>
                              Профіль
                           </Typography>

                           <Stack spacing={0.55}>
                              <Typography sx={{ color: isLight ? 'rgba(26,26,26,0.74)' : 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Посада:</b> {item.position || '—'}
                              </Typography>
                              <Typography sx={{ color: isLight ? 'rgba(26,26,26,0.74)' : 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>CRM роль:</b> {role.label}
                              </Typography>
                              <Typography sx={{ color: isLight ? 'rgba(26,26,26,0.74)' : 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Колір:</b> {item.color || '—'}
                              </Typography>
                              <Typography sx={{ color: isLight ? 'rgba(26,26,26,0.74)' : 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Порядок:</b> {item.displayOrder ?? '—'}
                              </Typography>
                              <Typography sx={{ color: isLight ? 'rgba(26,26,26,0.74)' : 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Початок кар’єри:</b> {formatDateOnly(item.careerStartAt)}
                              </Typography>
                              <Typography sx={{ color: isLight ? 'rgba(26,26,26,0.74)' : 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Дата звільнення:</b> {formatDateOnly(item.firedAt)}
                              </Typography>
                           </Stack>
                        </Box>

                        <Box
                           sx={{
                              p: 1.2,
                              borderRadius: 3,
                              bgcolor: SECTION_BG,
                              border: `1px solid ${BORDER}`,
                           }}
                        >
                           <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                              <Box>
                                 <Typography sx={{ color: TEXT, fontWeight: 850 }}>
                                    Фото
                                 </Typography>
                                  <Typography sx={{ color: SOFT, fontSize: 12 }}>
                                    У візитівці: {visiblePhotosCount || 0}
                                 </Typography>
                              </Box>
                              <Button
                                 onClick={() => setGalleryOpen(true)}
                                 startIcon={<PhotoLibraryRoundedIcon />}
                                 sx={{
                                     color: TEXT,
                                     border: `1px solid ${BORDER}`,
                                    borderRadius: 2.5,
                                 }}
                              >
                                 Галерея
                              </Button>
                           </Stack>
                        </Box>
                     </Stack>
                  </Grid>

                  <Grid item xs={12} lg={5}>
                     <Box
                        sx={{
                           p: 1.2,
                           borderRadius: 3,
                            bgcolor: SECTION_BG,
                            border: `1px solid ${BORDER}`,
                        }}
                     >
                           <Typography sx={{ color: TEXT, fontWeight: 850, mb: 0.8 }}>
                           Нотатки
                        </Typography>

                        <Stack spacing={0.8}>
                           {(item.notes || []).map((note, i) => {
                              const style = noteStyles[note.type] || noteStyles.info;
                              return (
                                 <Box
                                    key={i}
                                    sx={{
                                       p: 1,
                                       borderRadius: 2.5,
                                       bgcolor: style.bg,
                                       border: style.border,
                                    }}
                                 >
                                    <Stack
                                       direction="row"
                                       justifyContent="space-between"
                                       spacing={1}
                                       sx={{ mb: 0.4 }}
                                    >
                                       <Typography sx={{ color: style.color, fontWeight: 800 }}>
                                          {style.label}
                                       </Typography>
                                       <Typography sx={{ color: 'rgba(255,255,255,0.46)', fontSize: 11 }}>
                                          {formatDateTime(note.createdAt)}
                                       </Typography>
                                    </Stack>

                                    <Typography sx={{ color: TEXT, lineHeight: 1.5 }}>
                                       {note.text}
                                    </Typography>

                                    {!!note.createdByName && (
                                       <Typography
                                          sx={{
                                             color: SOFT,
                                             fontSize: 11,
                                             mt: 0.45,
                                          }}
                                       >
                                          {note.createdByName}
                                       </Typography>
                                    )}
                                 </Box>
                              );
                           })}
                        </Stack>
                     </Box>
                  </Grid>
               </Grid>
            </Box>
         </Collapse>
         <EmployeePhotoGallery
            open={galleryOpen}
            onClose={() => setGalleryOpen(false)}
            employee={item}
            canManage={canManage}
            onChanged={onChanged}
         />
      </Box>
   );
}
