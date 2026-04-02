'use client';

import { useEffect, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Button,
   Dialog,
   DialogContent,
   CircularProgress,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';

import EmployeeForm from '@/crm_components/employees/EmployeeForm';

export default function EmployeesPage() {
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [openCreate, setOpenCreate] = useState(false);

   const load = async () => {
      try {
         setLoading(true);

         const res = await fetch('/api/crm/employees');
         const data = await res.json();

         setItems(data.items || []);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
   }, []);

   return (
      <Box sx={{ p: 2.5 }}>
         {/* HEADER */}
         <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
         >
            <Typography sx={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>
               Персонал
            </Typography>

            <Button
               onClick={() => setOpenCreate(true)}
               startIcon={<AddRoundedIcon />}
               sx={{
                  borderRadius: 3,
                  fontWeight: 900,
                  color: '#0b0b12',
                  background:
                     'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
               }}
            >
               Додати
            </Button>
         </Stack>

         {/* LIST */}
         {loading ? (
            <Stack alignItems="center" sx={{ mt: 5 }}>
               <CircularProgress />
            </Stack>
         ) : (
            <Stack spacing={1}>
               {items.map((emp) => (
                  <EmployeeRow key={emp._id} emp={emp} />
               ))}
            </Stack>
         )}

         {/* MODAL */}
         <Dialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
               sx: {
                  bgcolor: '#0f0f17',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 4,
               },
            }}
         >
            <DialogContent>
               <EmployeeForm
                  onCancel={() => setOpenCreate(false)}
                  onCreated={() => {
                     setOpenCreate(false);
                     load();
                  }}
               />
            </DialogContent>
         </Dialog>
      </Box>
   );
};


function EmployeeRow({ emp }) {
   const lastNote = emp?.notes?.[emp.notes.length - 1];

   return (
      <Box
         sx={{
            p: 1.4,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.06)',
            bgcolor: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            transition: '0.2s',
            '&:hover': {
               bgcolor: 'rgba(255,255,255,0.04)',
            },
         }}
      >
         {/* LEFT */}
         <Stack direction="row" spacing={1.5} alignItems="center">
            {/* AVATAR */}
            <Box
               sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: emp.color || '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: '#fff',
               }}
            >
               {emp.name?.[0]?.toUpperCase() || '?'}
            </Box>

            {/* INFO */}
            <Stack spacing={0.2}>
               <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                  {emp.name}
               </Typography>

               <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  {emp.position || '—'}
               </Typography>
            </Stack>
         </Stack>

         {/* CENTER */}
         <Stack spacing={0.3} sx={{ minWidth: 220 }}>
            <Typography sx={{ color: '#a78bfa', fontSize: 13 }}>
               {emp.role}
            </Typography>

            {lastNote && (
               <Typography
                  sx={{
                     color: 'rgba(255,255,255,0.6)',
                     fontSize: 12,
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                  }}
               >
                  {lastNote.text}
               </Typography>
            )}
         </Stack>

         {/* RIGHT */}
         <Stack alignItems="flex-end" spacing={0.3}>
            <Typography sx={{ color: '#fff', fontSize: 12 }}>
               {emp.login || '—'}
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
               {emp.isActive ? 'Активний' : 'Неактивний'}
            </Typography>
         </Stack>
      </Box>
   );
}