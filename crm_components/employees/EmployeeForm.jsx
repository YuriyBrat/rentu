'use client';

import { useState } from 'react';
import {
   Box,
   Stack,
   Grid,
   TextField,
   MenuItem,
   Typography,
   Button,
   IconButton,
   Alert,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

const ROLE_OPTIONS = [
   { value: 'owner', label: 'Owner' },
   { value: 'admin', label: 'Admin' },
   { value: 'manager', label: 'Manager' },
   { value: 'realtor', label: 'Realtor' },
   { value: 'callcenter', label: 'Call Center' },
   { value: 'viewer', label: 'Viewer' },
];

const LINK_OPTIONS = [
   'Telegram',
   'Instagram',
   'Facebook',
   'TikTok',
   'LinkedIn',
   'Website',
   'Other',
];

function emptyFields() {
   return {
      name: '',
      phones: [''],
      emails: [''],
      position: '',
      role: 'viewer',
      login: '',
      password: '',
      avatarUrl: '',
      careerStartAt: '',
      firedAt: '',
      isActive: true,
      displayOrder: '',
      color: '',
      about: '',
      links: [{ name: 'Telegram', url: '' }],
      initialNotes: [{ text: '', type: 'info' }],
   };
}

const fieldSx = {
   '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: '#fff',
      minHeight: 44,
      '& input': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
      },
      '& textarea': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
      },
      '& .MuiSelect-select': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
      },
      '& fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
      '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.38)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(168,85,247,0.95)' },
   },
   '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.82) !important',
      fontWeight: 700,
   },
   '& .MuiSelect-icon': {
      color: 'rgba(255,255,255,0.75)',
   },
};

const selectMenuProps = {
   PaperProps: {
      sx: {
         bgcolor: '#151521',
         color: '#fff',
         border: '1px solid rgba(255,255,255,0.08)',
      },
   },
};

export default function EmployeeForm({ onCancel, onCreated }) {
   const [fields, setFields] = useState(() => emptyFields());
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const set = (key, value) => setFields((p) => ({ ...p, [key]: value }));

   const setArrayItem = (key, idx, value) => {
      setFields((p) => {
         const next = [...(p[key] || [''])];
         next[idx] = value;
         return { ...p, [key]: next };
      });
   };

   const addArrayItem = (key, emptyValue = '') => {
      setFields((p) => ({
         ...p,
         [key]: [...(p[key] || []), emptyValue],
      }));
   };

   const removeArrayItem = (key, idx, fallbackValue = '') => {
      setFields((p) => {
         const next = [...(p[key] || [])].filter((_, i) => i !== idx);
         return {
            ...p,
            [key]: next.length ? next : [fallbackValue],
         };
      });
   };

   const setObjectArrayItem = (key, idx, field, value) => {
      setFields((p) => {
         const next = [...(p[key] || [])];
         next[idx] = {
            ...next[idx],
            [field]: value,
         };
         return { ...p, [key]: next };
      });
   };

   const addObjectArrayItem = (key, emptyValue) => {
      setFields((p) => ({
         ...p,
         [key]: [...(p[key] || []), emptyValue],
      }));
   };

   const removeObjectArrayItem = (key, idx, fallbackValue) => {
      setFields((p) => {
         const next = [...(p[key] || [])].filter((_, i) => i !== idx);
         return {
            ...p,
            [key]: next.length ? next : [fallbackValue],
         };
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         const payload = {
            name: fields.name.trim(),
            phones: (fields.phones || []).map((x) => x.trim()).filter(Boolean),
            emails: (fields.emails || []).map((x) => x.trim()).filter(Boolean),
            position: fields.position.trim(),
            role: fields.role,
            login: fields.login.trim(),
            password: fields.password.trim(),
            avatarUrl: fields.avatarUrl.trim(),
            careerStartAt: fields.careerStartAt || undefined,
            firedAt: fields.firedAt || undefined,
            isActive: !!fields.isActive,
            displayOrder:
               fields.displayOrder !== '' ? Number(fields.displayOrder) : undefined,
            color: fields.color.trim(),
            about: fields.about.trim(),
            links: (fields.links || [])
               .map((x) => ({
                  name: String(x?.name || '').trim(),
                  url: String(x?.url || '').trim(),
               }))
               .filter((x) => x.name || x.url),
            notes: (fields.initialNotes || [])
               .map((x) => ({
                  text: String(x?.text || '').trim(),
                  type: x?.type || 'info',
                  createdAt: new Date().toISOString(),
               }))
               .filter((x) => x.text),
         };

         const res = await fetch('/api/crm/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data?.error || 'Помилка створення працівника');
         }

         onCreated?.(data.item);
         setFields(emptyFields());
      } catch (err) {
         setError(err?.message || 'Помилка створення');
      } finally {
         setLoading(false);
      }
   };

   return (
      <Box component="form" onSubmit={handleSubmit}>
         <Stack spacing={1.4}>
            {!!error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={1.2}>
               <Grid item xs={12} md={4}>
                  <TextField
                     label="Ім’я"
                     value={fields.name}
                     onChange={(e) => set('name', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField
                     label="Посада"
                     value={fields.position}
                     onChange={(e) => set('position', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField
                     select
                     label="CRM роль"
                     value={fields.role}
                     onChange={(e) => set('role', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     SelectProps={{ MenuProps: selectMenuProps }}
                  >
                     {ROLE_OPTIONS.map((x) => (
                        <MenuItem key={x.value} value={x.value}>
                           {x.label}
                        </MenuItem>
                     ))}
                  </TextField>
               </Grid>

               <Grid item xs={12} md={2}>
                  <TextField
                     label="Порядок"
                     value={fields.displayOrder}
                     onChange={(e) => set('displayOrder', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     label="Login"
                     value={fields.login}
                     onChange={(e) => set('login', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     label="Пароль"
                     type="password"
                     value={fields.password}
                     onChange={(e) => set('password', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     label="Колір"
                     placeholder="#a78bfa"
                     value={fields.color}
                     onChange={(e) => set('color', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12}>
                  <TextField
                     label="Коротко про працівника"
                     value={fields.about}
                     onChange={(e) => set('about', e.target.value)}
                     fullWidth
                     multiline
                     minRows={2}
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     label="Avatar URL"
                     value={fields.avatarUrl}
                     onChange={(e) => set('avatarUrl', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     type="datetime-local"
                     label="Початок кар’єри"
                     value={fields.careerStartAt}
                     onChange={(e) => set('careerStartAt', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     InputLabelProps={{ shrink: true }}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     type="datetime-local"
                     label="Дата звільнення"
                     value={fields.firedAt}
                     onChange={(e) => set('firedAt', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     InputLabelProps={{ shrink: true }}
                  />
               </Grid>

               <Grid item xs={12}>
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                     Телефони
                  </Typography>

                  <Stack spacing={1} sx={{ mt: 0.8 }}>
                     {(fields.phones || ['']).map((phone, idx) => (
                        <Stack key={idx} direction="row" spacing={1}>
                           <TextField
                              label={idx === 0 ? 'Телефон' : `Телефон ${idx + 1}`}
                              value={phone}
                              onChange={(e) => setArrayItem('phones', idx, e.target.value)}
                              fullWidth
                              sx={fieldSx}
                           />
                           <IconButton
                              onClick={() =>
                                 idx === 0
                                    ? addArrayItem('phones', '')
                                    : removeArrayItem('phones', idx, '')
                              }
                              sx={{
                                 alignSelf: 'center',
                                 color: '#fff',
                                 border: '1px solid rgba(255,255,255,0.10)',
                                 borderRadius: 2.5,
                              }}
                           >
                              {idx === 0 ? <AddRoundedIcon /> : <DeleteOutlineRoundedIcon />}
                           </IconButton>
                        </Stack>
                     ))}
                  </Stack>
               </Grid>

               <Grid item xs={12}>
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                     Email
                  </Typography>

                  <Stack spacing={1} sx={{ mt: 0.8 }}>
                     {(fields.emails || ['']).map((email, idx) => (
                        <Stack key={idx} direction="row" spacing={1}>
                           <TextField
                              label={idx === 0 ? 'Email' : `Email ${idx + 1}`}
                              value={email}
                              onChange={(e) => setArrayItem('emails', idx, e.target.value)}
                              fullWidth
                              sx={fieldSx}
                           />
                           <IconButton
                              onClick={() =>
                                 idx === 0
                                    ? addArrayItem('emails', '')
                                    : removeArrayItem('emails', idx, '')
                              }
                              sx={{
                                 alignSelf: 'center',
                                 color: '#fff',
                                 border: '1px solid rgba(255,255,255,0.10)',
                                 borderRadius: 2.5,
                              }}
                           >
                              {idx === 0 ? <AddRoundedIcon /> : <DeleteOutlineRoundedIcon />}
                           </IconButton>
                        </Stack>
                     ))}
                  </Stack>
               </Grid>

               <Grid item xs={12}>
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                     Посилання
                  </Typography>

                  <Stack spacing={1} sx={{ mt: 0.8 }}>
                     {(fields.links || [{ name: 'Telegram', url: '' }]).map((link, idx) => (
                        <Grid container spacing={1} key={idx}>
                           <Grid item xs={12} md={3}>
                              <TextField
                                 select
                                 label="Назва"
                                 value={link.name}
                                 onChange={(e) =>
                                    setObjectArrayItem('links', idx, 'name', e.target.value)
                                 }
                                 fullWidth
                                 sx={fieldSx}
                                 SelectProps={{ MenuProps: selectMenuProps }}
                              >
                                 {LINK_OPTIONS.map((x) => (
                                    <MenuItem key={x} value={x}>
                                       {x}
                                    </MenuItem>
                                 ))}
                              </TextField>
                           </Grid>

                           <Grid item xs={10} md={8}>
                              <TextField
                                 label="URL"
                                 value={link.url}
                                 onChange={(e) =>
                                    setObjectArrayItem('links', idx, 'url', e.target.value)
                                 }
                                 fullWidth
                                 sx={fieldSx}
                              />
                           </Grid>

                           <Grid item xs={2} md={1}>
                              <IconButton
                                 onClick={() =>
                                    idx === 0
                                       ? addObjectArrayItem('links', { name: 'Telegram', url: '' })
                                       : removeObjectArrayItem('links', idx, {
                                          name: 'Telegram',
                                          url: '',
                                       })
                                 }
                                 sx={{
                                    mt: { xs: 0, md: 0.4 },
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.10)',
                                    borderRadius: 2.5,
                                 }}
                              >
                                 {idx === 0 ? <AddRoundedIcon /> : <DeleteOutlineRoundedIcon />}
                              </IconButton>
                           </Grid>
                        </Grid>
                     ))}
                  </Stack>
               </Grid>

               <Grid item xs={12}>
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                     Початкові нотатки
                  </Typography>

                  <Stack spacing={1} sx={{ mt: 0.8 }}>
                     {(fields.initialNotes || [{ text: '', type: 'info' }]).map((note, idx) => (
                        <Grid container spacing={1} key={idx}>
                           <Grid item xs={12} md={8}>
                              <TextField
                                 label={idx === 0 ? 'Нотатка' : `Нотатка ${idx + 1}`}
                                 value={note.text}
                                 onChange={(e) =>
                                    setObjectArrayItem('initialNotes', idx, 'text', e.target.value)
                                 }
                                 fullWidth
                                 multiline
                                 minRows={2}
                                 sx={fieldSx}
                              />
                           </Grid>

                           <Grid item xs={10} md={3}>
                              <TextField
                                 select
                                 label="Тип"
                                 value={note.type}
                                 onChange={(e) =>
                                    setObjectArrayItem('initialNotes', idx, 'type', e.target.value)
                                 }
                                 fullWidth
                                 sx={fieldSx}
                                 SelectProps={{ MenuProps: selectMenuProps }}
                              >
                                 <MenuItem value="positive">Позитивна</MenuItem>
                                 <MenuItem value="negative">Негативна</MenuItem>
                                 <MenuItem value="info">Інформуюча</MenuItem>
                                 <MenuItem value="important">Важлива</MenuItem>
                              </TextField>
                           </Grid>

                           <Grid item xs={2} md={1}>
                              <IconButton
                                 onClick={() =>
                                    idx === 0
                                       ? addObjectArrayItem('initialNotes', {
                                          text: '',
                                          type: 'info',
                                       })
                                       : removeObjectArrayItem('initialNotes', idx, {
                                          text: '',
                                          type: 'info',
                                       })
                                 }
                                 sx={{
                                    mt: { xs: 0, md: 0.4 },
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.10)',
                                    borderRadius: 2.5,
                                 }}
                              >
                                 {idx === 0 ? <AddRoundedIcon /> : <DeleteOutlineRoundedIcon />}
                              </IconButton>
                           </Grid>
                        </Grid>
                     ))}
                  </Stack>
               </Grid>
            </Grid>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
               <Button
                  onClick={onCancel}
                  sx={{
                     borderRadius: 3,
                     color: 'rgba(255,255,255,0.76)',
                     border: '1px solid rgba(255,255,255,0.10)',
                  }}
               >
                  Скасувати
               </Button>

               <Button
                  type="submit"
                  disabled={loading}
                  sx={{
                     borderRadius: 3,
                     fontWeight: 900,
                     color: '#111',
                     background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                  }}
               >
                  {loading ? 'Збереження...' : 'Створити працівника'}
               </Button>
            </Stack>
         </Stack>
      </Box>
   );
}