'use client';

import { Stack, TextField, Typography, IconButton, InputAdornment } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

function ensureArray(arr) {
   return Array.isArray(arr) && arr.length ? arr : [''];
}

const adornmentBtnSx = {
   color: '#fff',
   mr: -0.5,
   borderRadius: 2,
   bgcolor: 'rgba(255,255,255,0.04)',
   '&:hover': {
      bgcolor: 'rgba(255,255,255,0.08)',
   },
};

export default function DynamicListField({
   title,
   value = [],
   onChange,
   fieldSx,
   placeholder,
}) {
   const list = ensureArray(value);

   const setItem = (idx, val) => {
      const next = [...list];
      next[idx] = val;
      onChange(next);
   };

   const addItem = () => {
      onChange([...list, '']);
   };

   const removeItem = (idx) => {
      const next = list.filter((_, i) => i !== idx);
      onChange(next.length ? next : ['']);
   };

   return (
      <Stack spacing={1}>
         <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
            {title}
         </Typography>

         {list.map((item, idx) => (
            <TextField
               key={idx}
               label={`${title} ${idx + 1}`}
               value={item}
               onChange={(e) => setItem(idx, e.target.value)}
               fullWidth
               sx={fieldSx}
               placeholder={placeholder}
               InputProps={{
                  endAdornment: (
                     <InputAdornment position="end">
                        {idx === 0 ? (
                           <IconButton edge="end" onClick={addItem} sx={adornmentBtnSx}>
                              <AddRoundedIcon fontSize="small" />
                           </IconButton>
                        ) : (
                           <IconButton
                              edge="end"
                              onClick={() => removeItem(idx)}
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
   );
}