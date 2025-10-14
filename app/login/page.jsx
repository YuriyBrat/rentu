'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Box, Paper, TextField, Button, Typography, Stack, Alert } from '@mui/material';

export default function LoginPage() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      const result = await signIn('credentials', {
         redirect: false,
         email,
         password,
         callbackUrl: '/crm',
      });

      if (result?.error) {
         setError('Невірний email/телефон або пароль');
      } else if (result?.ok) {
         window.location.href = '/crm';
      }
   };

   return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
         <Paper sx={{ p: 4, width: 360, borderRadius: 3 }}>
            <Typography variant="h6" mb={2} textAlign="center" fontWeight={600}>
               Вхід у CRM Karamax
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit}>
               <Stack spacing={2} mt={2}>
                  <TextField
                     label="Email або телефон"
                     variant="outlined"
                     fullWidth
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                     label="Пароль"
                     type="password"
                     variant="outlined"
                     fullWidth
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button type="submit" variant="contained" size="large">
                     Увійти
                  </Button>
               </Stack>
            </form>
         </Paper>
      </Box>
   );
}
