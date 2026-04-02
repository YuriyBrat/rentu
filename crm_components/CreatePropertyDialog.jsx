'use client';

import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PropertyForm from './PropertyForm4';

export default function CreatePropertyDialog({ open, onClose, onSubmit }) {
   return (
      <Dialog
         open={open}
         onClose={onClose}
         fullWidth
         maxWidth="md"
         PaperProps={{
            sx: {
               borderRadius: 4,
               overflow: 'hidden',
               border: '1px solid rgba(255,255,255,0.08)',
               background:
                  'radial-gradient(circle at 18% 18%, rgba(139,92,246,0.14), transparent 45%), radial-gradient(circle at 82% 75%, rgba(139,92,246,0.08), transparent 45%), rgba(15,15,23,0.96)',
               backdropFilter: 'blur(12px)',
               boxShadow: '0 30px 80px rgba(0,0,0,0.70)',
            },
         }}
      >
         <DialogTitle
            sx={{
               color: '#fff',
               fontWeight: 950,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
         >
            Додати об’єкт
            <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)' }}>
               <CloseRoundedIcon />
            </IconButton>
         </DialogTitle>

         <DialogContent sx={{ p: 2.5 }}>
            <Box sx={{ mt: 0.5 }}>
               <PropertyForm onCancel={onClose} onSubmit={onSubmit} />
            </Box>
         </DialogContent>
      </Dialog>
   );
}