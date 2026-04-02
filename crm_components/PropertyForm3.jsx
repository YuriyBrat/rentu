'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Grid,
   TextField,
   Button,
   ToggleButton,
   ToggleButtonGroup,
   Divider,
   Chip,
   MenuItem,
   Alert,
} from '@mui/material';

import imageCompression from 'browser-image-compression';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';

const PHOTO_STAGES = [
   { value: 'draft', label: 'Чорнові' },
   { value: 'processed', label: 'Оброблені' },
   { value: 'branded', label: 'З лого' },
];

const ESTATE_TYPES = [
   { value: 'flat', label: 'Квартира' },
   { value: 'house', label: 'Будинок' },
   { value: 'land', label: 'Ділянка' },
   { value: 'commerce', label: 'Комерція' },
];

const DEAL_TYPES = [
   { value: 'продаж', label: 'ПРОДАЖ' },
   { value: 'оренда', label: 'ОРЕНДА' },
];

const CURRENCIES = ['USD', 'UAH', 'EUR'];

const USING_COMMERCE = [
   'Офіс',
   'Кафе/ресторан',
   'Магазин',
   'Склад',
   'Готель',
   'Виробництво',
   'Коворкінг',
   'Медичне',
   'Інше',
];

const BUILDING_COMMERCE = [
   'Фасадне з окремим входом',
   'Бізнес-центр',
   'Торговий центр',
   'Окрема будівля',
   'Нежитловий фонд',
   'Житловий фонд',
   'Логістичний комплекс',
   'Ангар',
];

const COMMERCE_SUBTYPE = ['Автомийка', 'АЗС', 'Аптека', 'Перукарня', 'Салон краси', 'СТО'];

const BUILDING_FLAT = [
   'Австрійський',
   'Польський',
   'Сталінка',
   'Хрущовка',
   'Чешка',
   'Новобудова 2000-2010',
   'Новобудова 2010-2020',
   'Новобудова від 2020',
];

const WALLS = ['Цегла', 'Панель', 'Блок', 'Бетон', 'Дерево'];

const HOUSE_TYPES = ['Будинок', 'Дача', 'Котедж', 'Особняк', 'Садиба', 'Таунхаус', 'Частина будинку'];

const AREA_UNITS = ['Соток', 'Га'];

const PURPOSE_LAND = [
   'під житлову забудову',
   'багатоквартирного',
   'комерційного',
   'промислового',
   'сільськогосподарського',
   'садівництво',
];

const ACTUALITY_GROUPS = [
   { value: 'active', label: 'Актуальний' },
   { value: 'paused', label: 'Зупинений' },
   { value: 'inactive', label: 'Неактуальний' },
];

const ACTUALITY_STATUSES = [
   'Актуальний. Оглянутий! В роботі',
   'Актуальний. Продзвін',
   'Актуальний. Проблемний',
   'Актуальний. Оглянутий! Не в роботі',
   'Неактуальний. Проданий мною',
   'Неактуальний. Проданий не мною',
   'Неактуальний. Знятий з продажу',
   'Неактуальний. Невідома причина',
   'Зупинений. Завдаток мій',
   'Зупинений. Завдаток не мій',
   'Зупинений. Виявлена причина власників',
   'Зупинений. Невиявлена причина власників',
];

const fieldSx = {
   '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: '#fff',
      minHeight: 44,
      fontSize: '0.92rem',

      '& input': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
         caretColor: '#fff',
         paddingTop: '10px',
         paddingBottom: '10px',
      },

      '& textarea': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
         caretColor: '#fff',
      },

      '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
      '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.55)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(168,85,247,0.95)' },
   },

   '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.88) !important',
      fontWeight: 700,
      fontSize: '0.92rem',
   },

   '& .MuiInputLabel-root.Mui-focused': {
      color: 'rgba(200,160,255,1) !important',
      textShadow: '0 0 14px rgba(139,92,246,0.45)',
   },

   '& input::placeholder': {
      color: 'rgba(255,255,255,0.60) !important',
      opacity: 1,
   },

   '& textarea::placeholder': {
      color: 'rgba(255,255,255,0.60) !important',
      opacity: 1,
   },

   '& .MuiSelect-icon': {
      color: 'rgba(255,255,255,0.80) !important',
   },

   '& .MuiFormHelperText-root': {
      color: 'rgba(255,255,255,0.60)',
      fontSize: '0.78rem',
   },
};

const selectMenuProps = {
   PaperProps: {
      sx: {
         bgcolor: '#151521',
         color: '#fff',
         border: '1px solid rgba(255,255,255,0.08)',
         '& .MuiMenuItem-root': {
            color: 'rgba(255,255,255,0.92)',
            fontSize: '0.92rem',
         },
         '& .MuiMenuItem-root.Mui-selected': {
            bgcolor: 'rgba(139,92,246,0.24)',
            color: '#fff',
         },
         '& .MuiMenuItem-root:hover': {
            bgcolor: 'rgba(255,255,255,0.06)',
         },
         '& .MuiSelect-select': {
            color: '#fff !important',
            WebkitTextFillColor: '#fff !important',
         }
      },
   },
};

// function emptyFields(type_estate = 'flat', type_deal = 'продаж') {
//    return {
//       type_estate,
//       type_deal,
//       ip: '',

//       isPublic: false,
//       actualityGroup: 'active',
//       actualityStatus: 'Актуальний. Продзвін',
//       actualityNote: '',

//       title: '',
//       location_text: '',
//       location: { city: '', street: '', number: '' },

//       rooms: '',
//       square_tot: '',
//       square_liv: '',
//       square_kit: '',
//       square_area: '',
//       square_use: '',
//       area_unit: '',

//       floor: '',
//       floors: '',

//       type_building: '',
//       type_walls: '',
//       balconies: '',

//       height_wall: '',
//       type_using: '',
//       type_commerce: '',

//       type_house: '',
//       purpose_area: '',

//       cost: '',
//       currency: 'USD',

//       description: '',

//       photoStage: 'draft', // new field for photo stage
//       images: [],
//       advantages: ['', '', '', '', '', ''],
//       disadvantages: ['', '', '', ''],

//       leadname: '',
//       phone: '',
//       email: '',
//    };
// }

function emptyOwner(isPrimary = false) {
   return {
      name: '',
      phones: [''],
      emails: [''],
      status: 'active',
      isPrimary,
      notes: '',
   };
}

function emptyRentOptions() {
   return {
      price: '',
      currency: 'USD',
      availableFrom: '',
      adText: '',
      notes: '',
      conditions: [''],
      furniture: [''],
      appliances: [''],
      lastActualizedAt: '',
   };
}

function emptyFields(type_estate = 'flat', type_deal = 'продаж') {
   return {
      type_estate,
      type_deal,
      ip: '',

      isPublic: false,
      actualityGroup: 'active',
      actualityStatus: 'Актуальний. Продзвін',
      actualityNote: '',

      title: '',
      location_text: '',
      location: { city: '', street: '', number: '', flat: '' },

      rooms: '',
      square_tot: '',
      square_liv: '',
      square_kit: '',
      square_area: '',
      square_use: '',
      area_unit: '',

      floor: '',
      floors: '',

      type_building: '',
      type_walls: '',
      balconies: '',

      height_wall: '',
      type_using: '',
      type_commerce: '',

      type_house: '',
      purpose_area: '',

      cost: '',
      currency: 'USD',

      description: '',

      photoStage: 'draft',
      images: [],
      advantages: ['', '', '', '', '', ''],
      disadvantages: ['', '', '', ''],

      statusRent: 'rentNo',
      rentOptions: emptyRentOptions(),

      owners: [emptyOwner(true)],
   };
}

export default function PropertyForm({ onCancel, onSubmit }) {
   const [fields, setFields] = useState(() => emptyFields('flat', 'продаж'));
   const [loading, setLoading] = useState(false);

   const [imgMeta, setImgMeta] = useState([]);
   const [imgWarn, setImgWarn] = useState('');

   const type = fields.type_estate;

   const showRoomsBlock = type !== 'land';
   const showFlat = type === 'flat';
   const showHouse = type === 'house';
   const showLand = type === 'land';
   const showCommerce = type === 'commerce';

   const titleHint = useMemo(() => {
      if (type === 'flat') return 'Титульна назва квартири...';
      if (type === 'house') return 'Титульна назва будинку...';
      if (type === 'land') return 'Титульна назва ділянки...';
      if (type === 'commerce') return 'Титульна назва комерції...';
      return "Титульна назва об'єкту...";
   }, [type]);

   const handleTypeChange = (_e, next) => {
      if (!next) return;
      setFields((p) => ({
         ...emptyFields(next, p.type_deal),
         type_estate: next,
         type_deal: p.type_deal,
      }));
   };

   const handleDealChange = (_e, next) => {
      if (!next) return;
      setFields((p) => ({ ...p, type_deal: next }));
   };


   const getPhotoStageLabel = (stage) => {
      if (stage === 'draft') return 'Чорнові';
      if (stage === 'processed') return 'Оброблені';
      if (stage === 'branded') return 'З лого';
      return stage || '';
   };

   const set = (name, value) => setFields((p) => ({ ...p, [name]: value }));

   const setLoc = (key, value) =>
      setFields((p) => ({ ...p, location: { ...p.location, [key]: value } }));


   const setMainImage = (index) => {
      setFields((p) => ({
         ...p,
         images: (p.images || []).map((img, i) => ({
            ...img,
            isMain: i === index,
         })),
      }));
   };

   const removeImage = (index) => {
      setFields((p) => {
         const target = p.images?.[index];
         if (target?.preview) {
            try {
               URL.revokeObjectURL(target.preview);
            } catch (_e) { }
         }

         const next = (p.images || []).filter((_, i) => i !== index);

         if (next.length > 0 && !next.some((img) => img.isMain)) {
            next[0] = { ...next[0], isMain: true };
         }

         return { ...p, images: next };
      });
   };



   const setAdv = (idx, value) =>
      setFields((p) => {
         const arr = [...p.advantages];
         arr[idx] = value;
         return { ...p, advantages: arr };
      });

   const setDisadv = (idx, value) =>
      setFields((p) => {
         const arr = [...p.disadvantages];
         arr[idx] = value;
         return { ...p, disadvantages: arr };
      });

   const MAX_BYTES = 10 * 1024 * 1024;
   const MAX_FILES = 25;

   const formatBytes = (bytes) => {
      if (!bytes && bytes !== 0) return '';
      const mb = bytes / (1024 * 1024);
      if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 2)} MB`;
      const kb = bytes / 1024;
      return `${kb.toFixed(0)} KB`;
   };

   // const handleImages = async (e) => {
   //    const picked = Array.from(e.target.files || []).slice(0, MAX_FILES);

   //    setImgWarn('');
   //    setImgMeta([]);

   //    if (!picked.length) {
   //       set('images', []);
   //       return;
   //    }

   //    e.target.value = '';

   //    const options = {
   //       maxSizeMB: 1.2,
   //       maxWidthOrHeight: 2560,
   //       useWebWorker: true,
   //       initialQuality: 0.8,
   //    };

   //    const compressedFiles = [];
   //    const meta = [];
   //    const tooBig = [];

   //    for (const file of picked) {
   //       const before = file.size;

   //       let outFile = file;
   //       let after = before;

   //       try {
   //          if (file.type?.startsWith('image/')) {
   //             outFile = await imageCompression(file, options);
   //             after = outFile.size;
   //          }
   //       } catch (_err) {
   //          outFile = file;
   //          after = before;
   //       }

   //       const ok = after <= MAX_BYTES;

   //       meta.push({
   //          name: file.name,
   //          before,
   //          after,
   //          ok,
   //          reason: ok ? '' : `> ${formatBytes(MAX_BYTES)}`,
   //       });

   //       if (ok) {
   //          compressedFiles.push(outFile);
   //       } else {
   //          tooBig.push(file.name);
   //       }
   //    }

   //    setImgMeta(meta);

   //    if (tooBig.length) {
   //       setImgWarn(
   //          `Деякі фото все ще завеликі (>10MB) навіть після стиску і НЕ будуть завантажені: ${tooBig.join(', ')}`
   //       );
   //    }

   //    set('images', compressedFiles);
   // };

   const handleImages = async (e) => {
      const picked = Array.from(e.target.files || []);

      setImgWarn('');
      setImgMeta([]);

      if (!picked.length) return;

      e.target.value = '';

      const options = {
         maxSizeMB: 1.2,
         maxWidthOrHeight: 2560,
         useWebWorker: true,
         initialQuality: 0.8,
      };

      const existing = fields.images || [];
      const availableSlots = MAX_FILES - existing.length;

      if (availableSlots <= 0) {
         setImgWarn(`Максимум ${MAX_FILES} фото.`);
         return;
      }

      const filesToProcess = picked.slice(0, availableSlots);

      const nextImages = [];
      const meta = [];
      const tooBig = [];

      for (const file of filesToProcess) {
         const before = file.size;

         let outFile = file;
         let after = before;

         try {
            if (file.type?.startsWith('image/')) {
               outFile = await imageCompression(file, options);
               after = outFile.size;
            }
         } catch (_err) {
            outFile = file;
            after = before;
         }

         const ok = after <= MAX_BYTES;

         meta.push({
            name: file.name,
            before,
            after,
            ok,
            reason: ok ? '' : `> ${formatBytes(MAX_BYTES)}`,
         });

         if (!ok) {
            tooBig.push(file.name);
            continue;
         }

         nextImages.push({
            file: outFile,
            preview: URL.createObjectURL(outFile),
            isMain: false,
            stage: fields.photoStage || 'draft',
         });
      }

      let merged = [...existing, ...nextImages];

      if (merged.length > 0 && !merged.some((img) => img.isMain)) {
         merged = merged.map((img, idx) => ({
            ...img,
            isMain: idx === 0,
         }));
      }

      setImgMeta(meta);

      if (tooBig.length) {
         setImgWarn(
            `Деякі фото все ще завеликі (>10MB) навіть після стиску і НЕ будуть завантажені: ${tooBig.join(', ')}`
         );
      }

      if (picked.length > filesToProcess.length) {
         setImgWarn((prev) =>
            prev
               ? `${prev} Також частина фото не додана, бо ліміт ${MAX_FILES}.`
               : `Частина фото не додана, бо ліміт ${MAX_FILES}.`
         );
      }

      set('images', merged);
   };


   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         const payload = {
            ...fields,
            rooms: fields.rooms ? Number(fields.rooms) : undefined,
            square_tot: fields.square_tot ? Number(fields.square_tot) : undefined,
            square_liv: fields.square_liv ? Number(fields.square_liv) : undefined,
            square_kit: fields.square_kit ? Number(fields.square_kit) : undefined,
            square_area: fields.square_area ? Number(fields.square_area) : undefined,
            square_use: fields.square_use ? Number(fields.square_use) : undefined,
            floor: fields.floor ? Number(fields.floor) : undefined,
            floors: fields.floors ? Number(fields.floors) : undefined,
            balconies: fields.balconies ? Number(fields.balconies) : undefined,
            height_wall: fields.height_wall ? Number(fields.height_wall) : undefined,
            cost: fields.cost ? Number(fields.cost) : undefined,
            advantages: (fields.advantages || []).map((x) => x?.trim()).filter(Boolean),
            disadvantages: (fields.disadvantages || []).map((x) => x?.trim()).filter(Boolean),
            title: fields.title?.trim(),
            location_text: fields.location_text?.trim(),
            description: fields.description?.trim(),
            actualityNote: fields.actualityNote?.trim(),

            images: fields.images || [],
         };

         console.log('CREATE PROPERTY payload:', payload);

         // const stillTooBig = (fields.images || []).some((f) => f.size > MAX_BYTES);
         const stillTooBig = (fields.images || []).some((img) => img?.file?.size > MAX_BYTES);

         if (stillTooBig) {
            alert('Є фото більше 10MB — вони не пройдуть. Прибери або заміни їх.');
            setLoading(false);
            return;
         }

         await onSubmit?.(payload);
      } finally {
         setLoading(false);
      }
   };

   return (
      <Box component="form" onSubmit={handleSubmit}>
         <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 2 }}
         >
            <Typography
               sx={{
                  color: '#fff',
                  fontWeight: 950,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
               }}
            >
               Додати об’єкт
            </Typography>

            <ToggleButtonGroup
               exclusive
               value={fields.type_deal}
               onChange={handleDealChange}
               sx={{
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 3,
                  p: 0.5,
                  gap: 0.7,
                  '& .MuiToggleButton-root': {
                     border: '1px solid rgba(255,255,255,0.08)',
                     borderRadius: 2.5,
                     color: 'rgba(255,255,255,0.78)',
                     textTransform: 'none',
                     fontWeight: 900,
                     fontSize: '0.85rem',
                     px: 2,
                     py: 0.8,
                     '&.Mui-selected': {
                        color: '#fff',
                        borderColor: 'rgba(139,92,246,0.65)',
                        background:
                           'linear-gradient(90deg, rgba(139,92,246,0.35), rgba(168,85,247,0.18))',
                        boxShadow: '0 12px 28px rgba(139,92,246,0.22)',
                     },
                  },
               }}
            >
               {DEAL_TYPES.map((t) => (
                  <ToggleButton key={t.value} value={t.value}>
                     {t.label}
                  </ToggleButton>
               ))}
            </ToggleButtonGroup>
         </Stack>

         <Stack spacing={1.2} sx={{ mb: 2 }}>
            <ToggleButtonGroup
               exclusive
               value={fields.type_estate}
               onChange={handleTypeChange}
               sx={{
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 3,
                  p: 0.6,
                  gap: 0.8,
                  flexWrap: 'wrap',
                  '& .MuiToggleButton-root': {
                     border: '1px solid rgba(255,255,255,0.08)',
                     borderRadius: 2.5,
                     color: 'rgba(255,255,255,0.78)',
                     textTransform: 'none',
                     fontWeight: 850,
                     fontSize: '0.9rem',
                     px: 1.8,
                     py: 0.85,
                     '&.Mui-selected': {
                        color: '#fff',
                        borderColor: 'rgba(139,92,246,0.65)',
                        background:
                           'linear-gradient(90deg, rgba(139,92,246,0.35), rgba(168,85,247,0.18))',
                        boxShadow: '0 12px 28px rgba(139,92,246,0.22)',
                     },
                  },
               }}
            >
               {ESTATE_TYPES.map((t) => (
                  <ToggleButton key={t.value} value={t.value}>
                     {t.label}
                  </ToggleButton>
               ))}
            </ToggleButtonGroup>
         </Stack>

         <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

         <Grid container spacing={1.6}>
            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 0.5 }}>
                  Характеристики об&apos;єкту
               </Typography>
            </Grid>

            <Grid item xs={12}>
               <TextField
                  label="Назва"
                  placeholder={titleHint}
                  InputLabelProps={{ shrink: true }}
                  value={fields.title}
                  onChange={(e) => set('title', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12}>
               <TextField
                  label="Адреса (рядком)"
                  placeholder="Адреса..."
                  value={fields.location_text}
                  onChange={(e) => set('location_text', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={4}>
               <TextField
                  label="Місто"
                  value={fields.location.city}
                  onChange={(e) => setLoc('city', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={5}>
               <TextField
                  label="Вулиця"
                  value={fields.location.street}
                  onChange={(e) => setLoc('street', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={3}>
               <TextField
                  label="№"
                  value={fields.location.number}
                  onChange={(e) => setLoc('number', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            {showCommerce && (
               <>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Використання"
                        value={fields.type_using}
                        onChange={(e) => set('type_using', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {USING_COMMERCE.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Тип будівлі"
                        value={fields.type_building}
                        onChange={(e) => set('type_building', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {BUILDING_COMMERCE.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Підтип"
                        value={fields.type_commerce}
                        onChange={(e) => set('type_commerce', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {COMMERCE_SUBTYPE.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {showRoomsBlock && (
               <>
                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Кімнат"
                        value={fields.rooms}
                        onChange={(e) => set('rooms', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Загальна, м²"
                        value={fields.square_tot}
                        onChange={(e) => set('square_tot', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  {showFlat || showHouse ? (
                     <>
                        <Grid item xs={12} md={2}>
                           <TextField
                              label="Житлова, м²"
                              value={fields.square_liv}
                              onChange={(e) => set('square_liv', e.target.value)}
                              fullWidth
                              sx={fieldSx}
                           />
                        </Grid>

                        <Grid item xs={12} md={2}>
                           <TextField
                              label="Кухня, м²"
                              value={fields.square_kit}
                              onChange={(e) => set('square_kit', e.target.value)}
                              fullWidth
                              sx={fieldSx}
                           />
                        </Grid>
                     </>
                  ) : (
                     <>
                        <Grid item xs={12} md={2}>
                           <TextField
                              label="Площа ділянки"
                              value={fields.square_area}
                              onChange={(e) => set('square_area', e.target.value)}
                              fullWidth
                              sx={fieldSx}
                           />
                        </Grid>

                        <Grid item xs={12} md={2}>
                           <TextField
                              select
                              label="Одиниця"
                              value={fields.area_unit}
                              onChange={(e) => set('area_unit', e.target.value)}
                              fullWidth
                              sx={fieldSx}
                              SelectProps={{ MenuProps: selectMenuProps }}
                           >
                              {AREA_UNITS.map((x) => (
                                 <MenuItem key={x} value={x}>
                                    {x}
                                 </MenuItem>
                              ))}
                           </TextField>
                        </Grid>
                     </>
                  )}
               </>
            )}

            {(showFlat || showCommerce) && (
               <>
                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Поверх"
                        value={fields.floor}
                        onChange={(e) => set('floor', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Поверхів"
                        value={fields.floors}
                        onChange={(e) => set('floors', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>
               </>
            )}

            {showHouse && (
               <>
                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Площа ділянки"
                        value={fields.square_area}
                        onChange={(e) => set('square_area', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Одиниця"
                        value={fields.area_unit}
                        onChange={(e) => set('area_unit', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {AREA_UNITS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {showFlat && (
               <>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Тип будівлі"
                        value={fields.type_building}
                        onChange={(e) => set('type_building', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {BUILDING_FLAT.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Стіни"
                        value={fields.type_walls}
                        onChange={(e) => set('type_walls', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {WALLS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Балконів"
                        value={fields.balconies}
                        onChange={(e) => set('balconies', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>
               </>
            )}

            {showHouse && (
               <>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Тип будинку"
                        value={fields.type_house}
                        onChange={(e) => set('type_house', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {HOUSE_TYPES.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Поверхів"
                        value={fields.floors}
                        onChange={(e) => set('floors', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Стіни"
                        value={fields.type_walls}
                        onChange={(e) => set('type_walls', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {WALLS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {showCommerce && (
               <>
                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Висота стін"
                        value={fields.height_wall}
                        onChange={(e) => set('height_wall', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        helperText="Напр. 320"
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Стіни"
                        value={fields.type_walls}
                        onChange={(e) => set('type_walls', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {WALLS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Корисна, м²"
                        value={fields.square_use}
                        onChange={(e) => set('square_use', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>
               </>
            )}

            {showLand && (
               <>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Призначення"
                        value={fields.purpose_area}
                        onChange={(e) => set('purpose_area', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {PURPOSE_LAND.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Площа"
                        value={fields.square_area}
                        onChange={(e) => set('square_area', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Одиниця"
                        value={fields.area_unit}
                        onChange={(e) => set('area_unit', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {AREA_UNITS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            <Grid item xs={12} md={2}>
               <TextField
                  label="Вартість"
                  value={fields.cost}
                  onChange={(e) => set('cost', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={2}>
               <TextField
                  select
                  label="Валюта"
                  value={fields.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  {CURRENCIES.map((x) => (
                     <MenuItem key={x} value={x}>
                        {x}
                     </MenuItem>
                  ))}
               </TextField>
            </Grid>

            <Grid item xs={12}>
               <TextField
                  label="Опис"
                  placeholder="Опис об'єкту нерухомості..."
                  value={fields.description}
                  onChange={(e) => set('description', e.target.value)}
                  fullWidth
                  multiline
                  minRows={4}
                  sx={fieldSx}
               />
            </Grid>

            {/* <Grid item xs={12}>
               <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{
                     p: 1.4,
                     borderRadius: 3,
                     border: '1px solid rgba(255,255,255,0.06)',
                     bgcolor: 'rgba(255,255,255,0.02)',
                  }}
               >
                  <Button
                     component="label"
                     startIcon={<PhotoCameraRoundedIcon />}
                     sx={{
                        borderRadius: 3,
                        fontWeight: 900,
                        color: '#fff',
                        border: '1px solid rgba(139,92,246,0.35)',
                        background:
                           'linear-gradient(90deg, rgba(139,92,246,0.22), rgba(168,85,247,0.12))',
                        '&:hover': {
                           background:
                              'linear-gradient(90deg, rgba(139,92,246,0.30), rgba(168,85,247,0.16))',
                        },
                     }}
                  >
                     Завантажити фото (1–25)
                     <input hidden type="file" accept="image/*" multiple onChange={handleImages} />
                  </Button>

                  <Typography sx={{ color: 'rgba(255,255,255,0.70)', fontSize: 12 }}>
                     Обрано: <b style={{ color: '#fff' }}>{fields.images.length}</b>
                  </Typography>

                  <Box sx={{ flexGrow: 1 }} />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                     {imgMeta.slice(0, 6).map((m, idx) => (
                        <Chip
                           key={idx}
                           label={`${m.name} • ${formatBytes(m.before)} → ${formatBytes(m.after)}`}
                           size="small"
                           sx={{
                              bgcolor: m.ok ? 'rgba(255,255,255,0.04)' : 'rgba(255, 82, 82, 0.10)',
                              border: m.ok
                                 ? '1px solid rgba(255,255,255,0.10)'
                                 : '1px solid rgba(255, 82, 82, 0.28)',
                              color: 'rgba(255,255,255,0.88)',
                              maxWidth: 320,
                           }}
                        />
                     ))}

                     {imgMeta.length > 6 && (
                        <Chip
                           label={`+${imgMeta.length - 6}`}
                           size="small"
                           sx={{
                              bgcolor: 'rgba(139,92,246,0.18)',
                              border: '1px solid rgba(139,92,246,0.25)',
                              color: '#fff',
                           }}
                        />
                     )}
                  </Stack>
               </Stack>

               {imgWarn && (
                  <Alert
                     severity="warning"
                     sx={{
                        mt: 1.2,
                        bgcolor: 'rgba(255, 193, 7, 0.08)',
                        border: '1px solid rgba(255, 193, 7, 0.25)',
                        color: 'rgba(255,255,255,0.9)',
                        borderRadius: 3,
                        '& .MuiAlert-icon': { color: 'rgba(255, 193, 7, 0.9)' },
                     }}
                  >
                     {imgWarn}
                  </Alert>
               )}
            </Grid> */}

            {/* IMAGES */}
            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                  Фото об&apos;єкту
               </Typography>

               {/* <Grid container spacing={1.5}>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Група нових фото"
                        value={fields.photoStage}
                        onChange={(e) => set('photoStage', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {PHOTO_STAGES.map((x) => (
                           <MenuItem key={x.value} value={x.value}>
                              {x.label}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </Grid> */}

               {/* <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{
                     mt: 1.5,
                     p: 1.4,
                     borderRadius: 3,
                     border: '1px solid rgba(255,255,255,0.06)',
                     bgcolor: 'rgba(255,255,255,0.02)',
                  }}
               >
                  <Button
                     component="label"
                     startIcon={<PhotoCameraRoundedIcon />}
                     sx={{
                        borderRadius: 3,
                        fontWeight: 900,
                        color: '#fff',
                        border: '1px solid rgba(139,92,246,0.35)',
                        background: 'linear-gradient(90deg, rgba(139,92,246,0.22), rgba(168,85,247,0.12))',
                        '&:hover': {
                           background: 'linear-gradient(90deg, rgba(139,92,246,0.30), rgba(168,85,247,0.16))',
                        },
                     }}
                  >
                     Завантажити фото (1–25)
                     <input hidden type="file" accept="image/*" multiple onChange={handleImages} />
                  </Button>

                  <Typography sx={{ color: 'rgba(255,255,255,0.70)', fontSize: 12 }}>
                     Обрано: <b style={{ color: '#fff' }}>{fields.images.length}</b> / {MAX_FILES}
                  </Typography>

                  <Box sx={{ flexGrow: 1 }} />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                     {imgMeta.slice(0, 4).map((m, idx) => (
                        <Chip
                           key={idx}
                           label={`${m.name} • ${formatBytes(m.before)} → ${formatBytes(m.after)}`}
                           size="small"
                           sx={{
                              bgcolor: m.ok ? 'rgba(255,255,255,0.04)' : 'rgba(255, 82, 82, 0.10)',
                              border: m.ok
                                 ? '1px solid rgba(255,255,255,0.10)'
                                 : '1px solid rgba(255, 82, 82, 0.28)',
                              color: 'rgba(255,255,255,0.88)',
                              maxWidth: 320,
                           }}
                        />
                     ))}

                     {imgMeta.length > 4 && (
                        <Chip
                           label={`+${imgMeta.length - 4}`}
                           size="small"
                           sx={{
                              bgcolor: 'rgba(139,92,246,0.18)',
                              border: '1px solid rgba(139,92,246,0.25)',
                              color: '#fff',
                           }}
                        />
                     )}
                  </Stack>
               </Stack> */}

               <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.2}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{
                     mt: 1.5,
                     p: 1.4,
                     borderRadius: 3,
                     border: '1px solid rgba(255,255,255,0.06)',
                     bgcolor: 'rgba(255,255,255,0.02)',
                  }}
               >
                  {/* КНОПКА */}
                  <Button
                     component="label"
                     startIcon={<PhotoCameraRoundedIcon />}
                     sx={{
                        borderRadius: 3,
                        fontWeight: 900,
                        color: '#fff',
                        border: '1px solid rgba(139,92,246,0.35)',
                        background: 'linear-gradient(90deg, rgba(139,92,246,0.22), rgba(168,85,247,0.12))',
                        whiteSpace: 'normal',
                        textAlign: 'center',
                        lineHeight: 1,
                        minHeight: 36,
                        minWidth: 150,
                        '&:hover': {
                           background: 'linear-gradient(90deg, rgba(139,92,246,0.30), rgba(168,85,247,0.16))',
                        },
                     }}
                  >
                     Завантажити<br />фото
                     <input hidden type="file" accept="image/*" multiple onChange={handleImages} />
                  </Button>

                  {/* SELECT ГРУПИ */}
                  <TextField
                     select
                     size="small"
                     label="Група фото"
                     value={fields.photoStage}
                     onChange={(e) => set('photoStage', e.target.value)}
                     sx={{
                        minWidth: 150,
                        ...fieldSx,
                        '& .MuiOutlinedInput-root': {
                           ...fieldSx['& .MuiOutlinedInput-root'],
                           height: 40,
                        },
                     }}
                     SelectProps={{ MenuProps: selectMenuProps }}
                  >
                     {PHOTO_STAGES.map((x) => (
                        <MenuItem key={x.value} value={x.value}>
                           {x.label}
                        </MenuItem>
                     ))}
                  </TextField>

                  {/* ІНФО */}
                  <Typography
                     sx={{
                        color: 'rgba(255,255,255,0.70)',
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                     }}
                  >
                     Обрано: <b style={{ color: '#fff' }}>{fields.images.length}</b> / {MAX_FILES}
                  </Typography>

                  {/* РОЗТЯГУВАЧ */}
                  <Box sx={{ flexGrow: 1 }} />

                  {/* META CHIP */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                     {imgMeta.slice(0, 3).map((m, idx) => (
                        <Chip
                           key={idx}
                           label={`${m.name} • ${formatBytes(m.after)}`}
                           size="small"
                           sx={{
                              bgcolor: m.ok ? 'rgba(255,255,255,0.04)' : 'rgba(255, 82, 82, 0.10)',
                              border: m.ok
                                 ? '1px solid rgba(255,255,255,0.10)'
                                 : '1px solid rgba(255, 82, 82, 0.28)',
                              color: 'rgba(255,255,255,0.88)',
                              maxWidth: 220,
                           }}
                        />
                     ))}

                     {imgMeta.length > 3 && (
                        <Chip
                           label={`+${imgMeta.length - 3}`}
                           size="small"
                           sx={{
                              bgcolor: 'rgba(139,92,246,0.18)',
                              border: '1px solid rgba(139,92,246,0.25)',
                              color: '#fff',
                           }}
                        />
                     )}
                  </Stack>
               </Stack>



               {imgWarn && (
                  <Alert
                     severity="warning"
                     sx={{
                        mt: 1.2,
                        bgcolor: 'rgba(255, 193, 7, 0.08)',
                        border: '1px solid rgba(255, 193, 7, 0.25)',
                        color: 'rgba(255,255,255,0.9)',
                        borderRadius: 3,
                        '& .MuiAlert-icon': { color: 'rgba(255, 193, 7, 0.9)' },
                     }}
                  >
                     {imgWarn}
                  </Alert>
               )}

               {!!fields.images.length && (
                  <Grid container spacing={1.2} sx={{ mt: 1 }}>
                     {fields.images.map((img, idx) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={`${img.file?.name || 'img'}-${idx}`}>
                           <Box
                              sx={{
                                 border: img.isMain
                                    ? '2px solid rgba(168,85,247,0.95)'
                                    : '1px solid rgba(255,255,255,0.10)',
                                 borderRadius: 3,
                                 overflow: 'hidden',
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 boxShadow: img.isMain ? '0 0 0 2px rgba(139,92,246,0.18)' : 'none',
                              }}
                           >
                              <Box
                                 component="img"
                                 src={img.preview}
                                 alt={`preview-${idx}`}
                                 sx={{
                                    width: '100%',
                                    aspectRatio: '4 / 3',
                                    objectFit: 'cover',
                                    display: 'block',
                                 }}
                              />

                              <Stack spacing={0.8} sx={{ p: 1.1 }}>
                                 <Typography
                                    sx={{ color: '#fff', fontSize: 12, fontWeight: 700 }}
                                    noWrap
                                    title={img.file?.name || ''}
                                 >
                                    {img.file?.name || `Фото ${idx + 1}`}
                                 </Typography>

                                 <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                                    <Chip
                                       label={getPhotoStageLabel(img.stage)}
                                       size="small"
                                       sx={{
                                          bgcolor: 'rgba(255,255,255,0.05)',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                          color: '#fff',
                                       }}
                                    />

                                    {img.isMain && (
                                       <Chip
                                          label="Головне"
                                          size="small"
                                          sx={{
                                             bgcolor: 'rgba(139,92,246,0.20)',
                                             border: '1px solid rgba(139,92,246,0.35)',
                                             color: '#fff',
                                          }}
                                       />
                                    )}
                                 </Stack>

                                 <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
                                    {formatBytes(img.file?.size || 0)}
                                 </Typography>

                                 <Stack direction="row" spacing={0.8}>
                                    <Button
                                       size="small"
                                       onClick={() => setMainImage(idx)}
                                       sx={{
                                          minWidth: 0,
                                          px: 1,
                                          fontSize: 11,
                                          color: '#fff',
                                          border: '1px solid rgba(255,255,255,0.10)',
                                          borderRadius: 2,
                                       }}
                                    >
                                       {img.isMain ? 'Головне' : 'Зробити головним'}
                                    </Button>

                                    <Button
                                       size="small"
                                       onClick={() => removeImage(idx)}
                                       sx={{
                                          minWidth: 0,
                                          px: 1,
                                          fontSize: 11,
                                          color: '#ffb4b4',
                                          border: '1px solid rgba(255, 82, 82, 0.24)',
                                          borderRadius: 2,
                                       }}
                                    >
                                       Видалити
                                    </Button>
                                 </Stack>
                              </Stack>
                           </Box>
                        </Grid>
                     ))}
                  </Grid>
               )}
            </Grid>


            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                  Переваги (1–6)
               </Typography>
               <Grid container spacing={1.5}>
                  {fields.advantages.map((val, idx) => (
                     <Grid item xs={12} sm={6} md={4} key={idx}>
                        <TextField
                           label={`Перевага ${idx + 1}`}
                           value={val}
                           onChange={(e) => setAdv(idx, e.target.value)}
                           fullWidth
                           sx={fieldSx}
                        />
                     </Grid>
                  ))}
               </Grid>
            </Grid>

            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                  Недоліки
               </Typography>
               <Grid container spacing={1.5}>
                  {fields.disadvantages.map((val, idx) => (
                     <Grid item xs={12} sm={6} md={3} key={idx}>
                        <TextField
                           label={`Недолік ${idx + 1}`}
                           value={val}
                           onChange={(e) => setDisadv(idx, e.target.value)}
                           fullWidth
                           sx={fieldSx}
                        />
                     </Grid>
                  ))}
               </Grid>
            </Grid>

            <Grid item xs={12}>
               <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
            </Grid>

            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                  Характеристики робочі
               </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
               <TextField
                  select
                  label="Актуальність"
                  value={fields.actualityGroup}
                  onChange={(e) => set('actualityGroup', e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  {ACTUALITY_GROUPS.map((x) => (
                     <MenuItem key={x.value} value={x.value}>
                        {x.label}
                     </MenuItem>
                  ))}
               </TextField>
            </Grid>

            <Grid item xs={12} md={5}>
               <TextField
                  select
                  label="Причина актуальності"
                  value={fields.actualityStatus}
                  onChange={(e) => set('actualityStatus', e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  {ACTUALITY_STATUSES.map((x) => (
                     <MenuItem key={x} value={x}>
                        {x}
                     </MenuItem>
                  ))}
               </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
               <TextField
                  select
                  label="Публікація на сайті"
                  value={String(fields.isPublic)}
                  onChange={(e) => set('isPublic', e.target.value === 'true')}
                  fullWidth
                  sx={fieldSx}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  <MenuItem value="true">Так, публічний</MenuItem>
                  <MenuItem value="false">Ні, лише CRM</MenuItem>
               </TextField>
            </Grid>

            <Grid item xs={12}>
               <TextField
                  label="Примітка по актуальності"
                  placeholder="Коментар, причина, деталі..."
                  value={fields.actualityNote}
                  onChange={(e) => set('actualityNote', e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12}>
               <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
            </Grid>

            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                  Контакти
               </Typography>
            </Grid>

            <Grid item xs={12} md={5}>
               <TextField
                  label="Ім’я"
                  value={fields.leadname}
                  onChange={(e) => set('leadname', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={3}>
               <TextField
                  label="Телефон"
                  value={fields.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={4}>
               <TextField
                  label="Email"
                  value={fields.email}
                  onChange={(e) => set('email', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12}>
               <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 1 }}>
                  <Button
                     onClick={onCancel}
                     sx={{
                        borderRadius: 3,
                        color: 'rgba(255,255,255,0.75)',
                        border: '1px solid rgba(255,255,255,0.12)',
                     }}
                  >
                     Скасувати
                  </Button>

                  <Button
                     type="submit"
                     disabled={loading}
                     variant="contained"
                     sx={{
                        borderRadius: 3,
                        fontWeight: 950,
                        px: 2.5,
                        color: '#0b0b12',
                        background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                        boxShadow: '0 16px 35px rgba(139,92,246,0.35)',
                        '&:hover': { boxShadow: '0 22px 45px rgba(139,92,246,0.48)' },
                     }}
                  >
                     {loading ? 'Збереження...' : 'Зберегти об’єкт'}
                  </Button>
               </Stack>
            </Grid>
         </Grid>
      </Box>
   );
}