'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Grid, Button, TextField, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import CreatePropertyDialog from '@/crm_components/CreatePropertyDialog';

import PropertyCard from '@/crm_components/PropertyCard2';

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
   //       // payload з PropertyForm:
   //       // images: File[]
   //       // advantages: string[]
   //       // disadvantages: string[] (якщо ти вже додав у форму)
   //       const fd = new FormData();

   //       // --- базові поля
   //       fd.set('type_estate', payload.type_estate || '');
   //       fd.set('type_deal', payload.type_deal || '');
   //       fd.set('title', payload.title || '');

   //       fd.set('location_text', payload.location_text || '');
   //       fd.set('location.city', payload.location?.city || '');
   //       fd.set('location.street', payload.location?.street || '');
   //       fd.set('location.number', payload.location?.number || '');

   //       // --- числа (як рядки, бек перетворить)
   //       if (payload.rooms !== undefined && payload.rooms !== null && payload.rooms !== '') fd.set('rooms', String(payload.rooms));
   //       if (payload.square_tot) fd.set('square_tot', String(payload.square_tot));
   //       if (payload.square_liv) fd.set('square_liv', String(payload.square_liv));
   //       if (payload.square_kit) fd.set('square_kit', String(payload.square_kit));
   //       if (payload.square_area) fd.set('square_area', String(payload.square_area));
   //       if (payload.square_use) fd.set('square_use', String(payload.square_use));
   //       if (payload.area_unit) fd.set('area_unit', payload.area_unit);

   //       if (payload.floor) fd.set('floor', String(payload.floor));
   //       if (payload.floors) fd.set('floors', String(payload.floors));

   //       if (payload.type_building) fd.set('type_building', payload.type_building);
   //       if (payload.type_walls) fd.set('type_walls', payload.type_walls);
   //       if (payload.balconies) fd.set('balconies', String(payload.balconies));

   //       if (payload.height_wall) fd.set('height_wall', String(payload.height_wall));
   //       if (payload.type_using) fd.set('type_using', payload.type_using);
   //       if (payload.type_commerce) fd.set('type_commerce', payload.type_commerce);

   //       if (payload.type_house) fd.set('type_house', payload.type_house);
   //       if (payload.purpose_area) fd.set('purpose_area', payload.purpose_area);

   //       if (payload.cost !== undefined && payload.cost !== null && payload.cost !== '') fd.set('cost', String(payload.cost));
   //       fd.set('currency', payload.currency || 'USD');

   //       fd.set('description', payload.description || '');

   //       // --- актуальність + публікація
   //       fd.set('actualityGroup', payload.actualityGroup || 'active');
   //       fd.set('actualityStatus', payload.actualityStatus || 'Продзвін');
   //       fd.set('isPublic', String(Boolean(payload.isPublic)));

   //       if (payload.lastContactAt) fd.set('lastContactAt', new Date(payload.lastContactAt).toISOString());
   //       if (payload.nextCheckAt) fd.set('nextCheckAt', new Date(payload.nextCheckAt).toISOString());
   //       if (payload.actualityNote) fd.set('actualityNote', payload.actualityNote);

   //       // --- масиви
   //       (payload.advantages || []).forEach((x) => {
   //          const v = String(x || '').trim();
   //          if (v) fd.append('advantages', v);
   //       });

   //       (payload.disadvantages || []).forEach((x) => {
   //          const v = String(x || '').trim();
   //          if (v) fd.append('disadvantages', v);
   //       });

   //       // --- images (File[])
   //       const files = (payload.images || []).filter(Boolean).slice(0, 15);
   //       files.forEach((file) => fd.append('images', file));

   //       // --- запит
   //       const res = await fetch('/api/crm/properties', {
   //          method: 'POST',
   //          body: fd,
   //       });

   //       if (!res.ok) {
   //          const err = await res.text();
   //          throw new Error(err || 'Помилка створення об’єкта');
   //       }

   //       // optional: якщо бек повертає { item }
   //       // const data = await res.json();

   //       setOpenCreate(false);
   //       await load(q); // твоя функція оновлення списку
   //    } catch (e) {
   //       console.error(e);
   //       alert(e?.message || 'Помилка створення');
   //    }
   // };

   const handleCreate = async (payload) => {
      try {
         const fd = new FormData();

         // required мінімум
         fd.set('title', payload.title || '');

         // прості поля
         fd.set('type_estate', payload.type_estate || '');
         fd.set('type_deal', payload.type_deal || '');
         fd.set('location_text', payload.location_text || '');

         fd.set('location.city', payload.location?.city || '');
         fd.set('location.street', payload.location?.street || '');
         fd.set('location.number', payload.location?.number || '');

         // numbers (відправляємо як рядок)
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

         // контакти (поки як у моделі)
         if (payload.leadname) fd.set('leadname', payload.leadname);
         if (payload.phone) fd.set('phone', payload.phone);
         if (payload.email) fd.set('email', payload.email);

         // arrays
         (payload.advantages || []).forEach((x) => {
            const v = String(x || '').trim();
            if (v) fd.append('advantages', v);
         });

         // якщо ти ще не додав disadvantages в UI — просто буде пусто
         (payload.disadvantages || []).forEach((x) => {
            const v = String(x || '').trim();
            if (v) fd.append('disadvantages', v);
         });

         // images files
         (payload.images || []).slice(0, 15).forEach((file) => {
            if (file) fd.append('images', file);
         });

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
                  <PropertyCard property={p} onMore={() => { }} />
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