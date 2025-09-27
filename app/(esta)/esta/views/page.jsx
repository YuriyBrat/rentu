'use client'
import { useState, useEffect } from 'react';

import {
   styled, useTheme, Box, Typography, TextField, Divider,
   Container, Card, CardHeader, Grid, Stack, Button
} from '@mui/material';

// import PropertyCard from './PropertyCard';
import ViewCard from '@/krm/ViewCard';
import Spinner from '@/components/Spinner';
// import Pagination from './Pagination';

import { LayoutContainer } from '@/krm/container';
import KrmLayout from '@/krm/Layout-Krm';


import StarIcon from "@/estatein/components/icons/StarIcon";
import Iconify from '@/estatein/components/iconify/iconify';
import CustomIconSelect from '@/estatein/components/utils/CustomIconSelect';
import CustomMultiSelect from '@/estatein/components/utils/CustomMultiSelect';
import CustomBetweenSelect from '@/estatein/components/utils/CustomBetweenSelect';
import CustBetwElse from '@/estatein/components/utils/CustBetwElse';



import {
   BuildYear,
   LocationData,
   PriceRange,
   PropertySize,
   PropertyType,
} from "@/estatein/_moc_data/search";


const demoProps = [
//    {
//    _id: '9090921',
//    cost: '75000',
//    currency: '$',
//    title: 'Продаж красивої квартири з видом на парк з панорамню лоджією',
//    rooms: 1,
//    square_tot: 75,
//    square_liv: 40,
//    square_kit: 10,
//    floor: 5,
//    floors: 10,

//    images: ['/esta/assets/home/carousel-img.png', '/esta/assets/home/carousel-img1.png', '/esta/assets/home/carousel-img2.png']
// },
// {
//    _id: '90909255',
//    cost: '200000',
//    currency: '$',
//    title: 'Продаж дизайнерського будинку',
//    rooms: 5,
//    square_tot: 120,
//    square_liv: 40,
//    square_kit: 10,
//    floor: 2,
//    floors: 2,

//    images: ['/esta/assets/home/carousel-img.png']
// },
// {
//    _id: '9090977',
//    cost: '40000',
//    currency: '$',
//    title: 'Продаж компактної 1к квартири',
//    rooms: 1,
//    square_tot: 45,
//    square_liv: 29,
//    square_kit: 6,
//    floor: 1,
//    floors: 5,

//    images: []
// }
]


const ViewsProp = () => {
   const [leadprops, setLeadprops] = useState([]);
   const [loading, setLoading] = useState(false);
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(5);
   const [totalItems, setTotalItems] = useState(0);


   // const handlePageChange = newPage => {
   //    setPage(newPage)
   // }



   useEffect(() => {

      const fetchLeadProps = async () => {
         try {
            // const res = await fetch(`/api/rcs/leadprop?page=${page}&pageSize=${pageSize}`);
            const res = await fetch(`/api/rcs/leadprop`);

            if (!res.ok) {
               throw new Error('Failed to get properties')
            };

            const data = await res.json();
            const { leadprops, total } = data;
            if (leadprops) {
               leadprops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }
            setLeadprops(leadprops);
            setTotalItems(total)
            setLeadprops(prev => demoProps.concat(prev))
         } catch (error) {
            console.log(error);
         } finally {
            setLoading(false)
         }
      };
      fetchLeadProps()

   }, [page, pageSize]);

   const theme = useTheme();
   const colorGray = theme.palette.divider;
   const borderValue = `1px solid ${colorGray}`;

   const StyledRoomsStack = styled(Stack)(({ theme }) => ({
      padding: "5px 10px 3px 10px",
      border: `1px solid ${colorGray}`,
      borderRadius: "50px",
      gap: "5px",
   }));

   const StyledGradienthBox = styled(Box)(({ theme }) => ({
      background: `linear-gradient(154.12deg, rgb(38, 38, 38) -27.695%,rgba(38, 38, 38, 0) 40.055%)`,
      position: "relative",
      padding: "100px 0",
      [theme.breakpoints.down("sm")]: {
         padding: "50px 0",
      },
   }));

   const StyledWrapperBox = styled(Box)(({ theme }) => ({
      background: theme.palette.background.main,
      padding: "10px",
      borderRadius: "10px",
   }));

   const StyledSearchBox = styled(Box)(({ theme }) => ({
      padding: "10px ",
      width: "70%",
      margin: "0 auto",
      position: "absolute",
      bottom: "-40px",
      borderRadius: "10px",
      background: theme.palette.background.main,
      left: 0,
      right: 0,
      display: "flex",
      fieldset: {
         border: `1px solid ${theme.palette.divider} !important`,
      },
      input: {
         paddingRight: "165px",
         "&::placeholder": {
            color: theme.palette.text.primary,
         },
      },
      [theme.breakpoints.down("sm")]: {
         position: "relative",
         bottom: "-165px",
         width: "auto",
         input: {
            paddingRight: "82px ",
         },
      },
   }));

   return loading ? (<Spinner />) : (
      <>
         {/* <div>Total is {totalItems}</div> */}
         {/* {
            leadprops.map(prop => (
               <div key={prop?._id} >{prop?.location?.city}</div>
            ))
         } */}
         <KrmLayout>
            <LayoutContainer>

               <Stack mt={10}>
                  <StyledWrapperBox>
                     <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent={{
                           xs: "center",
                           md: "center",
                           lg: "center",
                           xl: "space-between",
                        }}
                        gap={1.5}
                        flexWrap="wrap"
                     >
                        <CustomMultiSelect
                           data={districtSearch}
                           icon="carbon:location"
                           placeholder="Райони Львова"
                        />

                        <CustomMultiSelect
                           icon="ic:outline-bed"
                           data={roomsSearch}
                           placeholder="К-сть кімнат"
                        // defaultChecked={selectedRooms}
                        // onChange={setSelectedRooms}
                        />
                        <CustomBetweenSelect
                           data={PropertySize}
                           icon="bi:box"
                           symbol="м²"
                           min="0"
                           max="1000"
                           placeholder="Площа загальна"
                        />
                        <CustomMultiSelect
                           data={typeHouseSearch}
                           icon="ic:outline-maps-home-work"
                           placeholder="Тип будинку"
                        />

                        {/* <Iconify icon="ic:outline-bed" fontSize='small' sx={{ color: "text.secondary" }} /> */}
                        <CustomBetweenSelect
                           data={PriceRange}
                           icon="material-symbols:price-change-outline"
                           symbol="$"
                           min="0"
                           max="1000000"
                           step = {1000}
                           placeholder="Вартість"
                        />
                     </Stack>
                  </StyledWrapperBox>
               </Stack>



               <Box mt={2} mb={2}>
                  <StarIcon />
               </Box>


               {
                  leadprops.length === 0
                     ?
                     <Typography variant="h3" color="text.secondary" mb={2}>Об'єктів не знайдено</Typography>
                     : (
                        // <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        // <Container >
                        <Grid container spacing={1} p={1} >
                           {/* <Grid id="description" item xs={12} md={6}></Grid> */}
                           {
                              leadprops.map(prop => (
                                 <ViewCard prop={prop} key={prop._id} />
                              ))
                           }
                           {/* </Container> */}
                        </Grid>
                     )
               }





            </LayoutContainer>
         </KrmLayout>
      </>
      // <section className="px-4 py-6">
      //    <div className="container-xl lg:container m-auto">
      //       {
      //          properties.length === 0
      //             ?
      //             <p>No properties found</p>
      //             : (
      //                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      //                   {
      //                      properties.map(property => (
      //                         <PropertyCard key={property._id} property={property} />
      //                      ))
      //                   }
      //                </div>
      //             )
      //       }

      //       <Pagination page={page} pageSize={pageSize} totalItems={totalItems}
      //          onPageChange={handlePageChange}
      //       />
      //    </div>
      // </section>
   )
}

export default ViewsProp;


export const roomsSearch = [
   {
      id: 1,
      value: "1",
      label: "1 кімната",
   },
   {
      id: 2,
      value: "2",
      label: "2 кімнати",
   },
   {
      id: 3,
      value: "3",
      label: "3 кімнати",
   },
   {
      id: 4,
      value: "4",
      label: "4 кімнати",
   },
   {
      id: 5,
      value: "5",
      label: "5 кімнат",
   },
   {
      id: 6,
      value: "6",
      label: "6 кімнат",
   },
];

export const districtSearch = [
   {
      id: 1,
      value: "франк",
      label: "Франківський р-н",
   },
   {
      id: 2,
      value: "сихів",
      label: "Сихівський р-н",
   },
   {
      id: 3,
      value: "залізн",
      label: "Залізничний р-н",
   },
   {
      id: 4,
      value: "личак",
      label: "Личаківський р-н",
   },
   {
      id: 5,
      value: "галич",
      label: "Галицький р-н",
   },
   {
      id: 6,
      value: "шевч",
      label: "Шевченківський р-н",
   },

];

export const typeHouseSearch = [
   {
      id: 1,
      value: "австр",
      label: "Австрійський",
   },
   {
      id: 2,
      value: "ав.люкс",
      label: "Австрійський люкс",
   },
   {
      id: 3,
      value: "хрущ",
      label: "Хрущовка",
   },
   {
      id: 4,
      value: "чешка",
      label: "Чешка",
   },
   {
      id: 5,
      value: "нов_00-10",
      label: "Новобуд 2000-2010рр",
   },
   {
      id: 5,
      value: "нов_10-20",
      label: "Новобуд 2010-2020рр",
   },
   {
      id: 6,
      value: "нов_від_20",
      label: "Новобуд від 2020р",
   },

];