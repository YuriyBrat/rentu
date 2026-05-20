'use client';

import { Dialog, Box, IconButton, Stack, Button } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

export default function ImageLightbox({
   open,
   images = [],
   index = 0,
   onClose,
   onChangeIndex,
}) {
   const img = images[index];

   if (!img) return null;

   const src = img.url || img.brandedUrl || img.processedUrl || img.preview;

   return (
      <Dialog
         open={open}
         onClose={onClose}
         fullScreen
         PaperProps={{
            sx: {
               bgcolor: 'rgba(5,5,10,0.96)',
               color: '#fff',
            },
         }}
      >
         <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
               position: 'absolute',
               top: 12,
               left: 12,
               right: 12,
               zIndex: 10,
            }}
         >
            <Button
               component="a"
               href={src}
               download
               target="_blank"
               startIcon={<DownloadRoundedIcon />}
               sx={{
                  color: '#fff',
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.10)',
               }}
            >
               Зберегти
            </Button>

            <IconButton onClick={onClose} sx={{ color: '#fff' }}>
               <CloseRoundedIcon />
            </IconButton>
         </Stack>

         <IconButton
            onClick={() => onChangeIndex?.(Math.max(index - 1, 0))}
            disabled={index <= 0}
            sx={{
               position: 'absolute',
               left: 16,
               top: '50%',
               color: '#fff',
               bgcolor: 'rgba(255,255,255,0.10)',
               zIndex: 10,
            }}
         >
            <ChevronLeftRoundedIcon />
         </IconButton>

         <IconButton
            onClick={() => onChangeIndex?.(Math.min(index + 1, images.length - 1))}
            disabled={index >= images.length - 1}
            sx={{
               position: 'absolute',
               right: 16,
               top: '50%',
               color: '#fff',
               bgcolor: 'rgba(255,255,255,0.10)',
               zIndex: 10,
            }}
         >
            <ChevronRightRoundedIcon />
         </IconButton>

         <Box
            component="img"
            src={src}
            sx={{
               maxWidth: '94vw',
               maxHeight: '92vh',
               objectFit: 'contain',
               m: 'auto',
               display: 'block',
            }}
         />
      </Dialog>
   );
}