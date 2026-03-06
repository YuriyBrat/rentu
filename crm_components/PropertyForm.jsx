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
} from '@mui/material';

import { Alert } from '@mui/material';
import imageCompression from 'browser-image-compression';

import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

const ESTATE_TYPES = [
   { value: 'flat', label: 'Квартира' },
   { value: 'house', label: 'Будинок' },
   { value: 'land', label: 'Ділянка' },
   { value: 'commerce', label: 'Комерція' },
];

const CURRENCIES = ['USD', 'UAH', 'EUR'];

const USING_COMMERCE = ['Офіс', 'Кафе/ресторан', 'Магазин', 'Склад', 'Готель', 'Виробництво', 'Коворкінг', 'Медичне', 'Інше'];

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

// маленькі neon стилі для інпутів
const fieldSx = {
   '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 3,

      // ✅ головне: примусово білий текст для всіх варіантів інпуту
      color: '#fff',
      '& input': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff', // chrome autofill fix
         caretColor: '#fff',
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

   // ✅ label (завжди світлий)
   '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.88) !important',
      fontWeight: 750,
   },
   '& .MuiInputLabel-root.Mui-focused': {
      color: 'rgba(200,160,255,1) !important',
      textShadow: '0 0 14px rgba(139,92,246,0.45)',
   },

   // ✅ placeholder світліший
   '& input::placeholder': { color: 'rgba(255,255,255,0.60) !important', opacity: 1 },
   '& textarea::placeholder': { color: 'rgba(255,255,255,0.60) !important', opacity: 1 },

   // select icon
   '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.80) !important' },

   '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.60)' },
};


function emptyFields(type_estate = 'flat') {
   return {
      type_estate,
      type_deal: 'Продаж',
      ip: '',

      title: '',
      location_text: '',
      location: { city: '', street: '', number: '' },

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

      images: [],        // файли
      advantages: ['', '', '', '', '', ''],

      leadname: '',
      phone: '',
      email: '',
   };
}

export default function PropertyForm({ onCancel, onSubmit }) {
   const [fields, setFields] = useState(() => emptyFields('flat'));
   const [loading, setLoading] = useState(false);

   const [imgMeta, setImgMeta] = useState([]); // [{name, before, after, ok, reason}]
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
      setFields((p) => ({ ...emptyFields(next), type_estate: next }));
   };

   const set = (name, value) => setFields((p) => ({ ...p, [name]: value }));

   const setLoc = (key, value) =>
      setFields((p) => ({ ...p, location: { ...p.location, [key]: value } }));

   const setAdv = (idx, value) =>
      setFields((p) => {
         const arr = [...p.advantages];
         arr[idx] = value;
         return { ...p, advantages: arr };
      });



   const MAX_BYTES = 10 * 1024 * 1024; // 10MB для Cloudinary free
   const MAX_FILES = 15;

   const formatBytes = (bytes) => {
      if (!bytes && bytes !== 0) return '';
      const mb = bytes / (1024 * 1024);
      if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 2)} MB`;
      const kb = bytes / 1024;
      return `${kb.toFixed(0)} KB`;
   };

   // const handleImages = (e) => {
   //    const files = Array.from(e.target.files || []);
   //    set('images', files.slice(0, 15));
   // };


   const handleImages = async (e) => {
      const picked = Array.from(e.target.files || []).slice(0, MAX_FILES);

      setImgWarn('');
      setImgMeta([]);

      if (!picked.length) {
         set('images', []);
         return;
      }

      // щоб можна було вибрати той самий файл знову
      e.target.value = '';

      const options = {
         maxSizeMB: 1.2,         // цільова вага (можна 0.9–1.5)
         maxWidthOrHeight: 2560, // для нерухомості ок
         useWebWorker: true,
         initialQuality: 0.8,
      };

      const compressedFiles = [];
      const meta = [];
      const tooBig = [];

      for (const file of picked) {
         const before = file.size;

         let outFile = file;
         let after = before;

         try {
            // компресимо тільки зображення
            if (file.type?.startsWith('image/')) {
               outFile = await imageCompression(file, options);
               after = outFile.size;
            }
         } catch (err) {
            // якщо компресія впала — залишаємо оригінал
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

         if (ok) {
            compressedFiles.push(outFile);
         } else {
            tooBig.push(file.name);
         }
      }

      setImgMeta(meta);

      if (tooBig.length) {
         setImgWarn(
            `Деякі фото все ще завеликі (>10MB) навіть після стиску і НЕ будуть завантажені: ${tooBig.join(', ')}`
         );
      }

      set('images', compressedFiles);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         // мінімальна нормалізація чисел
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
         };

         // поки без API:
         console.log('CREATE PROPERTY payload:', payload);

         const stillTooBig = (fields.images || []).some((f) => f.size > MAX_BYTES);
         if (stillTooBig) {
            alert('Є фото більше 10MB — вони не пройдуть. Прибери/замінити їх.');
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
         {/* TYPE SELECT */}
         <Stack spacing={1.2} sx={{ mb: 2 }}>
            <Typography sx={{ color: '#fff', fontWeight: 900 }}>
               Тип об’єкта
            </Typography>

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
                  '& .MuiToggleButton-root': {
                     border: '1px solid rgba(255,255,255,0.08)',
                     borderRadius: 2.5,
                     color: 'rgba(255,255,255,0.78)',
                     textTransform: 'none',
                     fontWeight: 850,
                     px: 2,
                     py: 1,
                     '&.Mui-selected': {
                        color: '#fff',
                        borderColor: 'rgba(139,92,246,0.65)',
                        background: 'linear-gradient(90deg, rgba(139,92,246,0.35), rgba(168,85,247,0.18))',
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

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
               <Chip
                  icon={<BoltRoundedIcon />}
                  label="Black + Purple neon"
                  size="small"
                  sx={{
                     bgcolor: 'rgba(139,92,246,0.18)',
                     border: '1px solid rgba(139,92,246,0.25)',
                     color: '#fff',
                  }}
               />
            </Stack>
         </Stack>

         <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

         {/* BASIC */}
         <Grid container spacing={2.2}>
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

            {/* можеш увімкнути детальну адресу коли захочеш */}
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

            {/* COMMERCE BLOCK */}
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
                     >
                        {USING_COMMERCE.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
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
                     >
                        {BUILDING_COMMERCE.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
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
                     >
                        {COMMERCE_SUBTYPE.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {/* ROOMS / AREAS */}
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

                  {(showFlat || showHouse) ? (
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
                           >
                              {AREA_UNITS.map((x) => (
                                 <MenuItem key={x} value={x}>{x}</MenuItem>
                              ))}
                           </TextField>
                        </Grid>
                     </>
                  )}
               </>
            )}

            {/* FLOOR / FLOORS */}
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

            {/* HOUSE extra: area */}
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
                     >
                        {AREA_UNITS.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {/* FLAT / HOUSE / COMMERCE specifics */}
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
                     >
                        {BUILDING_FLAT.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
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
                     >
                        {WALLS.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
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
                     >
                        {HOUSE_TYPES.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
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
                     >
                        {WALLS.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
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
                     >
                        {WALLS.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
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

            {/* LAND */}
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
                     >
                        {PURPOSE_LAND.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
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
                     >
                        {AREA_UNITS.map((x) => (
                           <MenuItem key={x} value={x}>{x}</MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {/* PRICE */}
            <Grid item xs={12} md={3}>
               <TextField
                  label="Вартість"
                  value={fields.cost}
                  onChange={(e) => set('cost', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={3}>
               <TextField
                  select
                  label="Валюта"
                  value={fields.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               >
                  {CURRENCIES.map((x) => (
                     <MenuItem key={x} value={x}>{x}</MenuItem>
                  ))}
               </TextField>
            </Grid>

            {/* DESCRIPTION */}
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

            {/* IMAGES */}
            <Grid item xs={12}>
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
                        background: 'linear-gradient(90deg, rgba(139,92,246,0.22), rgba(168,85,247,0.12))',
                        '&:hover': { background: 'linear-gradient(90deg, rgba(139,92,246,0.30), rgba(168,85,247,0.16))' },
                     }}
                  >
                     Завантажити фото (1–15)
                     <input hidden type="file" accept="image/*" multiple onChange={handleImages} />
                  </Button>

                  <Typography sx={{ color: 'rgba(255,255,255,0.70)', fontSize: 12 }}>
                     Обрано: <b style={{ color: '#fff' }}>{fields.images.length}</b>

                     {imgWarn && (
                        <Alert
                           severity="warning"
                           sx={{
                              mt: 1,
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
                  </Typography>

                  <Box sx={{ flexGrow: 1 }} />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                     {/* {fields.images.slice(0, 6).map((f, idx) => (
                        <Chip
                           key={idx}
                           label={f.name}
                           size="small"
                           sx={{
                              bgcolor: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.85)',
                              maxWidth: 180,
                           }}
                        />
                     ))}
                      */}

                     {/* {fields.images.length > 6 && (
                        <Chip
                           label={`+${fields.images.length - 6}`}
                           size="small"
                           sx={{
                              bgcolor: 'rgba(139,92,246,0.18)',
                              border: '1px solid rgba(139,92,246,0.25)',
                              color: '#fff',
                           }}
                        />
                     )} */}
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
            </Grid>

            {/* ADVANTAGES */}
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

            {/* CRM contact block (можемо лишити поки, як у моделі) */}
            <Grid item xs={12}>
               <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
            </Grid>

            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                  Контакти (як у моделі)
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

            {/* ACTIONS */}
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