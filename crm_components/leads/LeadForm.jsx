'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Grid,
   TextField,
   MenuItem,
   Typography,
   Button,
   InputAdornment,
   Chip,
   IconButton,
   Alert,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

const STAGES = [
   { value: 'lead', label: 'Холодний лід' },
   { value: 'hot', label: 'Гарячий лід' },
   { value: 'ps', label: 'ПС' },
   { value: 'rs', label: 'РС' },
   { value: 'ds', label: 'ДС' },
   { value: 'zs', label: 'ЗС' },
   { value: 'pers', label: 'ПЕРС' },
];

const ACTUALITY_STATUSES = [
   'Актуальний. Зустріч! В роботі',
   'Актуальний. Продзвін',
   'Актуальний. Проблемний',
   'Актуальний. Зустріч! Не в роботі',
   'Неактуальний. Купив зі мною',
   'Неактуальний. Купив без мене',
   'Неактуальний. Відмова покупки',
   'Неактуальний. Невідома причина',
   'Зупинений. Завдаток мій',
   'Зупинений. Завдаток не мій',
   'Зупинений. Виявлена причина',
   'Зупинений. Невиявлена причина',
];

const SOURCE_CHANNELS = [
   'Соцмережі',
   'Сайти',
   'Рекомендація',
   'Дзвінок',
   'Колцентр',
   'Інше',
];

function emptyFields() {
   return {
      name: '',
      phones: [''],
      emails: [''],
      status: 'lead',
      stage: 'lead',
      requestSummary: '',
      budgetMax: '',
      sourceChannel: '',
      sourceObject: '',
      sourceNote: '',
      actualityStatus: 'Актуальний. Продзвін',
      lastActualizedAt: '',
      lastContactAt: '',
      assignee: '',
      createdByEmployee: '',
      createdByName: '',
      notes: [],

      // initialNoteText: '',
      // initialNoteType: 'info',
      initialNotes: [
         {
            text: '',
            type: 'info',
         },
      ],
      notes: [],
      leadAppearedAt: '',
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

export default function LeadForm({ employees = [], onCancel, onCreated }) {
   const [fields, setFields] = useState(() => emptyFields());
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [duplicateInfo, setDuplicateInfo] = useState(null);

   const set = (key, value) => setFields((p) => ({ ...p, [key]: value }));

   const setArrayItem = (key, idx, value) => {
      setFields((p) => {
         const next = [...(p[key] || [''])];
         next[idx] = value;
         return { ...p, [key]: next };
      });
   };

   const addArrayItem = (key) => {
      setFields((p) => ({ ...p, [key]: [...(p[key] || ['']), ''] }));
   };

   const removeArrayItem = (key, idx) => {
      setFields((p) => {
         const next = [...(p[key] || [''])].filter((_, i) => i !== idx);
         return { ...p, [key]: next.length ? next : [''] };
      });
   };


   const setInitialNoteField = (idx, key, value) => {
      setFields((p) => {
         const next = [...(p.initialNotes || [])];
         next[idx] = {
            ...next[idx],
            [key]: value,
         };
         return { ...p, initialNotes: next };
      });
   };

   const addInitialNote = () => {
      setFields((p) => ({
         ...p,
         initialNotes: [...(p.initialNotes || []), { text: '', type: 'info' }],
      }));
   };

   const removeInitialNote = (idx) => {
      setFields((p) => {
         const next = [...(p.initialNotes || [])].filter((_, i) => i !== idx);
         return {
            ...p,
            initialNotes: next.length ? next : [{ text: '', type: 'info' }],
         };
      });
   };


   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setDuplicateInfo(null);

      try {
         const payload = {
            ...fields,
            name: fields.name.trim(),
            phones: (fields.phones || []).map((x) => x.trim()).filter(Boolean),
            emails: (fields.emails || []).map((x) => x.trim()).filter(Boolean),
            requestSummary: fields.requestSummary.trim(),
            budgetMax: fields.budgetMax ? Number(fields.budgetMax) : undefined,
            sourceChannel: fields.sourceChannel.trim(),
            sourceObject: fields.sourceObject.trim(),
            sourceNote: fields.sourceNote.trim(),
            leadAppearedAt: fields.leadAppearedAt || undefined,
            lastActualizedAt: fields.lastActualizedAt || undefined,

            notes: (fields.initialNotes || [])
               .map((note) => ({
                  text: String(note?.text || '').trim(),
                  type: note?.type || 'info',
                  createdAt: new Date().toISOString(),
               }))
               .filter((note) => note.text),
         };

         const res = await fetch('/api/crm/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data?.error || 'Помилка створення ліда');
         }

         if (data?.duplicate) {
            setDuplicateInfo(data.duplicate);
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

            {!!duplicateInfo && (
               <Alert severity="warning">
                  Схожий контакт уже є: <b>{duplicateInfo.name}</b>
               </Alert>
            )}

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
                     select
                     label="Стадія"
                     value={fields.stage}
                     onChange={(e) => set('stage', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     SelectProps={{ MenuProps: selectMenuProps }}
                  >
                     {STAGES.map((x) => (
                        <MenuItem key={x.value} value={x.value}>
                           {x.label}
                        </MenuItem>
                     ))}
                  </TextField>
               </Grid>

               <Grid item xs={12} md={2}>
                  <TextField
                     label="Бюджет max"
                     value={fields.budgetMax}
                     onChange={(e) => set('budgetMax', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField
                     select
                     label="Канал"
                     value={fields.sourceChannel}
                     onChange={(e) => set('sourceChannel', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     SelectProps={{ MenuProps: selectMenuProps }}
                  >
                     {SOURCE_CHANNELS.map((x) => (
                        <MenuItem key={x} value={x}>
                           {x}
                        </MenuItem>
                     ))}
                  </TextField>
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField
                     label="Заявка / деталі пошуку"
                     value={fields.requestSummary}
                     onChange={(e) => set('requestSummary', e.target.value)}
                     fullWidth
                     multiline
                     minRows={4}
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
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
                              onClick={() => (idx === 0 ? addArrayItem('phones') : removeArrayItem('phones', idx))}
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
                              onClick={() => (idx === 0 ? addArrayItem('emails') : removeArrayItem('emails', idx))}
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

               <Grid item xs={12} md={4}>
                  <TextField
                     label="Об’єкт, що примагнітив"
                     value={fields.sourceObject}
                     onChange={(e) => set('sourceObject', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     label="Нотатка до джерела"
                     value={fields.sourceNote}
                     onChange={(e) => set('sourceNote', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     select
                     label="Актуальність"
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
               {/* 
               <Grid item xs={12} md={3}>
                  <TextField
                     type="datetime-local"
                     label="Останній контакт"
                     value={fields.lastContactAt}
                     onChange={(e) => set('lastContactAt', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     InputLabelProps={{ shrink: true }}
                  />
               </Grid> */}
               <Grid item xs={12} md={3}>
                  <TextField
                     type="datetime-local"
                     label="Дата появи ліда"
                     value={fields.leadAppearedAt}
                     onChange={(e) => set('leadAppearedAt', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     InputLabelProps={{ shrink: true }}
                  />
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField
                     type="datetime-local"
                     label="Остання актуальність"
                     value={fields.lastActualizedAt}
                     onChange={(e) => set('lastActualizedAt', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     InputLabelProps={{ shrink: true }}
                  />
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField
                     select
                     label="Відповідальний"
                     value={fields.assignee}
                     onChange={(e) => set('assignee', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     SelectProps={{ MenuProps: selectMenuProps }}
                  >
                     <MenuItem value="">—</MenuItem>
                     {employees.map((emp) => (
                        <MenuItem key={emp._id} value={emp._id}>
                           {emp.name}
                        </MenuItem>
                     ))}
                  </TextField>
               </Grid>

               <Grid item xs={12} md={3}>
                  {/* <TextField
                     label="Хто вніс"
                     value={fields.createdByName}
                     onChange={(e) => set('createdByName', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  /> */}
                  <TextField
                     select
                     label="Хто вніс"
                     value={fields.createdByEmployee}
                     onChange={(e) => set('createdByEmployee', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     SelectProps={{ MenuProps: selectMenuProps }}
                  >
                     <MenuItem value="">—</MenuItem>
                     {employees.map((emp) => (
                        <MenuItem key={emp._id} value={emp._id}>
                           {emp.name}
                        </MenuItem>
                     ))}
                  </TextField>
               </Grid>



               {/* <Grid item xs={12} md={8}>
                  <TextField
                     label="Перша нотатка"
                     value={fields.initialNoteText}
                     onChange={(e) => set('initialNoteText', e.target.value)}
                     fullWidth
                     // multiline
                     minRows={2}
                     sx={fieldSx}
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     select
                     label="Тип нотатки"
                     value={fields.initialNoteType}
                     onChange={(e) => set('initialNoteType', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                     SelectProps={{ MenuProps: selectMenuProps }}
                  >
                     <MenuItem value="positive">Позитивна</MenuItem>
                     <MenuItem value="negative">Негативна</MenuItem>
                     <MenuItem value="info">Інформуюча</MenuItem>
                     <MenuItem value="important">Важлива</MenuItem>
                  </TextField>
               </Grid> */}
               <Grid item xs={12}>
                  <Stack spacing={1}>
                     <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                        Початкові нотатки
                     </Typography>

                     {(fields.initialNotes || []).map((note, idx) => (
                        <Grid container spacing={1} key={idx}>
                           <Grid item xs={12} md={8}>
                              <TextField
                                 label={idx === 0 ? 'Нотатка' : `Нотатка ${idx + 1}`}
                                 value={note.text}
                                 onChange={(e) => setInitialNoteField(idx, 'text', e.target.value)}
                                 fullWidth
                                 // multiline
                                 minRows={2}
                                 sx={fieldSx}
                              />
                           </Grid>

                           <Grid item xs={10} md={3}>
                              <TextField
                                 select
                                 label="Тип"
                                 value={note.type}
                                 onChange={(e) => setInitialNoteField(idx, 'type', e.target.value)}
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
                                 onClick={() => (idx === 0 ? addInitialNote() : removeInitialNote(idx))}
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
                  {loading ? 'Збереження...' : 'Створити ліда'}
               </Button>
            </Stack>
         </Stack>
      </Box>
   );
}