'use client'

import { useState } from 'react';
import {
   useTheme,
   Box, Typography, TextField, Divider,
   Grid, Stack, Button, Dialog, DialogTitle,
   DialogContent, DialogActions
} from '@mui/material';

const getPlaceholderAvatar = (name) => {
   const male = [
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304451/rbm_4_kcib6z.jpg',
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304446/rbm_3_yn9e7z.jpg',
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304444/rbm_2_b3w58i.jpg',
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304445/rbm_1_i1yfmg.jpg'
   ];

   const female = [
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304738/rb_6_uaucim.jpg',
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304736/rb_5_o9gzxb.jpg',
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304729/rb_4_e7jind.jpg',
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304726/rb_3_bx8zh9.jpg',
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304726/rb_2_thomra.jpg',
      'https://res.cloudinary.com/ddttjhllt/image/upload/v1751304721/rb_1_kedxpl.jpg'
   ];

   const isFemale = name.toLowerCase().endsWith('а') || ['Катерина', 'Марія', 'Олена', 'Наталя', 'Ірина'].includes(name);
   const avatars = isFemale ? female : male;
   const index = name.length % avatars.length;
   return avatars[index];
};

const getPlaceholderEmoji = (name) => {
   const emojis = ['😃', '😊', '😉', '😎', '🧐', '😇', '😺', '👨‍💻', '👩‍🎓', '👨‍🎨', '👩‍🏫', '👨‍⚕️', '👩‍💼', '🧔', '👱‍♀️'];
   const index = name.length % emojis.length;
   return emojis[index];
};



const ViewOrder = ({ order }) => {
   const [open, setOpen] = useState(false);
   const [message, setMessage] = useState('');

   const theme = useTheme();

   const handleOpen = () => setOpen(true);
   const handleClose = () => {
      setOpen(false);
      setMessage('');
   };

   function tarasLogic(age) {
      let new_age = Math.round((age / 2 + 2)

   );
      return new_age
   }

   return (
      // <Grid item xs={12} sm={6} md={4} lg={3} xl={3}>
      <>
         <Box
            sx={{
               border: '1px solid #444',
               borderRadius: 2,
               p: 2,
               backgroundColor: '#1e1e1e',
               height: '100%',
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'space-between',
               position: 'relative'
            }}
         >
            {/* Бюджет */}
            <Box
               sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pr: 2,
                  borderBottom: '1px solid #444',
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '1rem'
               }}
            >
               до {parseInt(order.costMax).toLocaleString('uk-UA')} $
            </Box>

            <Stack spacing={0.5} mt={3} flexGrow={1}>
               <Typography variant="h6" fontWeight={600} color="common.white" align="center">
                  {order.title}
               </Typography>

               <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="gray">🔍</Typography>
                  <Typography variant="body2" color="gray">{order.features}</Typography>
               </Stack>

               <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="gray">📍</Typography>
                  <Typography variant="body2" color="gray">{order.places}</Typography>
               </Stack>

               <Divider sx={{ my: 1 }} />

               <Stack direction="row" spacing={1} display="flex" flexGrow={1} alignItems="flex-end">
                  {/* <Avatar
                                 src={order.avatar || getPlaceholderAvatar(order.name)}
                                sx={{ width: 36, height: 36 }}
                              /> */}
                  <Box
                     sx={{
                        width: 36,
                        height: 36,
                        fontSize: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                     }}
                  >
                     {getPlaceholderEmoji(order.name)}
                  </Box>
                  <Stack>
                     <Typography variant="body2" fontWeight={600} color="common.white">
                        {order.name}, <Typography variant="body3" component="span" color="gray">{order.city}</Typography>
                     </Typography>
                     <Typography variant="caption" color="gray">
                        {order.job},  <Typography variant="body3" component="span" color="gray">{tarasLogic(order.age)} р</Typography>
                     </Typography>
                  </Stack>
               </Stack>

               <Box mt={1} display="flex" alignItems="flex-end">
                  <Button
                     fullWidth
                     variant="outlined"
                     size="small"
                     onClick={handleOpen}
                     sx={{ borderRadius: 1 }}
                  >
                     НАПИСАТИ
                  </Button>
               </Box>
            </Stack>
         </Box>

         {/* Модальне вікно */}
         <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle fontStyle='italic'>Написати до: {order.name}, {order.city}, {order.job}</DialogTitle>
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
               <Button
                  variant="contained"
                  onClick={() => {
                     console.log(`Надіслано до ${order.name}:`, message);
                     handleClose();
                  }}
               >Надіслати</Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

export default ViewOrder;


export { dataOrders };



const dataOrders = [
   { id: 1, costMax: "80000", title: "Куплю квартиру з ремонтом у Львові для життя", features: "Спальний район, балкон, не останній поверх, нестарий ремонт", places: "Спальний район, Львів", name: "Тарас", job: "шеф-повар", age: 34, city: "м.Львів" },
   { id: 2, costMax: "60000", title: "Шукаю невелику квартиру для студента", features: "Близько до університету, недорогі комунальні, меблі", places: "Центр, Львів", name: "Ірина", job: "студентка", age: 22, city: "м.Тернопіль" },
   { id: 3, costMax: "120000", title: "Куплю простору квартиру для сім’ї", features: "3-кімнатна, парк поблизу, дитсадок поруч", places: "Район Сихів, Львів", name: "Олег", job: "менеджер", age: 42, city: "м.Львів" },
   { id: 4, costMax: "90000", title: "Шукаю житло на вторинному ринку", features: "Центр міста, 2 кімнати, поверх 2–4", places: "Центр, Львів", name: "Марія", job: "викладачка", age: 38, city: "м.Львів" },
   { id: 5, costMax: "75000", title: "Квартира для здачі в оренду", features: "Поруч транспорт, невелика площа, з ремонтом", places: "Франківський район", name: "Дмитро", job: "підприємець", age: 47, city: "м.Івано-Франківськ" },
   { id: 6, costMax: "50000", title: "Шукаю житло для мами-пенсіонерки", features: "Перший або другий поверх, тиха вулиця", places: "Неподалік Львова", name: "Наталя", job: "медсестра", age: 31, city: "м.Тернопіль" },
   { id: 7, costMax: "105000", title: "Куплю квартиру з панорамними вікнами", features: "Новобудова, 2 поверхи, не кутова", places: "Новобудови, Львів", name: "Роман", job: "архітектор", age: 36, city: "м.Чернівці" },
   { id: 8, costMax: "69000", title: "Малосімейка в спальному районі", features: "Ліфт, нормальний стан, 1 кімната", places: "Левандівка", name: "Олена", job: "бухгалтер", age: 29, city: "м.Рівне" },
   { id: 9, costMax: "80000", title: "1к квартира біля ІТ-парку", features: "Гарне сполучення, без ремонту теж підходить", places: "ІТ-парк, Львів", name: "Юрій", job: "тестувальник", age: 27, city: "м.Луцьк" },
   { id: 10, costMax: "95000", title: "2к для сім’ї з дитиною", features: "Поруч парк, садочок, кухня не менше 9 м²", places: "Залізничний район", name: "Катерина", job: "дизайнерка", age: 33, city: "м.Ужгород" },
   { id: 11, costMax: "72000", title: "Квартира біля школи", features: "2 кімнати, поруч школа, магазини", places: "Залізничний район", name: "Анна", job: "аналітик", age: 28, city: "м.Київ" },
   { id: 12, costMax: "55000", title: "Житло для бабусі", features: "1 поверх, тиша, зручності", places: "Спальний район Львова", name: "Олександр", job: "викладач", age: 45, city: "м.Івано-Франківськ" },
   { id: 13, costMax: "98000", title: "Простора квартира з видом", features: "панорамні вікна, балкон, ліфт", places: "Новобудови у Львові", name: "Юлія", job: "фотограф", age: 30, city: "м.Дніпро" },
   { id: 14, costMax: "110000", title: "Елітна квартира в центрі", features: "новобудова, паркінг, охорона", places: "Центр, Львів", name: "Максим", job: "адвокат", age: 41, city: "м.Київ" },
   { id: 15, costMax: "66000", title: "1к з ремонтом для сина", features: "чистий під'їзд, новий ліфт", places: "Львів, різні райони", name: "Олена", job: "пенсіонерка", age: 65, city: "м.Червоноград" },
   { id: 16, costMax: "77000", title: "Житло на першому поверсі", features: "без сходів, зручний вхід", places: "Форум, Львів", name: "Тетяна", job: "вчителька", age: 54, city: "м.Київ" },
   { id: 17, costMax: "57000", title: "Квартира для молодої пари", features: "2 кімнати, новий ремонт", places: "Гарний район Львова", name: "Павло", job: "дизайнер", age: 26, city: "м.Миколаїв" },
   { id: 18, costMax: "63000", title: "1к в центрі міста", features: "поруч університет, з ремонтом", places: "Центр, Львів", name: "Оксана", job: "фармацевт", age: 32, city: "м.Тернопіль" },
   { id: 19, costMax: "88000", title: "Квартира з гаражем", features: "гараж, кладовка, паркінг", places: "Новобудови у Франківському районі", name: "Ігор", job: "автомеханік", age: 39, city: "м.Київ" },
   { id: 20, costMax: "50000", title: "Бюджетна квартира", features: "маленька площа, потребує ремонту", places: "Підзамче, Львів", name: "Олеся", job: "офіціантка", age: 24, city: "м.Львів" },
   { id: 21, costMax: "76000", title: "Квартира в новобудові", features: "новий будинок, утеплення", places: "Львів, сторона Стрийської вулиці", name: "Володимир", job: "інженер", age: 43, city: "м.Вінниця" },
   { id: 22, costMax: "86000", title: "Житло з хорошим Wi-Fi", features: "оптоволокно, тихі сусіди", places: "Новий район, Львів", name: "Аліна", job: "копірайтер", age: 27, city: "м.Харків" },
   { id: 23, costMax: "93000", title: "Затишна 2к з балконом", features: "великий балкон, тиша", places: "Центр, Львів", name: "Андрій", job: "менеджер", age: 37, city: "м.Чернігів" },
   { id: 24, costMax: "82000", title: "Житло для сім'ї з дітьми", features: "садочок поруч, ліфт", places: "Левандівка, Рясне", name: "Людмила", job: "бібліотекарка", age: 48, city: "м.Тернопіль" },
   { id: 25, costMax: "78000", title: "Квартира поблизу школи", features: "1 поверх, школа біля дому", places: "Сихів, Львів", name: "Віталій", job: "програміст", age: 35, city: "м.Львів" },
];