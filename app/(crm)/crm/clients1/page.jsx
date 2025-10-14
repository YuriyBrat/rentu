'use client';
import { useState } from 'react';
import {
   Box,
   Typography,
   Paper,
   Stack,
   TextField,
   Button,
   Table,
   TableHead,
   TableRow,
   TableCell,
   TableBody,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   MenuItem,
} from '@mui/material';
import { useCRMTheme } from '../context/CRMThemeContext';

export default function ClientsPage() {
   const { theme } = useCRMTheme();
   const [clients, setClients] = useState([
      { id: 1, name: 'Іван Петров', phone: '067 111 22 33', email: 'ivan@example.com', status: 'Активний' },
      { id: 2, name: 'Оксана Коваль', phone: '050 444 55 66', email: 'oksana@example.com', status: 'Новий' },
   ]);

   const [openDialog, setOpenDialog] = useState(false);
   const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', status: 'Новий' });

   const handleOpenDialog = () => setOpenDialog(true);
   const handleCloseDialog = () => setOpenDialog(false);

   const handleAddClient = () => {
      if (!newClient.name) return;
      setClients([
         ...clients,
         {
            id: clients.length + 1,
            ...newClient,
         },
      ]);
      setNewClient({ name: '', phone: '', email: '', status: 'Новий' });
      setOpenDialog(false);
   };

   return (
      <Stack spacing={3}>
         {/* Верхній рядок */}
         <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold" color={theme.text}>
               Клієнти
            </Typography>
            <Button
               variant="contained"
               onClick={handleOpenDialog}
               sx={{
                  bgcolor: theme.accent,
                  '&:hover': { bgcolor: theme.accentLight },
                  fontWeight: 600,
               }}
            >
               + Додати клієнта
            </Button>
         </Stack>

         {/* Таблиця */}
         <Paper
            sx={{
               p: 2,
               bgcolor: theme.bgPanel,
               border: `1px solid ${theme.border}`,
               color: theme.text,
               overflow: 'hidden',
            }}
         >
            <Table>
               <TableHead>
                  <TableRow sx={{ bgcolor: theme.hover }}>
                     <TableCell sx={{ color: theme.text, fontWeight: 600 }}>#</TableCell>
                     <TableCell sx={{ color: theme.text, fontWeight: 600 }}>Ім’я</TableCell>
                     <TableCell sx={{ color: theme.text, fontWeight: 600 }}>Телефон</TableCell>
                     <TableCell sx={{ color: theme.text, fontWeight: 600 }}>Email</TableCell>
                     <TableCell sx={{ color: theme.text, fontWeight: 600 }}>Статус</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {clients.map((client) => (
                     <TableRow
                        key={client.id}
                        sx={{
                           '&:hover': { backgroundColor: theme.hover },
                           transition: 'background 0.2s ease',
                        }}
                     >
                        <TableCell sx={{ color: theme.text }}>{client.id}</TableCell>
                        <TableCell sx={{ color: theme.text }}>{client.name}</TableCell>
                        <TableCell sx={{ color: theme.text }}>{client.phone}</TableCell>
                        <TableCell sx={{ color: theme.text }}>{client.email}</TableCell>
                        <TableCell
                           sx={{
                              color:
                                 client.status === 'Активний'
                                    ? theme.accent
                                    : client.status === 'Новий'
                                       ? theme.accentLight
                                       : theme.text,
                              fontWeight: 500,
                           }}
                        >
                           {client.status}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </Paper>

         {/* Модальне вікно */}
         <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle sx={{ bgcolor: theme.bgDark, color: theme.text, borderBottom: `1px solid ${theme.border}` }}>
               Додати нового клієнта
            </DialogTitle>
            <DialogContent sx={{ bgcolor: theme.bgPanel }}>
               <Stack spacing={2} mt={1}>
                  <TextField
                     label="Ім’я"
                     fullWidth
                     value={newClient.name}
                     onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  />
                  <TextField
                     label="Телефон"
                     fullWidth
                     value={newClient.phone}
                     onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                  <TextField
                     label="Email"
                     fullWidth
                     value={newClient.email}
                     onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  />
                  <TextField
                     select
                     label="Статус"
                     fullWidth
                     value={newClient.status}
                     onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}
                  >
                     <MenuItem value="Новий">Новий</MenuItem>
                     <MenuItem value="Активний">Активний</MenuItem>
                     <MenuItem value="Закрито">Закрито</MenuItem>
                  </TextField>
               </Stack>
            </DialogContent>
            <DialogActions sx={{ bgcolor: theme.bgDark, borderTop: `1px solid ${theme.border}` }}>
               <Button onClick={handleCloseDialog} sx={{ color: theme.text }}>
                  Скасувати
               </Button>
               <Button
                  variant="contained"
                  onClick={handleAddClient}
                  sx={{
                     bgcolor: theme.accent,
                     '&:hover': { bgcolor: theme.accentLight },
                     color: '#fff',
                     fontWeight: 600,
                  }}
               >
                  Додати
               </Button>
            </DialogActions>
         </Dialog>
      </Stack>
   );
}
