'use client';

import { Box, Typography, Paper, Stack, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useState } from 'react';

export default function ClientsPage() {
   const [clients, setClients] = useState([
      { id: 1, name: 'Іван Петров', phone: '067 111 22 33', email: 'ivan@example.com', status: 'Активний' },
      { id: 2, name: 'Оксана Коваль', phone: '050 444 55 66', email: 'oksana@example.com', status: 'Новий' },
   ]);

   return (
      <Stack spacing={3}>
         <Typography variant="h5" fontWeight="bold">Клієнти</Typography>

         {/* Форма пошуку */}
         <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={2}>
               <TextField label="Пошук клієнта" variant="outlined" size="small" fullWidth />
               <Button variant="contained" color="primary">Пошук</Button>
            </Stack>
         </Paper>

         {/* Таблиця клієнтів */}
         <Paper sx={{ p: 2 }}>
            <Table>
               <TableHead>
                  <TableRow>
                     <TableCell>#</TableCell>
                     <TableCell>Ім’я</TableCell>
                     <TableCell>Телефон</TableCell>
                     <TableCell>Email</TableCell>
                     <TableCell>Статус</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {clients.map((client) => (
                     <TableRow key={client.id}>
                        <TableCell>{client.id}</TableCell>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.status}</TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </Paper>
      </Stack>
   );
}
