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

import { dataOrders } from '@/krm/ViewOrder';

import StarIcon from "@/estatein/components/icons/StarIcon";

import ServiceCard from '@/krm/ServiceCard';

const services = [
   {
      id: 1,
      title: 'Рекламна кампанія об\'єкта',
      description: 'Професійна зйомка, таргет, розміщення на топ-платформах.',
      type: 'marketing',
   },
   {
      id: 2,
      title: 'Юридичний супровід',
      description: 'Перевірка документів, складання договорів, супровід угоди.',
      type: 'legal',
   },
   {
      id: 3,
      title: 'Оцінка вартості',
      description: 'Допоможемо визначити оптимальну ринкову ціну вашої нерухомості.',
   },
];

const Services = () => {
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

            {/* <Grid container spacing={1.5}>
               {dataOrders.map((order) => (
           
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={order.id}>
                     <ViewOrder order={order} />
                  </Grid>
                  
               ))}
            </Grid> */}

            <Grid container spacing={2}>
               {services.map((service) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={service.id}>
                     <ServiceCard {...service} onClick={() => console.log('Перейти до', service.title)} />
                  </Grid>
               ))}
            </Grid>


         </LayoutContainer>
      </KrmLayout>
   );
};

export default Services;
