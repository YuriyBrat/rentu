'use client';

import {
   Box,
   Grid,
   Stack,
   Typography,
   TextField,
   MenuItem,
   IconButton,
   Button,
   Divider,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';

import InputAdornment from '@mui/material/InputAdornment';


const RENT_STATUSES = [
   { value: 'rentActual', label: 'Актуальний для оренди' },
   { value: 'rentPause', label: 'Пауза / завдаток' },
   { value: 'rentRented', label: 'Зданий' },
];

const CURRENCIES = ['USD', 'UAH', 'EUR'];

function ensureArray(arr) {
   return Array.isArray(arr) && arr.length ? arr : [''];
}

export default function RentOptionsSection({
   value,
   statusRent,
   onStatusChange,
   onChange,
   fieldSx,
   selectMenuProps,
}) {
   const rent = {
      price: '',
      currency: 'USD',
      availableFrom: '',
      adText: '',
      notes: '',
      conditions: [''],
      furniture: [''],
      appliances: [''],
      lastActualizedAt: '',
      ...(value || {}),
   };

   const setRent = (key, val) => {
      onChange?.({
         ...rent,
         [key]: val,
      });
   };

   const setArrayValue = (key, idx, val) => {
      const next = [...ensureArray(rent[key])];
      next[idx] = val;
      setRent(key, next);
   };

   const addArrayValue = (key) => {
      setRent(key, [...ensureArray(rent[key]), '']);
   };

   const removeArrayValue = (key, idx) => {
      const next = [...ensureArray(rent[key])].filter((_, i) => i !== idx);
      setRent(key, next.length ? next : ['']);
   };


   const adornmentBtnSx = {
      color: '#fff',
      mr: -0.5,
      borderRadius: 2,
      bgcolor: 'rgba(255,255,255,0.04)',
      '&:hover': {
         bgcolor: 'rgba(255,255,255,0.08)',
      },
   };

   const listSections = [
      { key: 'conditions', title: 'Умови / особливості' },
      { key: 'furniture', title: 'Меблі' },
      { key: 'appliances', title: 'Техніка' },
   ];

   return (
      <Box
         sx={{
            mt: 1,
            p: { xs: 1.4, md: 1.8 },
            borderRadius: 4,
            border: '1px solid rgba(139,92,246,0.18)',
            bgcolor: 'rgba(255,255,255,0.02)',
            boxShadow: '0 18px 40px rgba(88,28,135,0.10)',
         }}
      >
         <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
            spacing={1.2}
            sx={{ mb: 1.6 }}
         >
            <Typography sx={{ color: '#fff', fontWeight: 950, fontSize: '1rem' }}>
               Опції оренди
            </Typography>

            <TextField
               select
               label="Статус оренди"
               value={statusRent}
               onChange={(e) => onStatusChange?.(e.target.value)}
               sx={{ minWidth: { xs: '100%', md: 280 }, ...fieldSx }}
               SelectProps={{ MenuProps: selectMenuProps }}
            >
               {RENT_STATUSES.map((x) => (
                  <MenuItem key={x.value} value={x.value}>
                     {x.label}
                  </MenuItem>
               ))}
            </TextField>
         </Stack>

         <Grid container spacing={1.5}>
            <Grid item xs={12} md={3}>
               <TextField
                  label="Вартість оренди"
                  value={rent.price}
                  onChange={(e) => setRent('price', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={2}>
               <TextField
                  select
                  label="Валюта оренди"
                  value={rent.currency}
                  onChange={(e) => setRent('currency', e.target.value)}
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

            <Grid item xs={12} md={3}>
               <TextField
                  type="date"
                  label="Дата доступності / звільнення"
                  value={rent.availableFrom || ''}
                  onChange={(e) => setRent('availableFrom', e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  InputLabelProps={{ shrink: true }}
               />
            </Grid>

            <Grid item xs={12} md={4}>
               <TextField
                  type="date"
                  label="Остання дата актуальності"
                  value={rent.lastActualizedAt || ''}
                  onChange={(e) => setRent('lastActualizedAt', e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  InputLabelProps={{ shrink: true }}
               />
            </Grid>

            <Grid item xs={12}>
               <TextField
                  label="Текст для реклами оренди"
                  value={rent.adText}
                  onChange={(e) => setRent('adText', e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12}>
               <TextField
                  label="Нотатки по оренді"
                  value={rent.notes}
                  onChange={(e) => setRent('notes', e.target.value)}
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
               <Grid container spacing={1.5}>
                  {listSections.map((section) => (
                     <Grid item xs={12} md={4} key={section.key}>
                        <Stack spacing={1}>
                           <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
                              {section.title}
                           </Typography>

                           {ensureArray(rent[section.key]).map((item, idx) => (
                              <TextField
                                 key={`${section.key}-${idx}`}
                                 label={`${section.title} ${idx + 1}`}
                                 value={item}
                                 onChange={(e) => setArrayValue(section.key, idx, e.target.value)}
                                 fullWidth
                                 sx={fieldSx}
                                 InputProps={{
                                    endAdornment: (
                                       <InputAdornment position="end">
                                          {idx === 0 ? (
                                             <IconButton
                                                edge="end"
                                                onClick={() => addArrayValue(section.key)}
                                                sx={adornmentBtnSx}
                                             >
                                                <AddRoundedIcon fontSize="small" />
                                             </IconButton>
                                          ) : (
                                             <IconButton
                                                edge="end"
                                                onClick={() => removeArrayValue(section.key, idx)}
                                                sx={{
                                                   ...adornmentBtnSx,
                                                   color: 'rgba(255,255,255,0.7)',
                                                }}
                                             >
                                                <DeleteOutlineRoundedIcon fontSize="small" />
                                             </IconButton>
                                          )}
                                       </InputAdornment>
                                    ),
                                 }}
                              />
                           ))}
                        </Stack>
                     </Grid>
                  ))}
               </Grid>
            </Grid>
         </Grid>
      </Box>
   );
}