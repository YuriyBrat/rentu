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

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

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

import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';


const getFieldSx = (theme, mode) => ({
   '& .MuiOutlinedInput-root': {
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: theme.text,
      '& fieldset': { borderColor: theme.border },
      '&:hover fieldset': { borderColor: theme.accent },
      '&.Mui-focused fieldset': { borderColor: theme.accentLight },
   },
   '& .MuiInputLabel-root': {
      color: theme.textSoft,
   },
   '& .MuiInputBase-input': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& textarea': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& .MuiSelect-icon': {
      color: theme.text,
   },
});


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

function InfoPill({ icon, label, value, theme }) {
   return (
      <Stack
         direction="row"
         spacing={0.7}
         alignItems="center"
         sx={{
            px: 1,
            py: 0.75,
            borderRadius: 2.5,
            bgcolor: theme?.hover || 'rgba(255,255,255,0.04)',
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.07)'}`,
            minWidth: 0,
         }}
      >
         <Box sx={{ color: theme?.textSoft || 'rgba(255,255,255,0.58)', display: 'flex' }}>
            {icon}
         </Box>

         <Stack spacing={0.1} minWidth={0}>
            <Typography sx={{ color: theme?.textSoft || 'rgba(255,255,255,0.52)', fontSize: 10.5, lineHeight: 1 }}>
               {label}
            </Typography>
            <Typography
               sx={{ color: theme?.text || '#fff', fontSize: 12.5, fontWeight: 850, lineHeight: 1.1 }}
               noWrap
            >
               {value || '—'}
            </Typography>
         </Stack>
      </Stack>
   );
}

function DetailBox({ title, children, theme, mode }) {
   const bg =
      mode === 'light'
         ? '#fff'
         : mode === 'luxury'
            ? 'rgba(212,175,55,0.045)'
            : 'rgba(255,255,255,0.018)';

   return (
      <Box
         sx={{
            p: 1.25,
            borderRadius: 3,
            bgcolor: bg,
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.06)'}`,
            minHeight: 0,
            boxShadow: mode === 'light' ? '0 8px 22px rgba(124,58,237,0.05)' : 'none',
            // height: '90%',
            width: '100%',
         }}
      >
         <Typography sx={{ color: theme?.text || '#fff', fontWeight: 950, mb: 0.9 }}>
            {title}
         </Typography>
         <Stack spacing={0.55}>{children}</Stack>
      </Box>
   );
};

function DetailLine({ label, value, theme }) {
   if (!value && value !== 0) return null;

   return (
      <Typography
         sx={{
            color: theme?.textSoft || 'rgba(255,255,255,0.72)',
            fontSize: 13,
            lineHeight: 1.45,
            wordBreak: 'break-word',
         }}
      >
         <Box component="span" sx={{ color: theme?.text || '#fff', fontWeight: 900 }}>
            {label}:
         </Box>{' '}
         {value}
      </Typography>
   );
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
};


function groupLinksByPlatform(links = []) {
   return links.reduce((acc, link) => {
      const key = link.platform || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(link);
      return acc;
   }, {});
}

function getLinksBySource(links = [], sourceType) {
   return links.filter((x) => (x.sourceType || 'ours') === sourceType);
}



export default function ObjectWorkRowCard({ item, onEdit, onView, onDelete, onRefresh }) {
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


   const [linksAnchor, setLinksAnchor] = useState(null);
   const [hoveredLinks, setHoveredLinks] = useState([]);
   const [showAdsPanel, setShowAdsPanel] = useState(false);

   const [adSourceType, setAdSourceType] = useState('ours');

   const closeLinksMenu = () => {
      setLinksAnchor(null);
      setHoveredLinks([]);
   };


   const { theme, mode } = useCRMTheme();
   const fieldSx = getFieldSx(theme, mode);

   const isLight = mode === 'light';

   const softBoxSx = {
      bgcolor: isLight ? 'rgba(124,58,237,0.04)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${theme.border}`,
   };

   const isLuxury = mode === 'luxury';

   const panelBg =
      mode === 'dark'
         ? '#0f0f17' // 'rgba(15,15,23,0.92)'
         : mode === 'light'
            ? '#ffffff'
            : 'rgba(23,18,15,0.96)';

   const mutedPanel =
      mode === 'light'
         ? 'rgba(124,58,237,0.045)'
         : mode === 'luxury'
            ? 'rgba(212,175,55,0.07)'
            : 'rgba(255,255,255,0.035)';


   const chipBase = {
      fontWeight: 900,
      borderRadius: 999,
      height: 24,
   };

   const chipNeutralSx = {
      ...chipBase,
      color: mode === 'light' ? '#374151' : theme.text,
      bgcolor: mode === 'light'
         ? 'rgba(0,0,0,0.04) !important'
         : 'rgba(255,255,255,0.035) !important',
      border: `1px solid ${theme.border}`,
   };

   const chipAccentSx = {
      ...chipBase,
      color: mode === 'light' ? '#5b21b6' : theme.accentLight,
      bgcolor: mode === 'light'
         ? 'rgba(124,58,237,0.10) !important'
         : 'rgba(139,92,246,0.15) !important',
      border: `1px solid ${theme.border}`,
   };

   const chipSuccessSx = {
      ...chipBase,
      color: mode === 'light' ? '#065f46' : '#bbf7d0',
      bgcolor: mode === 'light'
         ? 'rgba(16,185,129,0.12) !important'
         : 'rgba(34,197,94,0.13) !important',
      border: mode === 'light'
         ? '1px solid rgba(16,185,129,0.25)'
         : '1px solid rgba(34,197,94,0.22)',
   };
   const chipOnlineSx = {
      ...chipBase,
      color: mode === 'light' ? '#1e3a8a' : '#bfdbfe',
      bgcolor: mode === 'light'
         ? 'rgba(59,130,246,0.10) !important'
         : 'rgba(59,130,246,0.12) !important',
      border: mode === 'light'
         ? '1px solid rgba(59,130,246,0.22)'
         : '1px solid rgba(59,130,246,0.22)',
   };

   const cardSx = {
      border: `1px solid ${theme.border}`,
      bgcolor: panelBg,
      color: theme.text,
      boxShadow: open ? `0 18px 44px ${theme.glow}` : 'none',
   };

   const textSoft = theme.textSoft;


   const image = getImageUrl(item);
   const assigneeName = getEmployeeName(item?.assignee);
   const createdByName = getEmployeeName(item?.createdByEmployee);

   const locationText =
      item?.location_text ||
      [item?.location?.city, item?.location?.street, item?.location?.number]
         .filter(Boolean)
         .join(', ') ||
      'Адреса не вказана';

   // const rentStatusLabel = getRentStatusLabel(item?.statusRent);
   // const hasRent = item?.statusRent && item.statusRent !== 'rentNo';


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
            sourceType: adSourceType,
         }),
      });

      if (!res.ok) {
         alert('Не вдалося додати посилання');
         return;
      }

      setAdUrl('');
      setAdTitleLink('');
      setAdNoteLink('');

      // window.location.reload();
      await onRefresh?.();
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
         // window.location.reload();
         await onRefresh?.();

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

         // window.location.reload();
         await onRefresh?.();
      } catch (e) {
         console.error(e);
      }
   };



   const actionIconSx = {
      color: theme.text,
      border: `1px solid ${theme.border}`,
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.06)' : theme.hover,
      '&:hover': {
         bgcolor: mode === 'light' ? 'rgba(124,58,237,0.12)' : theme.hover,
         borderColor: theme.accent,
      },
   };

   const deleteIconSx = {
      color: mode === 'light' ? '#b91c1c' : '#ffb4b4',
      border: '1px solid rgba(239,68,68,0.28)',
      bgcolor: mode === 'light' ? 'rgba(239,68,68,0.06)' : 'rgba(255,82,82,0.07)',
      '&:hover': {
         bgcolor: mode === 'light' ? 'rgba(239,68,68,0.12)' : 'rgba(255,82,82,0.12)',
      },
   };



   return (
      <Box
         sx={{
            borderRadius: 4,
            overflow: 'hidden',
            ...cardSx,
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
                        sx={chipSuccessSx}
                     />

                     <Chip
                        label={getEstateLabel(item?.type_estate)}
                        size="small"
                        sx={chipNeutralSx}
                     />

                     <Chip
                        label={item?.type_deal || 'Угода'}
                        size="small"
                        sx={chipAccentSx}
                     />

                     {item?.isPublic && (
                        <Chip
                           label="На сайті"
                           size="small"
                           sx={chipOnlineSx}
                        />
                     )}
                  </Stack>

                  <Typography
                     sx={{
                        color: theme.text,
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
                        color: textSoft,
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
                        theme={theme}
                     />

                     <InfoPill
                        icon={<BedRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Кімнат"
                        value={item?.rooms || '—'}
                        theme={theme}
                     />

                     <InfoPill
                        icon={<SquareFootRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Площа"
                        value={item?.square_tot ? `${item.square_tot} м²` : '—'}
                        theme={theme}
                     />

                     <InfoPill
                        icon={<ApartmentRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Поверх"
                        value={
                           item?.floor
                              ? `${item.floor}${item?.floors ? ` / ${item.floors}` : ''}`
                              : '—'
                        }
                        theme={theme}
                     />

                     {/* <InfoPill
                        icon={<PersonRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Відповідальний"
                        value={assigneeName}
                        theme={theme}
                     /> */}
                  </Stack>
               </Stack>


               <Stack spacing={0.75} alignItems={{ xs: 'stretch', lg: 'flex-end' }}>
                  <InfoPill
                     icon={<PersonRoundedIcon sx={{ fontSize: 16 }} />}
                     label="Відповідальний"
                     value={assigneeName}
                     theme={theme}
                  />

                  <Stack direction="row" spacing={0.7}>
                     <Tooltip title="Переглянути">
                        <IconButton onClick={() => onView?.(item)} sx={actionIconSx}>
                           <VisibilityRoundedIcon />
                        </IconButton>
                     </Tooltip>

                     <Tooltip title="Редагувати">
                        <IconButton onClick={() => onEdit?.(item)} sx={actionIconSx}>
                           <EditRoundedIcon />
                        </IconButton>
                     </Tooltip>

                     <Tooltip title="Видалити">
                        <IconButton onClick={() => onDelete?.(item)} sx={deleteIconSx}>
                           <DeleteOutlineRoundedIcon />
                        </IconButton>
                     </Tooltip>

                     <Tooltip title={open ? 'Згорнути' : 'Детальніше'}>
                        <IconButton onClick={() => setOpen((p) => !p)} sx={actionIconSx}>
                           {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
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
                  {/* {item.advertisingLinks.slice(0, 8).map((link) => (
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
                              mode === 'light'
                                 ? '#1e40af'
                                 : link.status === 'problem'
                                    ? '#fecaca'
                                    : link.status === 'paused'
                                       ? '#fde68a'
                                       : '#bfdbfe',
                           bgcolor:
                              mode === 'light'
                                 ? 'rgba(59,130,246,0.10)'
                                 :
                                 link.status === 'problem'
                                    ? 'rgba(239,68,68,0.12)'
                                    : link.status === 'paused'
                                       ? 'rgba(245,158,11,0.12)'
                                       : 'rgba(59,130,246,0.12)',
                           border:
                              mode === 'light'
                                 ? '1px solid rgba(59,130,246,0.22)'
                                 :
                                 link.status === 'problem'
                                    ? '1px solid rgba(239,68,68,0.22)'
                                    : link.status === 'paused'
                                       ? '1px solid rgba(245,158,11,0.22)'
                                       : '1px solid rgba(59,130,246,0.22)',
                        }}
                     >
                        {getPlatformLabel(link.platform)}
                     </Button>
                  ))} */}

                  {!!item?.advertisingLinks?.length && (
                     <Box sx={{ px: 1.15, pb: 1 }}>
                        <Stack
                           direction={{ xs: 'column', md: 'row' }}
                           spacing={1}
                           alignItems={{ xs: 'stretch', md: 'center' }}
                           justifyContent="space-between"
                           sx={{
                              pt: 0.8,
                              borderTop: `1px solid ${theme.border}`,
                           }}
                        >
                           <Stack direction="row" spacing={1.1} flexWrap="wrap" useFlexGap>
                              <AdsLinksSection
                                 title="Наші"
                                 links={getLinksBySource(item.advertisingLinks, 'ours')}
                                 color={mode === 'light' ? '#1e40af' : '#bfdbfe'}
                                 bg={mode === 'light' ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.12)'}
                                 border="1px solid rgba(59,130,246,0.25)"
                                 onOpenGroup={(anchor, group) => {
                                    setLinksAnchor(anchor);
                                    setHoveredLinks(group);
                                 }}
                              />

                              <AdsLinksSection
                                 title="Конкуренти"
                                 links={getLinksBySource(item.advertisingLinks, 'competitor')}
                                 color={mode === 'light' ? '#92400e' : '#fde68a'}
                                 bg={mode === 'light' ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.13)'}
                                 border="1px solid rgba(245,158,11,0.28)"
                                 onOpenGroup={(anchor, group) => {
                                    setLinksAnchor(anchor);
                                    setHoveredLinks(group);
                                 }}
                              />

                              <AdsLinksSection
                                 title="Власники"
                                 links={getLinksBySource(item.advertisingLinks, 'owner')}
                                 color={mode === 'light' ? '#991b1b' : '#fecaca'}
                                 bg={mode === 'light' ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.13)'}
                                 border="1px solid rgba(239,68,68,0.28)"
                                 onOpenGroup={(anchor, group) => {
                                    setLinksAnchor(anchor);
                                    setHoveredLinks(group);
                                 }}
                              />
                           </Stack>

                           <Tooltip title={showAdsPanel ? 'Сховати рекламу' : 'Керувати рекламою'}>
                              <IconButton
                                 onClick={() => setShowAdsPanel((p) => !p)}
                                 sx={actionIconSx}
                              >
                                 <CampaignRoundedIcon />
                              </IconButton>
                           </Tooltip>
                        </Stack>

                        <Popover
                           open={!!linksAnchor}
                           anchorEl={linksAnchor}
                           onClose={closeLinksMenu}
                           anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                           transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                           PaperProps={{
                              sx: {
                                 mt: 0.7,
                                 p: 1,
                                 borderRadius: 3,
                                 minWidth: 260,
                                 bgcolor: panelBg,
                                 border: `1px solid ${theme.border}`,
                                 boxShadow: `0 18px 42px ${theme.glow}`,
                              },
                           }}
                        >
                           <Stack spacing={0.7}>
                              {hoveredLinks.map((link) => (
                                 <Button
                                    key={link._id || link.url}
                                    component="a"
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    startIcon={<LinkRoundedIcon />}
                                    sx={{
                                       justifyContent: 'flex-start',
                                       textTransform: 'none',
                                       color: theme.text,
                                       borderRadius: 2,
                                       fontWeight: 850,
                                       bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.035)',
                                       '&:hover': {
                                          bgcolor: theme.hover,
                                       },
                                    }}
                                 >
                                    {link.title || getPlatformLabel(link.platform)}
                                 </Button>
                              ))}
                           </Stack>
                        </Popover>
                     </Box>
                  )}
               </Stack>
            </Box>
         )}


         <Collapse in={open || showAdsPanel} timeout="auto" unmountOnExit>


            {showAdsPanel && (
               <>
                  <Grid item xs={12} lg={6}>
                     <DetailBox title="Рекламні тексти" theme={theme} mode={mode}>
                        <Stack spacing={1}>
                           <TextField
                              size="small"
                              value={adTitle}
                              onChange={(e) => setAdTitle(e.target.value)}
                              placeholder="Назва (наприклад OLX варіант 1)"
                              sx={fieldSx}
                           />

                           <TextField
                              size="small"
                              multiline
                              minRows={2}
                              value={adText}
                              onChange={(e) => setAdText(e.target.value)}
                              placeholder="Текст реклами..."
                              sx={fieldSx}
                           />

                           <TextField
                              size="small"
                              value={adNote}
                              onChange={(e) => setAdNote(e.target.value)}
                              placeholder="Нотатка"
                              sx={fieldSx}
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
                  </Grid>

                  {!!item?.advertisingLinks?.length && (
                     <Grid item xs={12} lg={7}>
                        <DetailBox title="Реклама на сайтах" theme={theme} mode={mode}>
                           <Stack spacing={0.8}>
                              {item.advertisingLinks.map((link) => (
                                 <Box
                                    key={link._id || link.url}
                                    sx={{
                                       p: 1,
                                       borderRadius: 2.5,
                                       bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.03)',
                                       border: `1px solid ${theme.border}`,
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
                                             ...chipBase,
                                             color: mode === 'light' ? '#1e40af' : '#bfdbfe',
                                             bgcolor: mode === 'light'
                                                ? 'rgba(59,130,246,0.12) !important'
                                                : 'rgba(59,130,246,0.12) !important',
                                             border: '1px solid rgba(59,130,246,0.25)',
                                          }}
                                       />

                                       <Chip
                                          label={getAdStatusLabel(link.status)}
                                          size="small"
                                          sx={{
                                             ...chipBase,
                                             color: mode === 'light' ? '#065f46' : theme.text,
                                             bgcolor: mode === 'light'
                                                ? 'rgba(16,185,129,0.10) !important'
                                                : 'rgba(255,255,255,0.05) !important',
                                             border: `1px solid ${theme.border}`,
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
                                       <Typography sx={{ color: theme.text, fontWeight: 850, mt: 0.7 }}>
                                          {link.title}
                                       </Typography>
                                    )}

                                    {!!link.note && (
                                       <Typography sx={{ color: theme.textSoft, fontSize: 13, mt: 0.35 }}>
                                          {link.note}
                                       </Typography>
                                    )}
                                 </Box>
                              ))}
                           </Stack>
                        </DetailBox>
                     </Grid>
                  )}

                  <Grid item xs={12} lg={5}>
                     <DetailBox title="Додати рекламу" theme={theme} mode={mode}>
                        <Grid container spacing={1}>
                           <Grid item xs={12} md={3}>
                              <TextField
                                 select
                                 size="small"
                                 label="Платформа"
                                 value={adPlatform}
                                 onChange={(e) => setAdPlatform(e.target.value)}
                                 fullWidth
                                 sx={fieldSx}
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
                                 sx={fieldSx}
                              />
                           </Grid>

                           <Grid item xs={12} md={3}>
                              <TextField
                                 select
                                 size="small"
                                 label="Тип"
                                 value={adSourceType}
                                 onChange={(e) => setAdSourceType(e.target.value)}
                                 fullWidth
                                 sx={fieldSx}
                              >
                                 <MenuItem value="ours">Наша</MenuItem>
                                 <MenuItem value="competitor">Конкурент</MenuItem>
                                 <MenuItem value="owner">Власник</MenuItem>
                              </TextField>
                           </Grid>

                           <Grid item xs={12} md={5}>
                              <TextField
                                 size="small"
                                 label="Назва / примітка коротко"
                                 value={adTitleLink}
                                 onChange={(e) => setAdTitleLink(e.target.value)}
                                 fullWidth
                                 sx={fieldSx}
                              />
                           </Grid>

                           <Grid item xs={12} md={5}>
                              <TextField
                                 size="small"
                                 label="Нотатка"
                                 value={adNoteLink}
                                 onChange={(e) => setAdNoteLink(e.target.value)}
                                 fullWidth
                                 sx={fieldSx}
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
               </>
            )}



            <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

            <Box sx={{ p: 1.35 }}>

               <Grid container spacing={1.2} alignItems="stretch">
                  <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                     <DetailBox title="Робочий стан" theme={theme} mode={mode} >
                        <DetailLine label="Група" value={getActualityLabel(item?.actualityGroup)} theme={theme} />
                        <DetailLine label="Статус роботи" value={item?.actualityStatus} theme={theme} />
                        <DetailLine label="Примітка" value={item?.actualityNote} theme={theme} />
                        <DetailLine label="Відповідальний" value={assigneeName} theme={theme} />
                        <DetailLine label="Хто вніс" value={createdByName} theme={theme} />
                     </DetailBox>
                  </Grid>

                  <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                     <DetailBox title="Основні дані" theme={theme} mode={mode}>
                        <DetailLine label="Тип об’єкта" value={getEstateLabel(item?.type_estate)} theme={theme} />
                        <DetailLine label="Тип угоди" value={item?.type_deal} theme={theme} />
                        <DetailLine label="Ціна продажу" value={formatMoney(item?.cost, item?.currency)} theme={theme} />
                        <DetailLine label="Адреса" value={locationText} theme={theme} />
                        <DetailLine label="Створено" value={formatDate(item?.createdAt)} theme={theme} />
                     </DetailBox>
                  </Grid>

                  <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                     <DetailBox title="Характеристики" theme={theme} mode={mode}>
                        <DetailLine label="Кімнат" value={item?.rooms} theme={theme} />
                        <DetailLine label="Загальна площа" value={item?.square_tot ? `${item.square_tot} м²` : ''} theme={theme} />
                        <DetailLine label="Житлова" value={item?.square_liv ? `${item.square_liv} м²` : ''} theme={theme} />
                        <DetailLine label="Кухня" value={item?.square_kit ? `${item.square_kit} м²` : ''} theme={theme} />
                        <DetailLine label="Поверх" value={item?.floor ? `${item.floor}/${item?.floors || '—'}` : ''} theme={theme} />
                        <DetailLine label="Стіни" value={item?.type_walls} theme={theme} />
                        <DetailLine label="Будівля" value={item?.type_building} theme={theme} />
                     </DetailBox>
                  </Grid>

                  {!!item?.description && (
                     <Grid item xs={12}>
                        <DetailBox title="Опис" theme={theme} mode={mode}>
                           <Typography sx={{ color: theme?.textSoft || 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>
                              {item.description}
                           </Typography>
                        </DetailBox>
                     </Grid>
                  )}



                  <Grid item xs={12} lg={6}>
                     <DetailBox title="Історія роботи" theme={theme} mode={mode}>
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
                              sx={fieldSx}
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
                  </Grid>

               </Grid>
            </Box>
         </Collapse>
      </Box>
   );
};



function AdsLinksSection({
   title,
   links,
   color,
   bg,
   border,
   onOpenGroup,
}) {
   const grouped = groupLinksByPlatform(links);
   const platforms = Object.entries(grouped);

   if (!platforms.length) return null;

   return (
      <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap>
         <Typography
            sx={{
               color,
               fontSize: 11,
               fontWeight: 950,
               opacity: 0.9,
               mr: 0.2,
            }}
         >
            {title}
         </Typography>

         {platforms.map(([platform, group]) => (
            <Badge
               key={platform}
               badgeContent={group.length > 1 ? group.length : 0}
               color="primary"
               overlap="circular"
               sx={{
                  '& .MuiBadge-badge': {
                     fontSize: 10,
                     height: 16,
                     minWidth: 16,
                     fontWeight: 950,
                  },
               }}
            >
               <Button
                  size="small"
                  onMouseEnter={(e) => onOpenGroup(e.currentTarget, group)}
                  onClick={(e) => onOpenGroup(e.currentTarget, group)}
                  sx={{
                     minHeight: 25,
                     px: 1,
                     py: 0.2,
                     borderRadius: 999,
                     fontSize: 11,
                     fontWeight: 950,
                     color,
                     bgcolor: bg,
                     border,
                  }}
               >
                  {getPlatformLabel(platform)}
               </Button>
            </Badge>
         ))}
      </Stack>
   );
}