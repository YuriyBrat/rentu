'use client';

import {
   Box,
   Grid,
   Stack,
   Typography,
   TextField,
   MenuItem,
   Button,
   IconButton,
   Checkbox,
   FormControlLabel,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';

const OWNER_STATUSES = [
   { value: 'active', label: 'Актуальний' },
   { value: 'previous', label: 'Попередній' },
   { value: 'inactive', label: 'Неактуальний' },
];

function createEmptyOwner(isPrimary = false) {
   return {
      name: '',
      phones: [''],
      emails: [''],
      status: 'active',
      isPrimary,
      notes: '',
   };
}

function ensureArray(arr) {
   return Array.isArray(arr) && arr.length ? arr : [''];
}

export default function OwnersSection({
   value = [],
   onChange,
   fieldSx,
   selectMenuProps,
}) {
   const owners = value.length ? value : [createEmptyOwner(true)];

   const setOwners = (next) => onChange?.(next);

   const setOwnerField = (ownerIdx, key, val) => {
      const next = [...owners];
      next[ownerIdx] = {
         ...next[ownerIdx],
         [key]: val,
      };
      setOwners(next);
   };

   const setOwnerArrayField = (ownerIdx, key, itemIdx, val) => {
      const next = [...owners];
      const arr = [...ensureArray(next[ownerIdx][key])];
      arr[itemIdx] = val;
      next[ownerIdx] = {
         ...next[ownerIdx],
         [key]: arr,
      };
      setOwners(next);
   };

   const addOwnerArrayField = (ownerIdx, key) => {
      const next = [...owners];
      next[ownerIdx] = {
         ...next[ownerIdx],
         [key]: [...ensureArray(next[ownerIdx][key]), ''],
      };
      setOwners(next);
   };

   const removeOwnerArrayField = (ownerIdx, key, itemIdx) => {
      const next = [...owners];
      const arr = [...ensureArray(next[ownerIdx][key])].filter((_, i) => i !== itemIdx);
      next[ownerIdx] = {
         ...next[ownerIdx],
         [key]: arr.length ? arr : [''],
      };
      setOwners(next);
   };

   const addOwner = () => {
      setOwners([...owners, createEmptyOwner(false)]);
   };

   const removeOwner = (ownerIdx) => {
      const next = owners.filter((_, i) => i !== ownerIdx);
      if (!next.length) {
         setOwners([createEmptyOwner(true)]);
         return;
      }

      if (!next.some((x) => x.isPrimary)) {
         next[0] = { ...next[0], isPrimary: true };
      }

      setOwners(next);
   };

   const setPrimaryOwner = (ownerIdx) => {
      const next = owners.map((owner, idx) => ({
         ...owner,
         isPrimary: idx === ownerIdx,
      }));
      setOwners(next);
   };

   return (
      <Stack spacing={1.5}>
         <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ color: '#fff', fontWeight: 900 }}>
               Контакти / власники
            </Typography>

            <Button
               size="small"
               startIcon={<PersonAddAlt1RoundedIcon />}
               onClick={addOwner}
               sx={{
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 2.5,
               }}
            >
               Додати контакт
            </Button>
         </Stack>

         {owners.map((owner, ownerIdx) => (
            <Box
               key={`owner-${ownerIdx}`}
               sx={{
                  p: { xs: 1.2, md: 1.5 },
                  borderRadius: 3.5,
                  border: '1px solid rgba(255,255,255,0.08)',
                  bgcolor: 'rgba(255,255,255,0.02)',
               }}
            >
               <Stack spacing={1.4}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                     <Typography sx={{ color: '#fff', fontWeight: 850 }}>
                        Контакт {ownerIdx + 1}
                     </Typography>

                     <Stack direction="row" spacing={1} alignItems="center">
                        <FormControlLabel
                           control={
                              <Checkbox
                                 checked={!!owner.isPrimary}
                                 onChange={() => setPrimaryOwner(ownerIdx)}
                                 sx={{
                                    color: 'rgba(255,255,255,0.65)',
                                    '&.Mui-checked': { color: '#a855f7' },
                                 }}
                              />
                           }
                           label="Головний"
                           sx={{ m: 0, color: 'rgba(255,255,255,0.82)' }}
                        />

                        {owners.length > 1 && (
                           <IconButton
                              onClick={() => removeOwner(ownerIdx)}
                              sx={{
                                 color: 'rgba(255,255,255,0.72)',
                                 border: '1px solid rgba(255,255,255,0.08)',
                                 borderRadius: 2.5,
                              }}
                           >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                           </IconButton>
                        )}
                     </Stack>
                  </Stack>

                  <Grid container spacing={1.4}>
                     <Grid item xs={12} md={5}>
                        <TextField
                           label="Ім’я / підпис"
                           value={owner.name || ''}
                           onChange={(e) => setOwnerField(ownerIdx, 'name', e.target.value)}
                           fullWidth
                           sx={fieldSx}
                           placeholder="Олег від Миколи з Яворова"
                        />
                     </Grid>

                     <Grid item xs={12} md={3}>
                        <TextField
                           select
                           label="Статус"
                           value={owner.status || 'active'}
                           onChange={(e) => setOwnerField(ownerIdx, 'status', e.target.value)}
                           fullWidth
                           sx={fieldSx}
                           SelectProps={{ MenuProps: selectMenuProps }}
                        >
                           {OWNER_STATUSES.map((x) => (
                              <MenuItem key={x.value} value={x.value}>
                                 {x.label}
                              </MenuItem>
                           ))}
                        </TextField>
                     </Grid>
                  </Grid>

                  <Stack spacing={1}>
                     <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                           Телефони
                        </Typography>

                        <Button
                           size="small"
                           startIcon={<AddRoundedIcon />}
                           onClick={() => addOwnerArrayField(ownerIdx, 'phones')}
                           sx={{
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.10)',
                              borderRadius: 2.5,
                           }}
                        >
                           Додати телефон
                        </Button>
                     </Stack>

                     <Grid container spacing={1.2}>
                        {ensureArray(owner.phones).map((phone, phoneIdx) => (
                           <Grid item xs={12} md={6} key={`owner-${ownerIdx}-phone-${phoneIdx}`}>
                              <Stack direction="row" spacing={1}>
                                 <TextField
                                    label={`Телефон ${phoneIdx + 1}`}
                                    value={phone}
                                    onChange={(e) =>
                                       setOwnerArrayField(ownerIdx, 'phones', phoneIdx, e.target.value)
                                    }
                                    fullWidth
                                    sx={fieldSx}
                                 />
                                 <IconButton
                                    onClick={() => removeOwnerArrayField(ownerIdx, 'phones', phoneIdx)}
                                    sx={{
                                       alignSelf: 'center',
                                       color: 'rgba(255,255,255,0.72)',
                                       border: '1px solid rgba(255,255,255,0.08)',
                                       borderRadius: 2.5,
                                    }}
                                 >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                 </IconButton>
                              </Stack>
                           </Grid>
                        ))}
                     </Grid>
                  </Stack>

                  <Stack spacing={1}>
                     <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                           Email
                        </Typography>

                        <Button
                           size="small"
                           startIcon={<AddRoundedIcon />}
                           onClick={() => addOwnerArrayField(ownerIdx, 'emails')}
                           sx={{
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.10)',
                              borderRadius: 2.5,
                           }}
                        >
                           Додати email
                        </Button>
                     </Stack>

                     <Grid container spacing={1.2}>
                        {ensureArray(owner.emails).map((email, emailIdx) => (
                           <Grid item xs={12} md={6} key={`owner-${ownerIdx}-email-${emailIdx}`}>
                              <Stack direction="row" spacing={1}>
                                 <TextField
                                    label={`Email ${emailIdx + 1}`}
                                    value={email}
                                    onChange={(e) =>
                                       setOwnerArrayField(ownerIdx, 'emails', emailIdx, e.target.value)
                                    }
                                    fullWidth
                                    sx={fieldSx}
                                 />
                                 <IconButton
                                    onClick={() => removeOwnerArrayField(ownerIdx, 'emails', emailIdx)}
                                    sx={{
                                       alignSelf: 'center',
                                       color: 'rgba(255,255,255,0.72)',
                                       border: '1px solid rgba(255,255,255,0.08)',
                                       borderRadius: 2.5,
                                    }}
                                 >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                 </IconButton>
                              </Stack>
                           </Grid>
                        ))}
                     </Grid>
                  </Stack>

                  <TextField
                     label="Нотатки по контакту"
                     value={owner.notes || ''}
                     onChange={(e) => setOwnerField(ownerIdx, 'notes', e.target.value)}
                     fullWidth
                     multiline
                     minRows={2}
                     sx={fieldSx}
                  />
               </Stack>
            </Box>
         ))}
      </Stack>
   );
}