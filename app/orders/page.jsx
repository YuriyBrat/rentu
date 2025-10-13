'use client'

import { useState, useEffect } from 'react';
import {
   styled, useTheme, Box, Typography, TextField, Divider,
   Container, Card, Grid, Stack, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

import { LocationOn, FormatListBulleted } from '@mui/icons-material';

import Spinner from '@/components/Spinner';
import { LayoutContainer } from '@/krm/container';
import KrmLayout from '@/krm/Layout-Krm';
import ViewOrder from '@/krm/ViewOrder';

import StarIcon from "@/estatein/components/icons/StarIcon";

import { dataOrders } from '@/krm/ViewOrder';

const Orders = () => {
   const [loading, setLoading] = useState(false);
   const [openId, setOpenId] = useState(null);
   const [message, setMessage] = useState('');
   const theme = useTheme();

   const handleOpen = (id) => setOpenId(id);
   const handleClose = () => { setOpenId(null); setMessage(''); };

   const selectedOrder = dataOrders.find((o) => o.id === openId);

   return loading ? (<Spinner />) : (
      <KrmLayout>
         <LayoutContainer>
            <Box mt={10} mb={2}><StarIcon /></Box>
            <Grid container spacing={1.5}>
               {dataOrders.map((order) => (
                  // <Grid item xs={12} sm={6} md={3} lg={3} xl={3} key={order.id}>
                  //    <Card
                  //       sx={{
                  //          height: '100%',
                  //          minHeight: 220,
                  //          position: 'relative',
                  //          display: 'flex',
                  //          flexDirection: 'column',
                  //          justifyContent: 'space-between',
                  //          borderRadius: 3,
                  //          border: `1px solid ${theme.palette.divider}`,
                  //          backgroundColor: theme.palette.background.default,
                  //          p: 1.5,
                  //       }}
                  //    >
                  //       <Box
                  //          sx={{
                  //             position: 'absolute',
                  //             top: 0,
                  //             left: 0,
                  //             right: 0,
                  //             height: 34,
                  //             borderBottom: `1px solid ${theme.palette.divider}`,
                  //             display: 'flex',
                  //             alignItems: 'center',
                  //             justifyContent: 'flex-end',
                  //             pr: 1.5,
                  //             color: theme.palette.primary.main,
                  //             fontWeight: 700,
                  //             fontSize: '0.95rem',
                  //          }}
                  //       >
                  //          до {parseInt(order.costMax).toLocaleString('uk-UA')} $
                  //       </Box>

                  //       <Stack spacing={0.3} mt={4} flexGrow={1}>
                  //          <Typography variant="body1" fontWeight={600} color="common.white">
                  //             {order.title}
                  //          </Typography>

                  //          <Stack direction="row" alignItems="center" spacing={0.5}>
                  //             <FormatListBulleted sx={{ fontSize: 18, color: theme.palette.grey[500] }} />
                  //             <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
                  //                {order.features}
                  //             </Typography>
                  //          </Stack>

                  //          {order.places && (
                  //             <Stack direction="row" alignItems="center" spacing={0.5}>
                  //                <LocationOn sx={{ fontSize: 18, color: theme.palette.grey[500] }} />
                  //                <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
                  //                   {order.places}
                  //                </Typography>
                  //             </Stack>
                  //          )}

                  //          <Box flexGrow={1} />

                  //          <Divider sx={{ my: 1 }} />

                  //          <Stack direction="row" alignItems="center" spacing={1}>
                  //             {/* <Avatar
                  //                src={order.avatar || getPlaceholderAvatar(order.name)}
                  //                sx={{ width: 36, height: 36 }}
                  //             /> */}
                  //             <Box
                  //                sx={{
                  //                   width: 36,
                  //                   height: 36,
                  //                   fontSize: 22,
                  //                   display: 'flex',
                  //                   alignItems: 'center',
                  //                   justifyContent: 'center',
                  //                }}
                  //             >
                  //                {getPlaceholderEmoji(order.name)}
                  //             </Box>
                  //             <Stack justifyContent="center">
                  //                <Typography variant="body2" fontWeight={600} color="common.white">
                  //                   {order.name}
                  //                </Typography>
                  //                <Typography variant="caption" sx={{ color: theme.palette.grey[500], lineHeight: 1.2 }}>
                  //                   {order.job}
                  //                </Typography>
                  //             </Stack>
                  //          </Stack>

                  //          <Button
                  //             variant="outlined"
                  //             fullWidth
                  //             size="small"
                  //             onClick={() => handleOpen(order.id)}
                  //             sx={{ mt: 1, borderRadius: 2 }}
                  //          >
                  //             НАПИСАТИ
                  //          </Button>
                  //       </Stack>
                  //    </Card>
                  // </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={order.id}>
                     <ViewOrder order={order} />
                  </Grid>
               ))}
            </Grid>

            {/* <Dialog open={!!openId} onClose={handleClose} fullWidth>
               <DialogTitle>Написати до - {selectedOrder ? `${selectedOrder.name}, ${selectedOrder.job}` : ''}</DialogTitle>
               <DialogContent>
                  <TextField
                     fullWidth
                     multiline
                     minRows={3}
                     placeholder="Ваш текст або посилання"
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     sx={{ mt: 1 }}
                  />
               </DialogContent>
               <DialogActions>
                  <Button onClick={handleClose}>Скасувати</Button>
                  <Button variant="contained" onClick={() => { console.log(`Надіслано для заявки ${openId}: ${message}`); handleClose(); }}>Надіслати</Button>
               </DialogActions>
            </Dialog> */}
         </LayoutContainer>
      </KrmLayout>
   );
};

export default Orders;
