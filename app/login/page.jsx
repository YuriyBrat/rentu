'use client';
import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
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
         callbackUrl: '/crm/objects3',
      });

      if (result?.error) {
         setError('Невірний email/телефон або пароль');
      } else if (result?.ok) {
         const session = await getSession();
         window.location.href = session?.user?.role === 'marketing' ? '/crm/advertising' : '/crm/objects3';
      }
   };

   return (
      <Box
         sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            px: 2,
            overflow: 'hidden',
            color: '#f5f3ff',
            backgroundColor: '#070711',
            backgroundImage: `
               radial-gradient(circle at 18% 18%, rgba(139,92,246,0.34), transparent 34%),
               radial-gradient(circle at 78% 76%, rgba(14,165,233,0.18), transparent 38%),
               linear-gradient(135deg, rgba(4,4,10,0.90), rgba(18,12,32,0.88)),
               url('/land1/images/hero-bg.jpg')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
               content: '""',
               position: 'absolute',
               inset: 0,
               background:
                  'linear-gradient(180deg, rgba(8,8,18,0.20), rgba(8,8,18,0.72))',
               backdropFilter: 'blur(2px)',
            },
            '&::after': {
               content: '""',
               position: 'absolute',
               inset: 0,
               backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
               backgroundSize: '48px 48px',
               opacity: 0.22,
            },
         }}
      >
         <Paper
            elevation={0}
            sx={{
               position: 'relative',
               zIndex: 1,
               p: 4,
               width: 360,
               borderRadius: 4,
               color: '#f5f3ff',
               background:
                  'linear-gradient(180deg, rgba(21,21,33,0.88), rgba(13,13,23,0.92))',
               border: '1px solid rgba(167,139,250,0.28)',
               boxShadow:
                  '0 24px 80px rgba(0,0,0,0.48), 0 0 70px rgba(139,92,246,0.18)',
               backdropFilter: 'blur(18px)',
            }}
         >
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
