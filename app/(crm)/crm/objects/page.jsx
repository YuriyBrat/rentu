'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Grid, Button, TextField, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import CreatePropertyDialog from '@/crm_components/CreatePropertyDialog';

import PropertyCard from '@/crm_components/PropertyCard4';

const MAX_FILES = 25;

export default function ObjectsPage() {
   const [openCreate, setOpenCreate] = useState(false);
   const [q, setQ] = useState('');
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(false);

   const load = async (query = '') => {
      setLoading(true);
      try {
         const res = await fetch(`/api/crm/properties?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
         const data = await res.json();
         setItems(data.items || []);
      } finally {
         setLoading(false);
      }
   };


   const properties = [
      {
         _id: 1,
         title: '2-кімнатна квартира з видом на центр',
         type_estate: 'Квартира',
         type_deal: 'Продаж',
         location: { city: 'Львів', street: 'Шевченка', number: '15' },
         rooms: 2,
         square_tot: 65,
         floor: 3,
         floors: 9,
         cost: 85000,
         currency: 'USD',
         images: ['/krm/demo/flat1.jpg'],
      },
      {
         _id: 2,
         title: 'Комерційне приміщення фасадне',
         type_estate: 'Комерція',
         type_deal: 'Оренда',
         location: { city: 'Львів', street: 'Городоцька', number: '200' },
         rooms: 1,
         square_tot: 120,
         floor: 1,
         floors: 5,
         cost: 1200,
         currency: 'USD',
         images: ['/krm/demo/com1.jpg'],
      },
   ];

   useEffect(() => {
      load('');
   }, []);

   // простий debounce
   useEffect(() => {
      const t = setTimeout(() => load(q), 350);
      return () => clearTimeout(t);
   }, [q]);


   // const handleCreate = async (payload) => {
   //    try {
   //       const fd = new FormData();

   //       fd.set('title', payload.title || '');

   //       fd.set('type_estate', payload.type_estate || '');
   //       fd.set('type_deal', payload.type_deal || '');
   //       fd.set('location_text', payload.location_text || '');

   //       fd.set('location.city', payload.location?.city || '');
   //       fd.set('location.street', payload.location?.street || '');
   //       fd.set('location.number', payload.location?.number || '');

   //       fd.set('isPublic', String(!!payload.isPublic));
   //       fd.set('actualityGroup', payload.actualityGroup || 'active');
   //       fd.set('actualityStatus', payload.actualityStatus || 'Продзвін');
   //       fd.set('actualityNote', payload.actualityNote || '');

   //       const num = (k, v) => {
   //          if (v === undefined || v === null || v === '') return;
   //          fd.set(k, String(v));
   //       };

   //       num('rooms', payload.rooms);
   //       num('square_tot', payload.square_tot);
   //       num('square_liv', payload.square_liv);
   //       num('square_kit', payload.square_kit);
   //       num('square_area', payload.square_area);
   //       num('square_use', payload.square_use);

   //       if (payload.area_unit) fd.set('area_unit', payload.area_unit);

   //       num('floor', payload.floor);
   //       num('floors', payload.floors);

   //       if (payload.type_building) fd.set('type_building', payload.type_building);
   //       if (payload.type_walls) fd.set('type_walls', payload.type_walls);

   //       num('balconies', payload.balconies);
   //       num('height_wall', payload.height_wall);

   //       if (payload.type_using) fd.set('type_using', payload.type_using);
   //       if (payload.type_commerce) fd.set('type_commerce', payload.type_commerce);
   //       if (payload.type_house) fd.set('type_house', payload.type_house);
   //       if (payload.purpose_area) fd.set('purpose_area', payload.purpose_area);

   //       num('cost', payload.cost);
   //       fd.set('currency', payload.currency || 'USD');

   //       fd.set('description', payload.description || '');

   //       if (payload.leadname) fd.set('leadname', payload.leadname);
   //       if (payload.phone) fd.set('phone', payload.phone);
   //       if (payload.email) fd.set('email', payload.email);

   //       (payload.advantages || []).forEach((x) => {
   //          const v = String(x || '').trim();
   //          if (v) fd.append('advantages', v);
   //       });

   //       (payload.disadvantages || []).forEach((x) => {
   //          const v = String(x || '').trim();
   //          if (v) fd.append('disadvantages', v);
   //       });

   //       // files
   //       (payload.images || []).slice(0, MAX_FILES).forEach((img) => {
   //          if (img?.file) fd.append('images', img.file);
   //       });

   //       // meta for files
   //       fd.set(
   //          'imagesMeta',
   //          JSON.stringify(
   //             (payload.images || []).slice(0, MAX_FILES).map((img, index) => ({
   //                originalName: img?.file?.name || '',
   //                isMain: !!img?.isMain,
   //                stage: img?.stage || 'draft',
   //                order: index,
   //                sortOrder: index,
   //             }))
   //          )
   //       );

   //       const res = await fetch('/api/crm/properties', {
   //          method: 'POST',
   //          body: fd,
   //       });

   //       if (!res.ok) {
   //          const txt = await res.text();
   //          throw new Error(txt || 'Помилка створення');
   //       }

   //       setOpenCreate(false);
   //       await load(q);
   //    } catch (e) {
   //       console.error(e);
   //       alert(e?.message || 'Помилка створення');
   //    }
   // };


   const handleCreate = async (payload) => {
      try {
         const fd = new FormData();

         fd.set('title', payload.title || '');

         fd.set('type_estate', payload.type_estate || '');
         fd.set('type_deal', payload.type_deal || '');
         fd.set('location_text', payload.location_text || '');

         fd.set('location.city', payload.location?.city || '');
         fd.set('location.street', payload.location?.street || '');
         fd.set('location.number', payload.location?.number || '');

         fd.set('isPublic', String(!!payload.isPublic));
         fd.set('actualityGroup', payload.actualityGroup || 'active');
         fd.set('actualityStatus', payload.actualityStatus || 'Продзвін');
         fd.set('actualityNote', payload.actualityNote || '');

         const num = (k, v) => {
            if (v === undefined || v === null || v === '') return;
            fd.set(k, String(v));
         };

         num('rooms', payload.rooms);
         num('square_tot', payload.square_tot);
         num('square_liv', payload.square_liv);
         num('square_kit', payload.square_kit);
         num('square_area', payload.square_area);
         num('square_use', payload.square_use);

         if (payload.area_unit) fd.set('area_unit', payload.area_unit);

         num('floor', payload.floor);
         num('floors', payload.floors);

         if (payload.type_building) fd.set('type_building', payload.type_building);
         if (payload.type_walls) fd.set('type_walls', payload.type_walls);

         num('balconies', payload.balconies);
         num('height_wall', payload.height_wall);

         if (payload.type_using) fd.set('type_using', payload.type_using);
         if (payload.type_commerce) fd.set('type_commerce', payload.type_commerce);
         if (payload.type_house) fd.set('type_house', payload.type_house);
         if (payload.purpose_area) fd.set('purpose_area', payload.purpose_area);

         num('cost', payload.cost);
         fd.set('currency', payload.currency || 'USD');

         fd.set('description', payload.description || '');

         // =========================
         // НОВЕ: оренда
         // =========================
         fd.set('statusRent', payload.statusRent || 'rentNo');
         fd.set('rentOptions', JSON.stringify(payload.rentOptions || {}));

         // =========================
         // НОВЕ: власники / контакти
         // =========================
         fd.set('owners', JSON.stringify(payload.owners || []));

         // старі поля можна вже прибрати,
         // або залишити тимчасово для сумісності
         if (payload.leadname) fd.set('leadname', payload.leadname);
         if (payload.phone) fd.set('phone', payload.phone);
         if (payload.email) fd.set('email', payload.email);

         (payload.advantages || []).forEach((x) => {
            const v = String(x || '').trim();
            if (v) fd.append('advantages', v);
         });

         (payload.disadvantages || []).forEach((x) => {
            const v = String(x || '').trim();
            if (v) fd.append('disadvantages', v);
         });

         // files
         (payload.images || []).slice(0, MAX_FILES).forEach((img) => {
            if (img?.file) fd.append('images', img.file);
         });

         // meta for files
         fd.set(
            'imagesMeta',
            JSON.stringify(
               (payload.images || []).slice(0, MAX_FILES).map((img, index) => ({
                  originalName: img?.file?.name || '',
                  isMain: !!img?.isMain,
                  stage: img?.stage || 'draft',
                  order: index,
                  sortOrder: index,
               }))
            )
         );

         console.log('CREATE FD statusRent:', payload.statusRent);
         console.log('CREATE FD owners:', payload.owners);
         console.log('CREATE FD rentOptions:', payload.rentOptions);

         const res = await fetch('/api/crm/properties', {
            method: 'POST',
            body: fd,
         });

         if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || 'Помилка створення');
         }

         setOpenCreate(false);
         await load(q);
      } catch (e) {
         console.error(e);
         alert(e?.message || 'Помилка створення');
      }
   };



   const handleDelete = async (property) => {
      const ok = window.confirm(`Видалити об'єкт "${property.title}"? Фото теж будуть видалені.`);
      if (!ok) return;

      try {
         const res = await fetch(`/api/crm/properties/${property._id}`, {
            method: 'DELETE',
         });

         if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || 'Помилка видалення');
         }

         await load(q);
      } catch (e) {
         console.error(e);
         alert(e?.message || 'Помилка видалення');
      }
   };



   return (
      <Box>
         <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
               <Typography variant="h5" fontWeight={950} sx={{ color: '#fff' }}>
                  Об'єкти
               </Typography>
               <Typography sx={{ fontSize: 12, opacity: 0.65, mt: 0.4 }}>
                  Каталог об’єктів CRM • Black + Purple neon
               </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
               <TextField
                  placeholder="Пошук по назві / адресі..."
                  size="small"
                  InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, opacity: 0.7 }} /> }}
                  sx={{
                     width: { xs: '100%', sm: 320 },
                     '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.03)',
                        borderRadius: 3,
                        color: '#fff',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.10)' },
                     },
                  }}
               />

               <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreate(true)}
                  sx={{
                     borderRadius: 3,
                     fontWeight: 950,
                     px: 2.2,
                     background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                     boxShadow: '0 14px 30px rgba(139,92,246,0.35)',
                     '&:hover': { boxShadow: '0 18px 40px rgba(139,92,246,0.45)' },
                  }}
               >
                  Додати об'єкт
               </Button>
            </Stack>
         </Stack>

         <Grid container spacing={3}>
            {/* {properties.map((p) => (
               <Grid item xs={12} md={6} lg={4} key={p._id}>
                  <PropertyCard property={p} onMore={() => { }} />
               </Grid>
            ))} */}
            {items.map((p) => (
               <Grid item xs={12} md={6} lg={4} key={p._id}>
                  <PropertyCard
                     property={p}
                     onDelete={handleDelete}
                     onEdit={(item) => console.log('edit', item)}
                     onView={(item) => console.log('view', item)}
                  />
               </Grid>
            ))}

         </Grid>

         <CreatePropertyDialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            onSubmit={handleCreate}
         />
      </Box>
   );
}