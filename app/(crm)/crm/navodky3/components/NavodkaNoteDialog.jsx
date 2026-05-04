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

const NOTE_TYPES = [
   { value: 'positive', label: 'Позитивна' },
   { value: 'negative', label: 'Негативна' },
   { value: 'info', label: 'Інформуюча' },
   { value: 'important', label: 'Важлива' }
];

const ACTIVITY_TYPES = [
   { value: 'note', label: 'Проста нотатка' },
   { value: 'call', label: 'Дзвінок' },
   { value: 'message', label: 'Переписка' },
   { value: 'meeting', label: 'Зустріч' }
];

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

export default function NavodkaNoteDialog({ open, onClose, item, onCreated }) {
   const [form, setForm] = useState({
      text: '',
      type: 'info',
      activityType: 'note',
      contactDate: '',
      nextContactAt: ''
   });
   const [loading, setLoading] = useState(false);

   const canSubmit = useMemo(() => form.text.trim(), [form.text]);

   const handleChange = (field, value) => {
      setForm(prev => ({ ...prev, [field]: value }));
   };

   const handleClose = () => {
      if (loading) return;
      onClose?.();
   };

   const handleSubmit = async () => {
      if (!item?._id || !canSubmit) return;

      try {
         setLoading(true);

         const payload = {
            newNote: {
               text: form.text,
               type: form.type,
               activityType: form.activityType,
               contactDate: form.contactDate || null,
               nextContactAt: form.nextContactAt || null
            }
         };

         const res = await fetch(`/api/crm/navodky/${item._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data?.error || 'Не вдалося додати запис');
         }

         setForm({
            text: '',
            type: 'info',
            activityType: 'note',
            contactDate: '',
            nextContactAt: ''
         });

         onCreated?.(data);
         onClose?.();
      } catch (error) {
         console.error(error);
         alert(error.message || 'Помилка додавання запису');
      } finally {
         setLoading(false);
      }
   };

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         fullWidth
         maxWidth="sm"
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
                     Додати запис
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#94a3b8', mt: 0.4 }}>
                     {item?.title || 'Наводка'}
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
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     multiline
                     minRows={4}
                     label="Текст"
                     placeholder="Що відбулося, що сказав власник, що важливо пам’ятати..."
                     value={form.text}
                     onChange={e => handleChange('text', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={inputSx}>
                     <InputLabel>Тип нотатки</InputLabel>
                     <Select
                        value={form.type}
                        label="Тип нотатки"
                        onChange={e => handleChange('type', e.target.value)}
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
                        {NOTE_TYPES.map(item => (
                           <MenuItem key={item.value} value={item.value}>
                              {item.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>

               <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={inputSx}>
                     <InputLabel>Тип запису</InputLabel>
                     <Select
                        value={form.activityType}
                        label="Тип запису"
                        onChange={e => handleChange('activityType', e.target.value)}
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
                        {ACTIVITY_TYPES.map(item => (
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
                     label="Дата контакту"
                     type="date"
                     InputLabelProps={{ shrink: true }}
                     value={form.contactDate}
                     onChange={e => handleChange('contactDate', e.target.value)}
                     sx={inputSx}
                  />
               </Grid>

               <Grid item xs={12} md={6}>
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
                  variant="outlined"
                  sx={{
                     borderRadius: 2.5,
                     color: '#cbd5e1',
                     borderColor: 'rgba(255,255,255,0.12)'
                  }}
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
                  {loading ? 'Збереження...' : 'Зберегти'}
               </Button>
            </Stack>
         </DialogActions>
      </Dialog>
   );
}