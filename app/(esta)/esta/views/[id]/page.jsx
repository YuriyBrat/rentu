'use client'

import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import AppLayout from "@/estatein/components/app-layoout";
import SiteLayout from "@/krm/layout-site";
import KrmLayout from '@/krm/Layout-Krm';

import { LayoutContainer } from "@/krm/container";
import {
   Box, Grid, Stack, Typography,
   styled, useTheme,
   Divider, TextField, Button
} from "@mui/material";
// import CustomTextField from "@/estatein/components/utils/CustomTextField";
// import CustomSelect from "@/estatein/components/utils/CustomSelect";
// import CustomeTextarea from "@/estatein/components/utils/CustomeTextarea";

import HauseCarousel from "@/estatein/components/PropertiesView/Hause-carousel/HauseCarousel";
import ViewCarousel from '@/krm/View-carousel/ViewCarousel';
// import FormPage from "@/estatein/components/PropertiesView/Form";
// import Details from "@/estatein/components/PropertiesView/Details";
// import AskedQuestionCarousel from "@/estatein/components/PropertiesView/Question-carousel";
import useWindowSize from "@/estatein/hooks/useWindowSize";

import LineWeightIcon from '@mui/icons-material/LineWeight';
import StarIcon from "@/estatein/components/icons/StarIcon";
import Iconify from "@/estatein/components/iconify/iconify";

import { checkFieldFront, buildTitle } from '@/hooks/text.hook';

import { getMyFormatDate } from '@/hooks/date.hook';



const StyledLocationBox = styled(Box)(({ theme }) => ({
   display: "flex",
   alignItems: "center",
   padding: "5px 10px",
   border: `1px solid ${theme.palette.divider}`,
   borderRadius: "10px",
   color: theme.palette.text.secondary,
}));

const StyledBorderStack = styled(Stack)(({ theme }) => ({
   border: `1px solid ${theme.palette.divider}`,
   borderRadius: "8px",
   padding: "35px",
   [theme.breakpoints.down("sm")]: {
      padding: "15px",
   },
}));

const StyledKeyBox = styled(Box)(({ theme }) => ({
   background:
      "linear-gradient(90.00deg, rgb(26, 26, 26),rgba(26, 26, 26, 0) 100%)",
   display: "flex",
   alignItems: "center",
   padding: "7px 10px",
   color: theme.palette.text.secondary,
   borderLeft: `2px solid ${theme.palette.primary.main}`,
   gap: "10px",
}));


const advantagesDemo = [
   "Хороша та розвинута інфраструктура",
   "Чудова транспортна розв'язка",
   "Правильне та комфортне планування",
];



const PropertiesView = () => {
   const theme = useTheme();
   const borderValue = `1px solid ${theme.palette.divider}`;
   const screenWidth = useWindowSize();

   const [loading, setLoading] = useState(true);
   const [propview, setPropview] = useState(null);
   const [totalItems, setTotalItems] = useState(0);
   const [advantages, setAdvantages] = useState(advantagesDemo);

   const [timeReview, setTimeReview] = useState(getMyFormatDate(new Date(), 'YYYY-MM-DDTHH-MM'));

   const { id } = useParams();
   // const searchParams = useSearchParams();
   // const pathname = usePathname();
   // const name = searchParams.get('name')

   useEffect(() => {
      const fetchPropView = async () => {
         try {
            // const res = await fetch(`/api/rcs/leadprop?page=${page}&pageSize=${pageSize}`);
            if (!id) return;
            const res = await fetch(`/api/rcs/leadprop/` + id);

            if (!res.ok) {
               throw new Error('Failed to get properties')
            };

            const data = await res.json();
            const { propObj } = data;

            setPropview(propObj)

         } catch (error) {
            console.log(error);
         } finally {
            setLoading(false)
         }
      };

      const checkAdvantages = property => {

         if (!property.advantages) return;
         if (property.advantages.length == 0) return;

         let newarr = [];
         for (let i = 0; i < property.advantages.length; i++) {
            let iA = property.advantages[i];
            console.log(iA);

            if (iA != '') {
               if (iA.length > 3) {
                  newarr.push(iA);
               }
            }
         };
         if (newarr.length > 0) {
            setAdvantages(newarr)
         }
      }

      if (propview === null) {
         fetchPropView();
      } else {
         checkAdvantages(propview)
      }

   }, [id, propview])




   return (

      <KrmLayout>
         {
            // !propview && !loading ?
            loading ?
               <Stack id="main"
                  direction="column"
                  margin={'10vw auto'}
               >
                  <StarIcon />
                  <Typography variant="h5" color="text.secondary" my={5} >Загрузка ...</Typography>
                  <StarIcon />
               </Stack>
               :
               !propview ?
                  <Stack id="main"
                     direction="column"
                     margin={'10vw auto'}
                  >
                     <StarIcon />
                     <Typography variant="h5" color="text.secondary" my={5} >Об'єкт нерухомості, на жаль, не знайдено</Typography>
                     <StarIcon />
                  </Stack>
                  :



                  <LayoutContainer>
                     <Stack id="main"
                        direction="row"
                        alignItems={{ xs: "flex-end", md: "center" }}
                        justifyContent="space-between"
                        pb={{ xs: "20px", md: "40px" }}
                        pt={{ xs: "20px", md: "90px" }}
                     >
                        <Stack
                           direction={{ xs: "column", md: "row" }}
                           alignItems={{ xs: "start", md: "center" }}
                           gap={2}
                        >
                           <Typography variant="h5" color="text.secondary">
                              {buildTitle(propview)}
                           </Typography>
                           <StyledLocationBox>
                              <Iconify icon="carbon:location" />
                              <Typography variant="body1" color="text.secondary">
                                 {propview?.location_text}
                              </Typography>
                           </StyledLocationBox>
                        </Stack>

                        <Stack direction="column">
                           <Typography variant="h6" color="text.primary">
                              Вартість
                           </Typography>
                           <Typography variant="subtitle1" color="text.secondary">
                              {propview?.cost}
                              {' '}
                              {checkFieldFront(propview?.currency, 'currency')}
                           </Typography>
                        </Stack>
                     </Stack>



                     <ViewCarousel id="gallery" images={propview?.images} />


                     <Grid container spacing={2} pb={{ xs: 3, md: 8 }} mt={5}>
                        <Grid id="description" item xs={12} md={6}>
                           <StyledBorderStack direction="column" gap={1}>
                              <Typography variant="subtitle1" color="text.secondary">
                                 Опис об'єкту
                              </Typography>
                              <Typography variant="body1" color="text.primary" mb={3}>
                                 {propview?.description}
                              </Typography>

                              <Divider variant="fullWidth" orientation="horizontal" />

                              <Stack
                                 direction="row"
                                 flexWrap={{ xs: "wrap", md: "nowrap" }}
                                 justifyContent="space-between"
                                 pt={2}
                              >
                                 <Stack
                                    direction="column"
                                    alignItems={'center'}
                                    gap={1}
                                    borderRight={borderValue}
                                    width={{ xs: "45%", md: "100%" }}
                                 >
                                    <Stack direction="row" alignItems="center" gap={1}>
                                       <Iconify
                                          icon="ic:outline-bed"
                                          sx={{ color: "text.primary" }}
                                       />
                                       <Typography variant="body1" color="text.primary">
                                          Кімнати
                                       </Typography>
                                    </Stack>
                                    <Typography variant="subtitle2" color="text.secondary">
                                       {propview?.rooms == 1 ? '1 кімната' : propview?.rooms <= 4 ? propview?.rooms + ' кімнати' : propview?.rooms + ' кімнат'}
                                    </Typography>
                                 </Stack>
                                 <Stack
                                    direction="column"
                                    alignItems={'center'}
                                    gap={1}
                                    borderRight={{ xs: "none", md: borderValue }}
                                    width={{ xs: "45%", md: "100%" }}
                                    pl={{ xs: 0, md: 2 }}
                                    pb={{ xs: 2, md: 0 }}
                                 >
                                    <Stack direction="row" alignItems="center" gap={1}>
                                       {/* <Iconify icon="uil:bath" sx={{ color: "text.primary" }} /> */}
                                       <LineWeightIcon sx={{ color: "text.primary" }} />
                                       <Typography variant="body1" color="text.primary">
                                          Поверх
                                       </Typography>
                                    </Stack>
                                    <Typography variant="subtitle2" color="text.secondary">
                                       {propview?.floor} / {propview?.floors} {checkFieldFront(propview?.type_walls, 'type_walls')}
                                    </Typography>
                                 </Stack>

                                 <Stack
                                    direction="column"
                                    alignItems={'center'}
                                    gap={1}
                                    width="100%"
                                    pl={{ xs: 0, md: 3 }}
                                    borderTop={{ xs: borderValue, md: "none" }}
                                    pt={{ xs: 2, md: 0 }}
                                    mt={screenWidth < 1000 ? 2 : 0}
                                 >
                                    <Stack direction="row" alignItems="center" gap={1}>
                                       <Iconify
                                          icon="mdi:surface-area"
                                          sx={{ color: "text.primary" }}
                                       />
                                       <Typography variant="body1" color="text.primary">
                                          Заг.пл/житл./кухня
                                       </Typography>
                                    </Stack>
                                    <Typography variant="subtitle2" color="text.secondary">
                                       {propview?.square_tot} / {propview?.square_liv} / {propview?.square_kit} {'м²'}
                                    </Typography>
                                 </Stack>
                              </Stack>
                           </StyledBorderStack>
                        </Grid>

                        <Grid id="amenities" item xs={12} md={6}>
                           <StyledBorderStack direction="column" gap={1}>
                              <Typography variant="subtitle1" color="text.secondary">
                                 Ключові переваги та плюси
                              </Typography>
                              {
                                 advantages.map((text, index) => (
                                    <StyledKeyBox key={index}>
                                       <Iconify icon="ph:lightning-fill" />
                                       <Typography variant="subtitle1" color="text.primary">
                                          {text}
                                       </Typography>
                                    </StyledKeyBox>
                                 ))

                              }
                           </StyledBorderStack>
                        </Grid>
                     </Grid>





                     {/* <FormPage /> */}
                     {/* <Details /> */}
                     {/* <AskedQuestionCarousel /> */}
                     <Stack id="review" py={1}>
                        <Box mb={5}>
                           <StarIcon />
                        </Box>
                        <Typography variant="h4" color="text.secondary" mb={1}>
                           Запис на огляд
                        </Typography>
                        <Typography variant="subtitle1" color="text.primary" mb={5}>
                           Ви можете вказати точний бажаний час огляду, написати додаткові побажання чи пропозиції у повідомленні або просто
                           залишити контакти. Наші менеджери з радістю зв'яжуться з Вами протягом 15хв
                        </Typography>

                        <Stack
                           border={`1px solid ${theme.palette.divider}`}
                           p={{ xs: "20px", md: "20px" }}
                           borderRadius="10px"
                        >
                           <Grid container spacing={2}>
                              <Grid item xs={12} md={4} lg={4} xl={3}>

                                 <TextField fullWidth label="Як до Вас звертатись?" variant='outlined' />
                                 {/* <TextField fullWidth label="Об'єкт нерухомості (кого?що?)" variant='standard' helperText="зразок: одно-кімнатну квартиру"
                              name='estateName'
                              value={fieldsData.estateName}
                              onChange={handleChangeData}
                              sx={styleRed} /> */}
                              </Grid>
                              <Grid item xs={12} md={4} lg={4}>
                                 <TextField fullWidth label="Телефон" variant='outlined' />
                              </Grid>
                              <Grid item xs={12} md={4} lg={4}>
                                 <TextField type='datetime-local' fullWidth label="Час бажаного огляду" variant='outlined'
                                    value={timeReview}
                                    onChange={e => setTimeReview(e.target.value)}
                                 />
                              </Grid>


                              <Grid item xs={12} md={8} lg={8}>
                                 <TextField fullWidth label="Ваше побажання" variant='outlined' />
                              </Grid>
                              <Grid item xs={12} md={4} lg={4}>
                                 <Button fullWidth variant="contained" color="primary">
                                    Відправити
                                 </Button>
                              </Grid>
                           </Grid>
                        </Stack>
                     </Stack>


                  </LayoutContainer>
         }
      </KrmLayout>
   );
};

export default PropertiesView;

