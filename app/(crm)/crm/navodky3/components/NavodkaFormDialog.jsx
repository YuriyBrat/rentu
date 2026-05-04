'use client';

import { useMemo, useState } from 'react';
import {
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Button,
   Grid,
   TextField,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   Stack,
   Typography,
   IconButton,
   Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const NAVODKA_STATUSES = [
   { value: 'active', label: 'Активна' },
   { value: 'contact', label: 'На контакті' },
   { value: 'waiting', label: 'Чекати' },
   { value: 'converted', label: 'Конвертована' },
   { value: 'lost', label: 'Втрачена' }
];

const NAVODKA_READINESS = [
   { value: 'soon', label: 'До 1 місяця' },
   { value: 'q1', label: '1-3 місяці' },
   { value: 'q2', label: '3-6 місяців' },
   { value: 'later', label: '6+ місяців' },
   { value: 'unknown', label: 'Невідомо' }
];

const initialForm = {
   title: '',
   ownerName: '',
   phone: '',
   source: '',
   status: 'active',
   readiness: 'unknown',
   propertyType: '',
   locationText: '',
   priceExpectation: '',
   description: '',
   lastContactAt: '',
   nextContactAt: ''
};

const inputSx = {
   '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      bgcolor: 'rgba(255,255,255,0.04)',
      color: '#f8fafc',
      '& fieldset': {
         borderColor: 'rgba(255,255,255,0.08)'
      },
      '&:hover fieldset': {
         borderColor: 'rgba(255,255,255,0.16)'
      },
      '&.Mui-focused fieldset': {
         borderColor: 'primary.main'
      }
   },
   '& .MuiInputLabel-root': {
      color: '#94a3b8'
   },
   '& .MuiInputBase-input': {
      color: '#f8fafc'
   },
   '& .MuiInputBase-input::placeholder': {
      color: '#64748b',
      opacity: 1
   }
};

export default function NavodkaFormDialog({ open, onClose, onCreated }) {
   const [form, setForm] = useState(initialForm);
   const [loading, setLoading] = useState(false);

   const canSubmit = useMemo(() => {
      return form.title.trim() && form.ownerName.trim() && form.phone.trim();
   }, [form]);

   const handleChange = (field, value) => {
      setForm(prev => ({ ...prev, [field]: value }));
   };

   const handleClose = () => {
      if (loading) return;
      onClose?.();
   };

   const handleSubmit = async () => {
      if (!canSubmit) return;

      try {
         setLoading(true);

         const payload = {
            ...form,
            lastContactAt: form.lastContactAt || null,
            nextContactAt: form.nextContactAt || null
         };

         const res = await fetch('/api/crm/navodky', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data?.error || 'Не вдалося створити наводку');
         }

         setForm(initialForm);
         onCreated?.(data);
         onClose?.();
      } catch (error) {
         console.error(error);
         alert(error.message || 'Помилка створення');
      } finally {
         setLoading(false);
      }
   };

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         fullWidth
         maxWidth="md"
         PaperProps={{
            sx: {
               bgcolor: '#111827',
               color: '#f8fafc',
               borderRadius: 4,
               border: '1px solid rgba(255,255,255,0.07)',
               boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
               backgroundImage: 'none'
            }
         }}
      >
         <DialogTitle sx={{ p: 0 }}>
            <Stack
               direction="row"
               alignItems="center"
               justifyContent="space-between"
               sx={{
                  px: 2.2,
                  py: 1.8,
                  borderBottom: '1px solid rgba(255,255,255,0.08)'
               }}
            >
               <Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#f8fafc' }}>
                     Нова наводка
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#94a3b8', mt: 0.4 }}>
                     Додай контакт власника і коротку суть, щоб не загубити майбутній об’єкт
                  </Typography>
               </Box>

               <IconButton
                  onClick={handleClose}
                  disabled={loading}
                  sx={{
                     color: '#cbd5e1',
                     bgcolor: 'rgba(255,255,255,0.05)',
                     '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
               >
                  <CloseIcon />
               </IconButton>
            </Stack>
         </DialogTitle>

         <DialogContent sx={{ p: 2.2 }}>
            <Grid container spacing={1.6} sx={{ mt: 0.2 }}>
               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Назва"
                     placeholder="2к квартира, Сихів"
                     value={form.title}
                     onChange={e => handleChange('title', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Власник"
                     placeholder="Іван"
                     value={form.ownerName}
                     onChange={e => handleChange('ownerName', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Телефон"
                     placeholder="+380..."
                     value={form.phone}
                     onChange={e => handleChange('phone', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Джерело"
                     placeholder="Розклейка, рекомендація, дзвінок..."
                     value={form.source}
                     onChange={e => handleChange('source', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={inputSx}>
                     <InputLabel>Статус</InputLabel>
                     <Select
                        value={form.status}
                        label="Статус"
                        onChange={e => handleChange('status', e.target.value)}
                        MenuProps={{
                           PaperProps: {
                              sx: {
                                 bgcolor: '#0f172a',
                                 color: '#f8fafc',
                                 border: '1px solid rgba(255,255,255,0.08)'
                              }
                           }
                        }}
                     >
                        {NAVODKA_STATUSES.map(item => (
                           <MenuItem key={item.value} value={item.value}>
                              {item.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>

               <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={inputSx}>
                     <InputLabel>Готовність</InputLabel>
                     <Select
                        value={form.readiness}
                        label="Готовність"
                        onChange={e => handleChange('readiness', e.target.value)}
                        MenuProps={{
                           PaperProps: {
                              sx: {
                                 bgcolor: '#0f172a',
                                 color: '#f8fafc',
                                 border: '1px solid rgba(255,255,255,0.08)'
                              }
                           }
                        }}
                     >
                        {NAVODKA_READINESS.map(item => (
                           <MenuItem key={item.value} value={item.value}>
                              {item.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Тип нерухомості"
                     placeholder="Квартира, будинок..."
                     value={form.propertyType}
                     onChange={e => handleChange('propertyType', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Локація"
                     placeholder="Львів, Сихів"
                     value={form.locationText}
                     onChange={e => handleChange('locationText', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Очікувана ціна"
                     placeholder="72 000$"
                     value={form.priceExpectation}
                     onChange={e => handleChange('priceExpectation', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField
                     fullWidth
                     label="Останній контакт"
                     type="date"
                     InputLabelProps={{ shrink: true }}
                     value={form.lastContactAt}
                     onChange={e => handleChange('lastContactAt', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField
                     fullWidth
                     label="Наступний контакт"
                     type="date"
                     InputLabelProps={{ shrink: true }}
                     value={form.nextContactAt}
                     onChange={e => handleChange('nextContactAt', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     multiline
                     minRows={4}
                     label="Опис / коментар"
                     placeholder="Наприклад: хоче продавати ближче до осені, просив передзвонити через 2 тижні..."
                     value={form.description}
                     onChange={e => handleChange('description', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>
            </Grid>
         </DialogContent>

         <DialogActions
            sx={{
               px: 2.2,
               py: 1.6,
               borderTop: '1px solid rgba(255,255,255,0.08)'
            }}
         >
            <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
               <Button
                  onClick={handleClose}
                  disabled={loading}
                  sx={{
                     borderRadius: 2.5,
                     color: '#cbd5e1',
                     borderColor: 'rgba(255,255,255,0.12)'
                  }}
                  variant="outlined"
               >
                  Скасувати
               </Button>

               <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !canSubmit}
                  sx={{
                     borderRadius: 2.5,
                     px: 2.4,
                     fontWeight: 800
                  }}
               >
                  {loading ? 'Створення...' : 'Створити'}
               </Button>
            </Stack>
         </DialogActions>
      </Dialog>
   );
}