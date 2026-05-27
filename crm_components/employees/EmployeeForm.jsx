'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Alert,
   Box,
   Button,
   Checkbox,
   FormControlLabel,
   Grid,
   IconButton,
   InputAdornment,
   MenuItem,
   Stack,
   Switch,
   TextField,
   Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

const ROLE_OPTIONS = [
   { value: 'owner', label: 'Власник' },
   { value: 'admin', label: 'Адміністратор' },
   { value: 'manager', label: 'Менеджер' },
   { value: 'realtor', label: 'Рієлтор' },
   { value: 'callcenter', label: 'Кол-центр' },
   { value: 'viewer', label: 'Перегляд' },
];

const LINK_OPTIONS = ['Telegram', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Сайт', 'Інше'];

const PHONE_TYPE_OPTIONS = [
   { value: 'personal', label: 'Особистий' },
   { value: 'work', label: 'Робочий' },
   { value: 'other', label: 'Інший' },
];

function emptyPhone(idx = 0) {
   return {
      number: '',
      type: idx === 0 ? 'personal' : 'work',
      note: '',
      showInPortfolio: idx === 0,
      isPrimary: idx === 0,
   };
}

function normalizePhone(phone, idx = 0) {
   if (typeof phone === 'string') {
      return {
         ...emptyPhone(idx),
         number: phone,
      };
   }

   return {
      ...emptyPhone(idx),
      number: phone?.number || phone?.value || '',
      type: ['personal', 'work', 'other'].includes(phone?.type) ? phone.type : (idx === 0 ? 'personal' : 'work'),
      note: phone?.note || '',
      showInPortfolio: !!phone?.showInPortfolio,
      isPrimary: !!phone?.isPrimary,
   };
}

function toDateInput(value) {
   if (!value) return '';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '';
   return d.toISOString().slice(0, 16);
}

function emptyFields() {
   return {
      name: '',
      phones: [emptyPhone(0)],
      emails: [''],
      position: '',
      role: 'viewer',
      manager: '',
      login: '',
      password: '',
      avatarUrl: '',
      avatarPublicId: '',
      careerStartAt: '',
      firedAt: '',
      isActive: true,
      displayOrder: '',
      color: '',
      about: '',
      photos: [],
      livePhoto: null,
      links: [{ name: 'Telegram', url: '' }],
      initialNotes: [{ text: '', type: 'info' }],
   };
}

function normalizeFields(initialData) {
   if (!initialData) return emptyFields();

   return {
      name: initialData.name || '',
      phones: initialData.phones?.length ? initialData.phones.map(normalizePhone) : [emptyPhone(0)],
      emails: initialData.emails?.length ? initialData.emails : [''],
      position: initialData.position || '',
      role: initialData.role || 'viewer',
      manager: initialData.manager?._id || initialData.manager || '',
      login: initialData.login || '',
      password: '',
      avatarUrl: initialData.avatarUrl || '',
      avatarPublicId: initialData.avatarPublicId || '',
      careerStartAt: toDateInput(initialData.careerStartAt),
      firedAt: toDateInput(initialData.firedAt),
      isActive: initialData.isActive !== false,
      displayOrder: initialData.displayOrder ?? '',
      color: initialData.color || '',
      about: initialData.about || '',
      photos: Array.isArray(initialData.photos) ? initialData.photos : [],
      livePhoto: initialData.livePhoto || null,
      links: initialData.links?.length ? initialData.links : [{ name: 'Telegram', url: '' }],
      initialNotes: initialData.notes?.length ? initialData.notes : [{ text: '', type: 'info' }],
   };
}

const fieldSx = {
   '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: '#fff',
      minHeight: 44,
      '& input': { color: '#fff !important', WebkitTextFillColor: '#fff' },
      '& textarea': { color: '#fff !important', WebkitTextFillColor: '#fff' },
      '& .MuiSelect-select': { color: '#fff !important', WebkitTextFillColor: '#fff' },
      '& fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
      '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.38)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(168,85,247,0.95)' },
   },
   '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.82) !important',
      fontWeight: 700,
   },
   '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.75)' },
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

export default function EmployeeForm({ onCancel, onCreated, initialData = null, employees = [] }) {
   const [fields, setFields] = useState(() => normalizeFields(initialData));
   const [photoFiles, setPhotoFiles] = useState([]);
   const [livePhotoFiles, setLivePhotoFiles] = useState([]);
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const isEdit = !!initialData?._id;

   useEffect(() => {
      setFields(normalizeFields(initialData));
      setPhotoFiles([]);
      setLivePhotoFiles([]);
      setShowPassword(false);
   }, [initialData]);

   const managerOptions = useMemo(() => {
      const currentId = String(initialData?._id || '');
      return (employees || []).filter((employee) => String(employee?._id || '') !== currentId);
   }, [employees, initialData?._id]);

   const set = (key, value) => setFields((p) => ({ ...p, [key]: value }));

   const setArrayItem = (key, idx, value) => {
      setFields((p) => {
         const next = [...(p[key] || [''])];
         next[idx] = value;
         return { ...p, [key]: next };
      });
   };

   const addArrayItem = (key, emptyValue = '') => {
      setFields((p) => ({ ...p, [key]: [...(p[key] || []), emptyValue] }));
   };

   const removeArrayItem = (key, idx, fallbackValue = '') => {
      setFields((p) => {
         const next = [...(p[key] || [])].filter((_, i) => i !== idx);
         return { ...p, [key]: next.length ? next : [fallbackValue] };
      });
   };

   const setPhoneField = (idx, field, value) => {
      setFields((p) => {
         const phones = [...(p.phones || [emptyPhone(0)])].map(normalizePhone);
         phones[idx] = {
            ...normalizePhone(phones[idx], idx),
            [field]: value,
         };

         if (field === 'isPrimary' && value) {
            phones.forEach((phone, phoneIdx) => {
               phone.isPrimary = phoneIdx === idx;
            });
         }

         return { ...p, phones };
      });
   };

   const addPhone = () => {
      setFields((p) => ({
         ...p,
         phones: [...(p.phones || []), emptyPhone((p.phones || []).length)],
      }));
   };

   const removePhone = (idx) => {
      setFields((p) => {
         const phones = [...(p.phones || [])].filter((_, i) => i !== idx).map(normalizePhone);
         const nextPhones = phones.length ? phones : [emptyPhone(0)];
         if (!nextPhones.some((phone) => phone.isPrimary)) {
            nextPhones[0].isPrimary = true;
         }
         return { ...p, phones: nextPhones };
      });
   };

   const setObjectArrayItem = (key, idx, field, value) => {
      setFields((p) => {
         const next = [...(p[key] || [])];
         next[idx] = { ...next[idx], [field]: value };
         return { ...p, [key]: next };
      });
   };

   const addObjectArrayItem = (key, emptyValue) => {
      setFields((p) => ({ ...p, [key]: [...(p[key] || []), emptyValue] }));
   };

   const removeObjectArrayItem = (key, idx, fallbackValue) => {
      setFields((p) => {
         const next = [...(p[key] || [])].filter((_, i) => i !== idx);
         return { ...p, [key]: next.length ? next : [fallbackValue] };
      });
   };

   const uploadEmployeeFiles = async (employeeId, files, kind) => {
      if (!employeeId || !files.length) return;

      const fd = new FormData();
      fd.append('employeeId', employeeId);
      fd.append('kind', kind);
      files.forEach((file) => fd.append('files', file));

      const res = await fetch('/api/crm/employees/photos', {
         method: 'POST',
         body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Не вдалося завантажити фото');
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         const payload = {
            _id: initialData?._id,
            name: fields.name.trim(),
            phones: (fields.phones || [])
               .map((x, idx) => normalizePhone(x, idx))
               .map((x) => ({
                  ...x,
                  number: String(x.number || '').trim(),
                  note: String(x.note || '').trim(),
               }))
               .filter((x) => x.number),
            emails: (fields.emails || []).map((x) => x.trim()).filter(Boolean),
            position: fields.position.trim(),
            role: fields.role,
            manager: fields.manager || null,
            login: fields.login.trim(),
            password: fields.password.trim(),
            avatarUrl: fields.avatarUrl.trim(),
            avatarPublicId: fields.avatarPublicId || '',
            careerStartAt: fields.careerStartAt || undefined,
            firedAt: fields.firedAt || undefined,
            isActive: !!fields.isActive,
            displayOrder: fields.displayOrder !== '' ? Number(fields.displayOrder) : undefined,
            color: fields.color.trim(),
            about: fields.about.trim(),
            photos: fields.photos || [],
            livePhoto: fields.livePhoto || undefined,
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
                  createdAt: x?.createdAt || new Date().toISOString(),
                  createdByName: x?.createdByName || '',
               }))
               .filter((x) => x.text),
         };

         const res = await fetch('/api/crm/employees', {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data?.error || 'Не вдалося зберегти працівника');

         const employeeId = data?.item?._id;
         await uploadEmployeeFiles(employeeId, photoFiles, 'photo');
         await uploadEmployeeFiles(employeeId, livePhotoFiles.slice(0, 1), 'live');

         onCreated?.(data.item);
         setFields(emptyFields());
      } catch (err) {
         setError(err?.message || 'Не вдалося зберегти працівника');
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
                  <TextField label="Ім'я" value={fields.name} onChange={(e) => set('name', e.target.value)} fullWidth sx={fieldSx} />
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField label="Посада" value={fields.position} onChange={(e) => set('position', e.target.value)} fullWidth sx={fieldSx} />
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField select label="CRM роль" value={fields.role} onChange={(e) => set('role', e.target.value)} fullWidth sx={fieldSx} SelectProps={{ MenuProps: selectMenuProps }}>
                     {ROLE_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                  </TextField>
               </Grid>

               <Grid item xs={12} md={2}>
                  <TextField label="Порядок" value={fields.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} fullWidth sx={fieldSx} />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField select label="Керівник" value={fields.manager} onChange={(e) => set('manager', e.target.value)} fullWidth sx={fieldSx} SelectProps={{ MenuProps: selectMenuProps }}>
                     <MenuItem value="">Без керівника</MenuItem>
                     {managerOptions.map((employee) => <MenuItem key={employee._id} value={employee._id}>{employee.name}</MenuItem>)}
                  </TextField>
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField label="Логін" value={fields.login} onChange={(e) => set('login', e.target.value)} fullWidth sx={fieldSx} />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     label={isEdit ? 'Новий пароль' : 'Пароль'}
                     type={showPassword ? 'text' : 'password'}
                     value={fields.password}
                     onChange={(e) => set('password', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     InputProps={{
                        endAdornment: (
                           <InputAdornment position="end">
                              <IconButton
                                 aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                                 onClick={() => setShowPassword((value) => !value)}
                                 onMouseDown={(e) => e.preventDefault()}
                                 edge="end"
                                 sx={{ color: 'rgba(255,255,255,0.72)' }}
                              >
                                 {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                              </IconButton>
                           </InputAdornment>
                        ),
                     }}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField label="Колір" placeholder="#a78bfa" value={fields.color} onChange={(e) => set('color', e.target.value)} fullWidth sx={fieldSx} />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField label="URL аватара" value={fields.avatarUrl} onChange={(e) => set('avatarUrl', e.target.value)} fullWidth sx={fieldSx} />
               </Grid>

               <Grid item xs={12} md={4}>
                  <FormControlLabel
                     control={<Switch checked={!!fields.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
                     label="Активний"
                     sx={{ color: '#fff', height: '100%' }}
                  />
               </Grid>

               <Grid item xs={12}>
                  <TextField label="Про працівника" value={fields.about} onChange={(e) => set('about', e.target.value)} fullWidth multiline minRows={2} sx={fieldSx} />
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField type="datetime-local" label="Початок роботи" value={fields.careerStartAt} onChange={(e) => set('careerStartAt', e.target.value)} fullWidth sx={fieldSx} InputLabelProps={{ shrink: true }} />
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField type="datetime-local" label="Дата звільнення" value={fields.firedAt} onChange={(e) => set('firedAt', e.target.value)} fullWidth sx={fieldSx} InputLabelProps={{ shrink: true }} />
               </Grid>

               <Grid item xs={12}>
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>Фото</Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 0.8 }}>
                     <Button component="label" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 3, color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}>
                        Додати фото
                        <input hidden multiple accept="image/*" type="file" onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))} />
                     </Button>
                     <Button component="label" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 3, color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}>
                        Live фото / GIF
                        <input hidden accept="image/gif,image/*" type="file" onChange={(e) => setLivePhotoFiles(Array.from(e.target.files || []).slice(0, 1))} />
                     </Button>
                     <Typography sx={{ color: 'rgba(255,255,255,0.62)', alignSelf: 'center', fontSize: 13 }}>
                        {photoFiles.length ? `Фото: ${photoFiles.length}` : ''}
                        {livePhotoFiles.length ? ` Live: ${livePhotoFiles[0].name}` : ''}
                     </Typography>
                  </Stack>
               </Grid>

               <Grid item xs={12}>
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>Телефони</Typography>
                  <Stack spacing={1} sx={{ mt: 0.8 }}>
                     {(fields.phones || [emptyPhone(0)]).map((rawPhone, idx) => {
                        const phone = normalizePhone(rawPhone, idx);
                        return (
                        <Box
                           key={idx}
                           sx={{
                              p: 1,
                              borderRadius: 2.5,
                              border: '1px solid rgba(255,255,255,0.10)',
                              bgcolor: 'rgba(255,255,255,0.025)',
                           }}
                        >
                           <Grid container spacing={1} alignItems="center">
                              <Grid item xs={12} md={3.5}>
                                 <TextField label={idx === 0 ? 'Телефон' : `Телефон ${idx + 1}`} value={phone.number} onChange={(e) => setPhoneField(idx, 'number', e.target.value)} fullWidth sx={fieldSx} />
                              </Grid>
                              <Grid item xs={12} md={2.2}>
                                 <TextField select label="Тип" value={phone.type} onChange={(e) => setPhoneField(idx, 'type', e.target.value)} fullWidth sx={fieldSx} SelectProps={{ MenuProps: selectMenuProps }}>
                                    {PHONE_TYPE_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                                 </TextField>
                              </Grid>
                              <Grid item xs={12} md={3.5}>
                                 <TextField label="Нотатка до телефону" value={phone.note} onChange={(e) => setPhoneField(idx, 'note', e.target.value)} fullWidth sx={fieldSx} placeholder="Напр. тест OLX, робочий, для реклами" />
                              </Grid>
                              <Grid item xs={12} md={2}>
                                 <Stack spacing={0} sx={{ color: '#fff' }}>
                                    <FormControlLabel control={<Checkbox checked={!!phone.showInPortfolio} onChange={(e) => setPhoneField(idx, 'showInPortfolio', e.target.checked)} />} label="Портфоліо" />
                                    <FormControlLabel control={<Checkbox checked={!!phone.isPrimary} onChange={(e) => setPhoneField(idx, 'isPrimary', e.target.checked)} />} label="Головний" />
                                 </Stack>
                              </Grid>
                              <Grid item xs={12} md={0.8}>
                                 <IconButton onClick={() => idx === 0 ? addPhone() : removePhone(idx)} sx={{ color: '#fff', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2.5 }}>
                                    {idx === 0 ? <AddRoundedIcon /> : <DeleteOutlineRoundedIcon />}
                                 </IconButton>
                              </Grid>
                           </Grid>
                        </Box>
                        );
                     })}
                  </Stack>
               </Grid>

               <Grid item xs={12}>
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>Email</Typography>
                  <Stack spacing={1} sx={{ mt: 0.8 }}>
                     {(fields.emails || ['']).map((email, idx) => (
                        <Stack key={idx} direction="row" spacing={1}>
                           <TextField label={idx === 0 ? 'Email' : `Email ${idx + 1}`} value={email} onChange={(e) => setArrayItem('emails', idx, e.target.value)} fullWidth sx={fieldSx} />
                           <IconButton onClick={() => idx === 0 ? addArrayItem('emails', '') : removeArrayItem('emails', idx, '')} sx={{ alignSelf: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2.5 }}>
                              {idx === 0 ? <AddRoundedIcon /> : <DeleteOutlineRoundedIcon />}
                           </IconButton>
                        </Stack>
                     ))}
                  </Stack>
               </Grid>

               <Grid item xs={12}>
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>Посилання</Typography>
                  <Stack spacing={1} sx={{ mt: 0.8 }}>
                     {(fields.links || [{ name: 'Telegram', url: '' }]).map((link, idx) => (
                        <Grid container spacing={1} key={idx}>
                           <Grid item xs={12} md={3}>
                              <TextField select label="Назва" value={link.name} onChange={(e) => setObjectArrayItem('links', idx, 'name', e.target.value)} fullWidth sx={fieldSx} SelectProps={{ MenuProps: selectMenuProps }}>
                                 {LINK_OPTIONS.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                              </TextField>
                           </Grid>
                           <Grid item xs={10} md={8}>
                              <TextField label="URL" value={link.url} onChange={(e) => setObjectArrayItem('links', idx, 'url', e.target.value)} fullWidth sx={fieldSx} />
                           </Grid>
                           <Grid item xs={2} md={1}>
                              <IconButton onClick={() => idx === 0 ? addObjectArrayItem('links', { name: 'Telegram', url: '' }) : removeObjectArrayItem('links', idx, { name: 'Telegram', url: '' })} sx={{ mt: { xs: 0, md: 0.4 }, color: '#fff', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2.5 }}>
                                 {idx === 0 ? <AddRoundedIcon /> : <DeleteOutlineRoundedIcon />}
                              </IconButton>
                           </Grid>
                        </Grid>
                     ))}
                  </Stack>
               </Grid>

               <Grid item xs={12}>
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>Нотатки</Typography>
                  <Stack spacing={1} sx={{ mt: 0.8 }}>
                     {(fields.initialNotes || [{ text: '', type: 'info' }]).map((note, idx) => (
                        <Grid container spacing={1} key={idx}>
                           <Grid item xs={12} md={8}>
                              <TextField label={idx === 0 ? 'Нотатка' : `Нотатка ${idx + 1}`} value={note.text} onChange={(e) => setObjectArrayItem('initialNotes', idx, 'text', e.target.value)} fullWidth multiline minRows={2} sx={fieldSx} />
                           </Grid>
                           <Grid item xs={10} md={3}>
                              <TextField select label="Тип" value={note.type} onChange={(e) => setObjectArrayItem('initialNotes', idx, 'type', e.target.value)} fullWidth sx={fieldSx} SelectProps={{ MenuProps: selectMenuProps }}>
                                 <MenuItem value="positive">Позитивна</MenuItem>
                                 <MenuItem value="negative">Негативна</MenuItem>
                                 <MenuItem value="info">Інформаційна</MenuItem>
                                 <MenuItem value="important">Важлива</MenuItem>
                              </TextField>
                           </Grid>
                           <Grid item xs={2} md={1}>
                              <IconButton onClick={() => idx === 0 ? addObjectArrayItem('initialNotes', { text: '', type: 'info' }) : removeObjectArrayItem('initialNotes', idx, { text: '', type: 'info' })} sx={{ mt: { xs: 0, md: 0.4 }, color: '#fff', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2.5 }}>
                                 {idx === 0 ? <AddRoundedIcon /> : <DeleteOutlineRoundedIcon />}
                              </IconButton>
                           </Grid>
                        </Grid>
                     ))}
                  </Stack>
               </Grid>
            </Grid>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
               <Button onClick={onCancel} sx={{ borderRadius: 3, color: 'rgba(255,255,255,0.76)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  Скасувати
               </Button>

               <Button type="submit" disabled={loading} sx={{ borderRadius: 3, fontWeight: 900, color: '#111', background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))' }}>
                  {loading ? 'Збереження...' : isEdit ? 'Зберегти працівника' : 'Створити працівника'}
               </Button>
            </Stack>
         </Stack>
      </Box>
   );
}
