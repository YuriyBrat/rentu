'use client';

import {
   Box,
   Typography,
   Grid,
   Stack,
   Button,
   Card,
   Chip,
   useTheme,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   TextField,
   IconButton,
   Divider,
   keyframes,
} from '@mui/material';
import {
   Storefront,
   ShoppingCart,
   Key,
   PersonSearch,
   Campaign,
   Gavel,
   Assignment,
   People,
   Home,
   Close,
} from '@mui/icons-material';
import React, { useState } from 'react';

import { LayoutContainer } from '@/krm/container';
import KrmLayout from '@/krm/Layout-Krm';
import StarIcon from "@/estatein/components/icons/StarIcon";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const iconMap = {
   marketing: <Campaign sx={{ fontSize: 28, color: 'primary.main' }} />,
   legal: <Gavel sx={{ fontSize: 28, color: 'primary.main' }} />,
   renters: <People sx={{ fontSize: 28, color: 'primary.main' }} />,
   landlords: <Home sx={{ fontSize: 28, color: 'primary.main' }} />,
   default: <Assignment sx={{ fontSize: 28, color: 'primary.main' }} />,
};

const ServiceCard = ({ title, description, type = 'default', price, promo, onClick }) => {
   const theme = useTheme();

   return (
      <Card
         sx={{
            height: '100%',
            position: 'relative',
            p: 2,
            pt: 6,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
         }}
      >
         <Box
            sx={{
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               px: 2,
               py: 1,

               height: '35px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               borderBottom: `1px solid ${theme.palette.divider}`,
               // backgroundColor: theme.palette.background.paper,
               borderTopLeftRadius: 12,
               borderTopRightRadius: 12,
            }}
         >
            {promo && (
               <Chip
                  label="Акція"
                  color="success"
                  size="small"
                  sx={{
                     animation: `${pulse} 2s infinite`,
                     fontWeight: 'bold',
                  }}
               />
            )}

            <Box
               sx={{
                  position: 'absolute',
                  // top: 36,
                  left: '70%',
                  // right: 0,

                  px: 2,
                  py: 0.5,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: promo ? 'success.main' : 'primary.main',
               }}
            >
               {price === 0 ? 'Безкоштовно' : `від ${price.toLocaleString()} грн`}
            </Box>
         </Box>



         <Stack spacing={1} mt={1}>
            <Box display="flex" alignItems="center" gap={1}>
               {iconMap[type] || iconMap.default}
               <Typography variant="h6" fontWeight={600} color="common.white">
                  {title}
               </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: theme.palette.grey[400], flexGrow: 1 }}>
               {description}
            </Typography>
         </Stack>

         <Button
            variant="outlined"
            fullWidth
            size="small"
            onClick={onClick}
            sx={{ mt: 2, borderRadius: 2 }}
         >
            Замовити
         </Button>
      </Card>
   );
};

const SectionBlock = ({ icon, title, children }) => (
   <Box mb={6}>
      <Box
         display="flex"
         alignItems="center"
         gap={2}
         mb={2}
         sx={{
            backgroundColor: 'primary.main',
            px: 3,
            py: 1.5,
            borderRadius: 3,
         }}
      >
         <Box
            sx={{
               backgroundColor: 'white',
               borderRadius: '50%',
               width: 36,
               height: 36,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
            }}
         >
            {icon}
         </Box>
         <Typography variant="h5" fontWeight={700} color="common.white">
            {title}
         </Typography>
      </Box>
      <Grid container spacing={2}>
         {children}
      </Grid>
   </Box>
);

const serviceSections = [
   {
      id: 'sellers',
      title: 'Для продавців',
      icon: <Storefront sx={{ color: 'primary.main' }} />,
      services: [
         {
            id: 1,
            title: 'Рекламна кампанія об\'єкта',
            description: 'Фото, відео, OLX, DOM.RIA, соцмережі.',
            type: 'marketing',
            price: 3000,
            promo: true,
         },
         {
            id: 2,
            title: 'Професійна зйомка',
            description: 'Фото + відео об\'єкта з дрона.',
            type: 'marketing',
            price: 1500,
         },
         {
            id: 3,
            title: 'Оцінка ринкової вартості',
            description: 'Фахівець складе обґрунтовану ціну.',
            price: 500,
         },
      ],
   },
   {
      id: 'buyers',
      title: 'Для покупців',
      icon: <ShoppingCart sx={{ color: 'primary.main' }} />,
      services: [
         {
            id: 4,
            title: 'Пошук об\'єкта під запит',
            description: 'Ми знайдемо квартиру за вашими критеріями.',
            type: 'default',
            price: 0,
            promo: true,
         },
         {
            id: 5,
            title: 'Юридична перевірка об\'єкта',
            description: 'Виявимо ризики і проблеми.',
            type: 'legal',
            price: 1200,
         },
         {
            id: 6,
            title: 'Перевірка забудовника',
            description: 'Ризики, борги, судові справи.',
            price: 700,
         },
      ],
   },
   {
      id: 'landlords',
      title: 'Для орендодавців',
      icon: <Key sx={{ color: 'primary.main' }} />,
      services: [
         {
            id: 7,
            title: 'Пошук орендарів',
            description: 'Знайдемо відповідальних мешканців.',
            type: 'landlords',
            price: 2000,
         },
         {
            id: 8,
            title: 'Оформлення договору оренди',
            description: 'Юридичне оформлення угоди.',
            type: 'legal',
            price: 800,
         },
      ],
   },
   {
      id: 'renters',
      title: 'Для орендарів',
      icon: <PersonSearch sx={{ color: 'primary.main' }} />,
      services: [
         {
            id: 9,
            title: 'Підбір квартири в оренду',
            description: 'Підберемо варіанти відповідно до ваших побажань.',
            type: 'renters',
            price: 1000,
         },
         {
            id: 10,
            title: 'Перевірка житла перед орендою',
            description: 'Юридична і технічна перевірка.',
            type: 'legal',
            price: 700,
         },
      ],
   },
];

const ServicesPage = () => {
   const [dialogOpen, setDialogOpen] = useState(false);
   const [selectedService, setSelectedService] = useState(null);
   const [message, setMessage] = useState('');

   const handleOrderClick = (service) => {
      setSelectedService(service);
      setDialogOpen(true);
   };

   const handleClose = () => {
      setDialogOpen(false);
      setSelectedService(null);
      setMessage('');
   };

   const handleSubmit = () => {
      console.log('Заявка:', selectedService.title, message);
      handleClose();
   };

   return (
      <KrmLayout>
         <LayoutContainer>

            <Stack direction="row" alignItems="center" spacing={1} mt={12} >
               <StarIcon color="text.secondary" />
               <Typography variant="h3" color="text.secondary" >
                  {" "}Каталог послуг від фахівців команди{" "}
                  <Box component="span" sx={{ color: "#ff8803", fontWeight: 600 }}>
                     Karamax
                  </Box>
                  <Box
                     component="span"
                     sx={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        backgroundColor: "white",
                        ml: 0.5,
                     }}
                  />
               </Typography>
            </Stack>

            <Stack mt={3} mb={3}>
               <Typography
                  variant="subtitle1"
                  color="text.primary"
                  width={{ xs: "100%" }}
               >
                  Використовуйте можливсті, акції та новинки, над якими ми щоденно працюємо,
                  щоб досконаліше надавати необхідну послугу і вирішувати щораз ширший спектр
                  Ваших потреб. Ми трепетно дбаємо за покращення культури, етикету та сервісу
                  надання рієлторської послуги на ринку і цінуємо Ваші побажання.
               </Typography>
            </Stack>

            <Box sx={{ py: 1 }}>


               {serviceSections.map((section) => (
                  <SectionBlock key={section.id} icon={section.icon} title={section.title}>
                     {section.services.map((service) => (
                        <Grid item xs={12} sm={6} md={4} key={service.id}>
                           <ServiceCard {...service} onClick={() => handleOrderClick(service)} />
                        </Grid>
                     ))}
                  </SectionBlock>
               ))}
            </Box>

            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
               <DialogTitle>
                  {selectedService?.title}
                  <IconButton
                     aria-label="close"
                     onClick={handleClose}
                     sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                     <Close />
                  </IconButton>
               </DialogTitle>
               <DialogContent dividers>
                  <Typography variant="body2" mb={2}>
                     Ціна: {selectedService?.price === 0 ? 'Безкоштовно' : `${selectedService?.price} грн`}
                  </Typography>
                  <TextField
                     fullWidth
                     label="Ваше повідомлення"
                     multiline
                     minRows={3}
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                  />
               </DialogContent>
               <DialogActions>
                  <Button onClick={handleSubmit} variant="contained">Відправити</Button>
               </DialogActions>
            </Dialog>
         </LayoutContainer>
      </KrmLayout>
   );
};

export default ServicesPage;
