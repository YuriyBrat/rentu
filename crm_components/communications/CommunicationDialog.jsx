'use client';

import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   MenuItem,
   Stack,
   TextField,
} from '@mui/material';
import {
   COMMUNICATION_TONE_OPTIONS,
   COMMUNICATION_TYPE_OPTIONS,
   toDatetimeLocal,
} from './communicationMeta';

const getFieldSx = (theme, mode) => ({
   '& .MuiOutlinedInput-root': {
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: theme.text,
      '& fieldset': { borderColor: theme.border },
      '&:hover fieldset': { borderColor: theme.accent },
      '&.Mui-focused fieldset': { borderColor: theme.accentLight },
   },
   '& .MuiInputLabel-root': { color: theme.textSoft },
   '& .MuiInputBase-input': { color: `${theme.text} !important`, WebkitTextFillColor: theme.text },
   '& textarea': { color: `${theme.text} !important`, WebkitTextFillColor: theme.text },
   '& .MuiSelect-icon': { color: theme.text },
});

export const EMPTY_COMMUNICATION_FORM = {
   type: 'call',
   tone: 'info',
   happenedAt: toDatetimeLocal(),
   text: '',
};

export default function CommunicationDialog({
   open,
   title = 'Комунікація',
   value,
   onChange,
   onClose,
   onSubmit,
   saving = false,
   theme,
   mode,
   submitLabel = 'Зберегти',
}) {
   const fieldSx = getFieldSx(theme, mode);
   const form = value || EMPTY_COMMUNICATION_FORM;

   const set = (key, nextValue) => onChange?.({ ...form, [key]: nextValue });

   return (
      <Dialog
         open={open}
         onClose={saving ? undefined : onClose}
         fullWidth
         maxWidth="sm"
         PaperProps={{
            sx: {
               borderRadius: 4,
               bgcolor: theme.bgPanel,
               color: theme.text,
               border: `1px solid ${theme.border}`,
            },
         }}
      >
         <DialogTitle sx={{ fontWeight: 950 }}>{title}</DialogTitle>
         <DialogContent>
            <Stack spacing={1.2} sx={{ mt: 0.5 }}>
               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                     select
                     label="Тип"
                     value={form.type}
                     onChange={(e) => set('type', e.target.value)}
                     sx={{ ...fieldSx, flex: 1 }}
                  >
                     {COMMUNICATION_TYPE_OPTIONS.map((item) => (
                        <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                     ))}
                  </TextField>

                  <TextField
                     select
                     label="Тон"
                     value={form.tone}
                     onChange={(e) => set('tone', e.target.value)}
                     sx={{ ...fieldSx, flex: 1 }}
                  >
                     {COMMUNICATION_TONE_OPTIONS.map((item) => (
                        <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                     ))}
                  </TextField>
               </Stack>

               <TextField
                  label="Дата і час контакту"
                  type="datetime-local"
                  value={form.happenedAt}
                  onChange={(e) => set('happenedAt', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
               />

               <TextField
                  label="Опис"
                  value={form.text}
                  onChange={(e) => set('text', e.target.value)}
                  multiline
                  minRows={4}
                  sx={fieldSx}
               />
            </Stack>
         </DialogContent>
         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={saving} sx={{ color: theme.textSoft }}>
               Скасувати
            </Button>
            <Button
               onClick={onSubmit}
               disabled={saving}
               sx={{
                  borderRadius: 3,
                  fontWeight: 950,
                  color: '#0b0b12',
                  background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
               }}
            >
               {submitLabel}
            </Button>
         </DialogActions>
      </Dialog>
   );
}
