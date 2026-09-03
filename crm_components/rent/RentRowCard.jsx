'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Chip,
   Button,
   IconButton,
   Tooltip,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   TextField,
   MenuItem,
   Alert,
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
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';

const RENT_STATUS_OPTIONS = [
   { value: 'rentActual', label: 'Актуальна для здачі' },
   { value: 'rentPause', label: 'Пауза / завдаток' },
   { value: 'rentRented', label: 'Зданий' },
];

const RENTED_BY_OPTIONS = [
   { value: '', label: 'Не вказано' },
   { value: 'owner', label: 'Власник сам' },
   { value: 'competitor', label: 'Конкурент' },
   { value: 'employee', label: 'Ми' },
   { value: 'other', label: 'Інше' },
];

function formatDate(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleDateString('uk-UA');
}

function toDateInput(value) {
   if (!value) return '';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '';
   return d.toISOString().slice(0, 10);
}

function getMainImage(item) {
   const images = item?.images || [];
   return images.find((x) => x?.isMain) || images[0] || null;
}

function getOwner(item) {
   const owners = item?.owners || [];
   return owners.find((x) => x?.isPrimary) || owners[0] || null;
};


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

//
function getRentedByLabel(value) {
   if (value === 'employee') return 'Ми';
   if (value === 'owner') return 'Власник сам';
   if (value === 'competitor') return 'Конкурент';
   if (value === 'other') return 'Інше';
   return value || '—';
};

function getStatusMeta(statusRent) {
   if (statusRent === 'rentActual') {
      return {
         label: 'Актуальна для здачі',
         color: '#d1fae5',
         bg: 'rgba(16,185,129,0.16)',
         border: '1px solid rgba(16,185,129,0.28)',
      };
   }

   if (statusRent === 'rentPause') {
      return {
         label: 'Пауза / завдаток',
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

export default function RentRowCard({ item, employees = [], onEdit, onRentStatusChange, onRentHistoryAdd }) {
   const [open, setOpen] = useState(false);
   const [statusOpen, setStatusOpen] = useState(false);
   const [statusDraft, setStatusDraft] = useState(() => ({
      statusRent: item?.statusRent || 'rentActual',
      statusDate:
         item?.statusRent === 'rentActual'
            ? toDateInput(item?.rentOptions?.lastActualizedAt) || new Date().toISOString().slice(0, 10)
            : toDateInput(item?.rentOptions?.rentStory?.rentedAt) || new Date().toISOString().slice(0, 10),
      rentedByType: item?.rentOptions?.rentStory?.rentedByType || item?.rentOptions?.rentStory?.rentedBy || '',
      rentedByEmployee: item?.rentOptions?.rentStory?.rentedByEmployee?._id || item?.rentOptions?.rentStory?.rentedByEmployee || '',
      note: item?.rentOptions?.rentStory?.note || '',
   }));
   const [statusSaving, setStatusSaving] = useState(false);
   const [statusError, setStatusError] = useState('');
   const [historyOpen, setHistoryOpen] = useState(false);
   const [historyDraft, setHistoryDraft] = useState({
      rentedAt: '',
      movedOutAt: '',
      rentedByType: '',
      rentedByEmployee: '',
      note: '',
   });
   const [historySaving, setHistorySaving] = useState(false);
   const [historyError, setHistoryError] = useState('');

   const image = getMainImage(item);
   const owner = getOwner(item);
   const statusMeta = getStatusMeta(item?.statusRent);
   const PhotoStatusIcon =
      item?.statusRent === 'rentRented'
         ? BedRoundedIcon
         : item?.statusRent === 'rentPause'
            ? PauseCircleRoundedIcon
            : CheckCircleRoundedIcon;
   const showPhotoStatusIcon = item?.statusRent === 'rentRented' || item?.statusRent === 'rentPause';

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

   const rentTitle = item?.rentOptions?.rentTitle || item?.displayTitle || item?.title || 'Без назви';
   const assigneeName = getEmployeeName(item?.assignee);
   const createdByName = getEmployeeName(item?.createdByEmployee);
   const rentStory = item?.rentOptions?.rentStory || {};
   const rentHistory = Array.isArray(item?.rentOptions?.rentHistory) ? item.rentOptions.rentHistory : [];
   const employeeById = useMemo(
      () => new Map((employees || []).map((employee) => [String(employee._id), employee])),
      [employees]
   );
   const getHistoryEmployeeName = (row) =>
      getEmployeeName(
         typeof row?.rentedByEmployee === 'string'
            ? employeeById.get(String(row.rentedByEmployee))
            : row?.rentedByEmployee
      );
   const currentRentedByEmployeeName = getHistoryEmployeeName(rentStory);
   const statusFieldSx = {
      '& .MuiOutlinedInput-root': {
         bgcolor: 'rgba(255,255,255,0.04)',
         borderRadius: 3,
         color: '#fff',
         '& fieldset': { borderColor: 'rgba(255,255,255,0.14)' },
         '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.45)' },
         '&.Mui-focused fieldset': { borderColor: 'rgba(168,85,247,0.95)' },
      },
      '& .MuiInputLabel-root': {
         color: 'rgba(255,255,255,0.82) !important',
         fontWeight: 800,
      },
      '& .MuiInputBase-input': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
      },
      '& textarea': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
      },
      '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.78)' },
   };
   const statusMenuProps = {
      PaperProps: {
         sx: {
            bgcolor: '#151521',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
         },
      },
   };
   const iconButtonSx = {
      width: 40,
      height: 40,
      borderRadius: 2.4,
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.10)',
      bgcolor: 'rgba(255,255,255,0.04)',
      '&:hover': {
         bgcolor: 'rgba(139,92,246,0.18)',
         borderColor: 'rgba(168,85,247,0.38)',
      },
   };

   const handleSaveStatus = async () => {
      if (!statusDraft.statusRent) {
         setStatusOpen(false);
         return;
      }

      if (!statusDraft.statusDate) {
         setStatusError('Вкажи дату статусу');
         return;
      }

      if (statusDraft.statusRent !== 'rentActual' && statusDraft.rentedByType === 'employee' && !statusDraft.rentedByEmployee) {
         setStatusError('Вкажи менеджера, який здав об’єкт');
         return;
      }

      try {
         setStatusSaving(true);
         setStatusError('');
         await onRentStatusChange?.(item, statusDraft);
         setStatusOpen(false);
      } catch (error) {
         setStatusError(error?.message || 'Не вдалося оновити статус здачі');
      } finally {
         setStatusSaving(false);
      }
   };

   const resetStatusDraft = () => {
      setStatusDraft({
         statusRent: item?.statusRent || 'rentActual',
         statusDate:
            item?.statusRent === 'rentActual'
               ? toDateInput(item?.rentOptions?.lastActualizedAt) || new Date().toISOString().slice(0, 10)
               : toDateInput(item?.rentOptions?.rentStory?.rentedAt) || new Date().toISOString().slice(0, 10),
         rentedByType: item?.rentOptions?.rentStory?.rentedByType || item?.rentOptions?.rentStory?.rentedBy || '',
         rentedByEmployee: item?.rentOptions?.rentStory?.rentedByEmployee?._id || item?.rentOptions?.rentStory?.rentedByEmployee || '',
         note: item?.rentOptions?.rentStory?.note || '',
      });
   };

   const setStatusValue = (key, value) => {
      setStatusDraft((prev) => {
         const next = { ...prev, [key]: value };
         if (key === 'rentedByType' && value !== 'employee') {
            next.rentedByEmployee = '';
         }
         if (key === 'statusRent' && value === 'rentActual') {
            next.rentedByType = '';
            next.rentedByEmployee = '';
         }
         if (key === 'statusRent' && !next.statusDate) {
            next.statusDate = new Date().toISOString().slice(0, 10);
         }
         return next;
      });
   };

   const setHistoryValue = (key, value) => {
      setHistoryDraft((prev) => ({
         ...prev,
         [key]: value,
         ...(key === 'rentedByType' && value !== 'employee' ? { rentedByEmployee: '' } : {}),
      }));
   };

   const openHistoryDialog = () => {
      setHistoryDraft({
         rentedAt: '',
         movedOutAt: '',
         rentedByType: '',
         rentedByEmployee: '',
         note: '',
      });
      setHistoryError('');
      setHistoryOpen(true);
   };

   const handleSaveHistory = async () => {
      if (!historyDraft.rentedAt) {
         setHistoryError('Вкажи дату здачі');
         return;
      }
      if (historyDraft.rentedByType === 'employee' && !historyDraft.rentedByEmployee) {
         setHistoryError('Вкажи менеджера, який здав об’єкт');
         return;
      }

      try {
         setHistorySaving(true);
         setHistoryError('');
         await onRentHistoryAdd?.(item, historyDraft);
         setHistoryOpen(false);
      } catch (error) {
         setHistoryError(error?.message || 'Не вдалося додати історію здачі');
      } finally {
         setHistorySaving(false);
      }
   };

   const statusDateLabel =
      statusDraft.statusRent === 'rentActual'
         ? 'Дата нової актуальності'
         : statusDraft.statusRent === 'rentPause'
            ? 'Дата паузи / завдатку'
            : 'Дата здачі';
   const showStatusRentedBy = statusDraft.statusRent === 'rentRented' || statusDraft.statusRent === 'rentPause';

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
                     position: 'relative',
                  }}
               >
                  {image?.url ? (
                     <Box
                        component="img"
                        src={image.url}
                        alt={rentTitle}
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

                  {showPhotoStatusIcon && (
                     <Tooltip title={statusMeta.label} arrow>
                        <Box
                           sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: 44,
                              height: 44,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: statusMeta.color,
                              bgcolor: 'rgba(11,11,18,0.62)',
                              border: `1px solid ${statusMeta.color}`,
                              boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
                              backdropFilter: 'blur(8px)',
                              zIndex: 2,
                           }}
                        >
                           <PhotoStatusIcon sx={{ fontSize: 25 }} />
                        </Box>
                     </Tooltip>
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
                           {rentTitle}
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
                     {/* <MetaPill
                        icon={<PhoneRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Контакт"
                        value={owner?.name || ownerPhone || '—'}
                     /> */}
                     <MetaPill
                        icon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
                        label="Відповідальний"
                        value={assigneeName}
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
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                  justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
                  sx={{ minWidth: { lg: 146 } }}
               >
                  <Tooltip title="Статус здачі" arrow>
                     <IconButton
                        onClick={() => {
                           resetStatusDraft();
                           setStatusError('');
                           setStatusOpen(true);
                        }}
                        sx={{
                           ...iconButtonSx,
                           color: statusMeta.color,
                           bgcolor: statusMeta.bg,
                           border: statusMeta.border,
                        }}
                     >
                        <PublishedWithChangesRoundedIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>

                  <Tooltip title="Редагувати" arrow>
                     <IconButton onClick={() => onEdit?.(item)} sx={iconButtonSx}>
                        <EditRoundedIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>

                  <Tooltip title={open ? 'Згорнути' : 'Розгорнути'} arrow>
                     <IconButton onClick={() => setOpen((p) => !p)} sx={iconButtonSx}>
                        {open ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
                     </IconButton>
                  </Tooltip>
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


                           <Box
                              sx={{
                                 p: 1.2,
                                 borderRadius: 3,
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.06)',
                              }}
                           >
                              <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.8 }}>
                                 Відповідальні
                              </Typography>

                              <Stack spacing={0.7}>
                                 <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                    <b style={{ color: '#fff' }}>Відповідальний:</b> {assigneeName}
                                 </Typography>

                                 <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                    <b style={{ color: '#fff' }}>Хто вніс:</b> {createdByName}
                                 </Typography>
                              </Stack>
                           </Box>



                           <Box
                              sx={{
                                 p: 1.2,
                                 borderRadius: 3,
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.06)',
                              }}
                           >
                              <Stack
                                 direction="row"
                                 spacing={1}
                                 alignItems="center"
                                 justifyContent="space-between"
                                 sx={{ mb: 0.8 }}
                              >
                                 <Typography sx={{ color: '#fff', fontWeight: 850 }}>
                                    Історія здачі
                                 </Typography>
                                 <Button
                                    size="small"
                                    startIcon={<AddRoundedIcon />}
                                    onClick={openHistoryDialog}
                                    sx={{
                                       borderRadius: 2.5,
                                       color: '#fff',
                                       fontWeight: 850,
                                       border: '1px solid rgba(255,255,255,0.10)',
                                       bgcolor: 'rgba(255,255,255,0.04)',
                                    }}
                                 >
                                    Додати
                                 </Button>
                              </Stack>

                              <Stack spacing={0.7}>
                                 <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                    <b style={{ color: '#fff' }}>Дата звільнення:</b> {formatDate(item?.rentOptions?.availableFrom)}
                                 </Typography>

                                 <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                    <b style={{ color: '#fff' }}>Дата нової актуальності:</b> {formatDate(item?.rentOptions?.lastActualizedAt)}
                                 </Typography>

                                 <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                    <b style={{ color: '#fff' }}>Остання дата здачі / паузи:</b> {formatDate(rentStory?.rentedAt)}
                                 </Typography>

                                 {!!(rentStory?.rentedByType || rentStory?.rentedBy) && (
                                    <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                       <b style={{ color: '#fff' }}>Хто здавав:</b> {getRentedByLabel(rentStory?.rentedByType || rentStory?.rentedBy)}
                                    </Typography>
                                 )}

                                 {rentStory?.rentedByType === 'employee' && (
                                    <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                       <b style={{ color: '#fff' }}>Менеджер:</b> {currentRentedByEmployeeName}
                                    </Typography>
                                 )}

                                 {!!rentStory?.note && (
                                    <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                       <b style={{ color: '#fff' }}>Нотатка статусу:</b> {rentStory.note}
                                    </Typography>
                                 )}

                                 {!!rentHistory.length && (
                                    <Stack spacing={0.8} sx={{ pt: 0.4 }}>
                                       {rentHistory
                                          .slice()
                                          .sort((a, b) => new Date(b?.rentedAt || 0) - new Date(a?.rentedAt || 0))
                                          .map((row, idx) => (
                                             <Box
                                                key={row?._id || `${row?.rentedAt || 'rent'}-${idx}`}
                                                sx={{
                                                   p: 1,
                                                   borderRadius: 2.5,
                                                   bgcolor: 'rgba(255,255,255,0.035)',
                                                   border: '1px solid rgba(255,255,255,0.06)',
                                                }}
                                             >
                                                <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                                                   {formatDate(row?.rentedAt)} · {getRentedByLabel(row?.rentedByType)}
                                                </Typography>
                                                {!!row?.movedOutAt && (
                                                   <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.25 }}>
                                                      Дата виїзду: {formatDate(row.movedOutAt)}
                                                   </Typography>
                                                )}
                                                {row?.rentedByType === 'employee' && (
                                                   <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.25 }}>
                                                      Менеджер: {getHistoryEmployeeName(row)}
                                                   </Typography>
                                                )}
                                                {!!row?.note && (
                                                   <Typography sx={{ color: 'rgba(255,255,255,0.66)', mt: 0.25 }}>
                                                      {row.note}
                                                   </Typography>
                                                )}
                                             </Box>
                                          ))}
                                    </Stack>
                                 )}
                              </Stack>
                           </Box>
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

         <Dialog
            open={statusOpen}
            onClose={() => {
               if (!statusSaving) setStatusOpen(false);
            }}
            fullWidth
            maxWidth="sm"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background:
                     'radial-gradient(circle at 18% 18%, rgba(139,92,246,0.14), transparent 45%), rgba(15,15,23,0.98)',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.70)',
               },
            }}
         >
            <DialogTitle sx={{ color: '#fff', fontWeight: 950 }}>
               Статус здачі
            </DialogTitle>
            <DialogContent>
               {!!statusError && (
                  <Alert severity="error" sx={{ mb: 1.2 }}>
                     {statusError}
                  </Alert>
               )}
               <Grid container spacing={1.2} sx={{ mt: 0.2 }}>
                  <Grid item xs={12}>
                     <TextField
                        select
                        label="Статус"
                        value={statusDraft.statusRent}
                        onChange={(e) => setStatusValue('statusRent', e.target.value)}
                        fullWidth
                        sx={statusFieldSx}
                        SelectProps={{ MenuProps: statusMenuProps }}
                     >
                        {RENT_STATUS_OPTIONS.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12}>
                     <TextField
                        type="date"
                        label={statusDateLabel}
                        value={statusDraft.statusDate}
                        onChange={(e) => setStatusValue('statusDate', e.target.value)}
                        fullWidth
                        sx={statusFieldSx}
                        InputLabelProps={{ shrink: true }}
                     />
                  </Grid>

                  {showStatusRentedBy && (
                     <Grid item xs={12} md={6}>
                        <TextField
                           select
                           label="Хто здавав"
                           value={statusDraft.rentedByType}
                           onChange={(e) => setStatusValue('rentedByType', e.target.value)}
                           fullWidth
                           sx={statusFieldSx}
                           SelectProps={{ MenuProps: statusMenuProps }}
                        >
                           {RENTED_BY_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                 {option.label}
                              </MenuItem>
                           ))}
                        </TextField>
                     </Grid>
                  )}

                  {showStatusRentedBy && statusDraft.rentedByType === 'employee' && (
                     <Grid item xs={12} md={6}>
                        <TextField
                           select
                           label="Менеджер"
                           value={statusDraft.rentedByEmployee}
                           onChange={(e) => setStatusValue('rentedByEmployee', e.target.value)}
                           fullWidth
                           sx={statusFieldSx}
                           SelectProps={{ MenuProps: statusMenuProps }}
                        >
                           <MenuItem value="">Не вказано</MenuItem>
                           {employees.map((employee) => (
                              <MenuItem key={employee._id} value={employee._id}>
                                 {getEmployeeName(employee)}
                              </MenuItem>
                           ))}
                        </TextField>
                     </Grid>
                  )}

                  <Grid item xs={12}>
                     <TextField
                        label="Нотатка"
                        value={statusDraft.note}
                        onChange={(e) => setStatusValue('note', e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        sx={statusFieldSx}
                        placeholder="Коротко про зміну статусу..."
                     />
                  </Grid>
               </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
               <Button
                  onClick={() => setStatusOpen(false)}
                  disabled={statusSaving}
                  sx={{ color: 'rgba(255,255,255,0.72)', fontWeight: 850 }}
               >
                  Скасувати
               </Button>
               <Button
                  onClick={handleSaveStatus}
                  disabled={statusSaving}
                  variant="contained"
                  sx={{
                     borderRadius: 3,
                     fontWeight: 950,
                     color: '#0b0b12',
                     background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                  }}
               >
                  Зберегти
               </Button>
            </DialogActions>
         </Dialog>

         <Dialog
            open={historyOpen}
            onClose={() => {
               if (!historySaving) setHistoryOpen(false);
            }}
            fullWidth
            maxWidth="sm"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background:
                     'radial-gradient(circle at 18% 18%, rgba(139,92,246,0.14), transparent 45%), rgba(15,15,23,0.98)',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.70)',
               },
            }}
         >
            <DialogTitle sx={{ color: '#fff', fontWeight: 950 }}>
               Історія здачі
            </DialogTitle>
            <DialogContent>
               {!!historyError && (
                  <Alert severity="error" sx={{ mb: 1.2 }}>
                     {historyError}
                  </Alert>
               )}
               <Grid container spacing={1.2} sx={{ mt: 0.2 }}>
                  <Grid item xs={12} md={6}>
                     <TextField
                        type="date"
                        label="Дата здачі"
                        value={historyDraft.rentedAt}
                        onChange={(e) => setHistoryValue('rentedAt', e.target.value)}
                        fullWidth
                        sx={statusFieldSx}
                        InputLabelProps={{ shrink: true }}
                     />
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <TextField
                        type="date"
                        label="Дата виїзду"
                        value={historyDraft.movedOutAt}
                        onChange={(e) => setHistoryValue('movedOutAt', e.target.value)}
                        fullWidth
                        sx={statusFieldSx}
                        InputLabelProps={{ shrink: true }}
                     />
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <TextField
                        select
                        label="Хто здавав"
                        value={historyDraft.rentedByType}
                        onChange={(e) => setHistoryValue('rentedByType', e.target.value)}
                        fullWidth
                        sx={statusFieldSx}
                        SelectProps={{ MenuProps: statusMenuProps }}
                     >
                        {RENTED_BY_OPTIONS.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  {historyDraft.rentedByType === 'employee' && (
                     <Grid item xs={12}>
                        <TextField
                           select
                           label="Менеджер"
                           value={historyDraft.rentedByEmployee}
                           onChange={(e) => setHistoryValue('rentedByEmployee', e.target.value)}
                           fullWidth
                           sx={statusFieldSx}
                           SelectProps={{ MenuProps: statusMenuProps }}
                        >
                           <MenuItem value="">Не вказано</MenuItem>
                           {employees.map((employee) => (
                              <MenuItem key={employee._id} value={employee._id}>
                                 {getEmployeeName(employee)}
                              </MenuItem>
                           ))}
                        </TextField>
                     </Grid>
                  )}

                  <Grid item xs={12}>
                     <TextField
                        label="Нотатка"
                        value={historyDraft.note}
                        onChange={(e) => setHistoryValue('note', e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        sx={statusFieldSx}
                        placeholder="Подія заднім числом, без зміни поточного статусу..."
                     />
                  </Grid>
               </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
               <Button
                  onClick={() => setHistoryOpen(false)}
                  disabled={historySaving}
                  sx={{ color: 'rgba(255,255,255,0.72)', fontWeight: 850 }}
               >
                  Скасувати
               </Button>
               <Button
                  onClick={handleSaveHistory}
                  disabled={historySaving}
                  variant="contained"
                  sx={{
                     borderRadius: 3,
                     fontWeight: 950,
                     color: '#0b0b12',
                     background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                  }}
               >
                  Зберегти
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
}
