'use client';
import { toast } from 'react-toastify';

import { useState, useCallback } from 'react';
import FileSaver from "file-saver";

import {
   Button, ButtonGroup, IconButton, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Box, Checkbox, Rating, Grid, Container, Divider,
   InputLabel, Select, MenuItem, FormControl
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send';


const genWord = () => {

   const [value, setValue] = useState('');

   const fieldsDataZero = {
      numberZS: '',
      placeZS: 'м. Львів',
      dateZS: '',
      nameFOP: "ФОП Рачун Юрій Тарасович",
      dateZSLast: '',

      zsCurrency: 'долар США',
      zsForex: '',
      zsAvans: '',
      zsAvansRP: '',
      estateCost: '',
      RP_Customer: '',


      estateName: 'одно-кімнатну квартиру',
      estateAdress: 'м.Львів, вулиця ',
      estateDocuments: '',

      customerPIB: '',
      cPassUkr: '',
      cPassElse: '',
      cIPN: '',
      cPassIssued: '',
      cPassDate: '',
      cPlaceRegister: '',

      sellerPIB: '',
      selPassUkr: '',
      selPassElse: '',
      selIPN: '',
      selPassIssued: '',
      selPassDate: '',
      selPlaceRegister: '',

      dateMoveOut: '',
      furnitureRemain: '',

      costsNotarDeal: 'Покупець',
      costsNotarCheking: 'Продавець',
      costsOcinka: 'Продавець',
      costs_5PPFO_15VZ: '',
      costs_1DM: 'Покупець',
      costs_1PF: 'Покупець',
      costsAdd: 'кожен свої',
      costsElse: '',

      perANremove: '0.35',  // вітсоток для АН якщо не було авансу для АН
   }

   const [fieldsData, setFieldsData] = useState(fieldsDataZero);


   const handleChangeData = (e) => {
      let { name, value } = e.target;
      // Check if nested property

      // if (name == "phone") {
      //   value = checkPhone(value);
      // }

      if (name.includes('.')) {
         const [outerKey, innerKey] = name.split('.');

         setFieldsData((prevFields) => ({
            ...prevFields,
            [outerKey]: {
               ...prevFields[outerKey],
               [innerKey]: value,
            },
         }));
      } else {
         // Not nested
         setFieldsData((prevFields) => ({
            ...prevFields,
            [name]: value,
         }));
      }
   };




   const generateDealZS = async () => {
      console.log('fetch genDealZS');
      try {
         let nameFile = 'ЗС Пулюя 30'                     // options.nameFile ? options.nameFile : 'Список';
         let dateMyFormat = '25.12.2025' // d.getMyFormatDate(new Date(), 'DD.MM.YY');
         let newNameFile = nameFile + ' ' + dateMyFormat + '.docx';


         await fetch('/api/rcs/genzs', {
            method: 'POST',
            body: JSON.stringify(fieldsData),
            headers: {
               ['Content-Type']: 'application/json'
            }
         })
            .then(response => {
               if (response.status == 200) {
                  toast.success('Договір успішно згенеровано!');
                  return response.blob();
               } else {
                  toast.error('На жаль, виникла помилка при генеруванні Договору!');
                  return false
               }
            })
            .then(function (blob) {
               if (blob) {
                  FileSaver.saveAs(blob, newNameFile);
               } else {
                  toast.error('На жаль, дивна помилка при генеруванні Договору!');
               }
               // FileSaver.saveAs(blob);
            });


      } catch (error) {
         console.log(error)
         toast.error('На жаль, фатальна помилка при генеруванні Договору!');
         throw new Error()
      } finally {
         setFieldsData(fieldsDataZero)
      }
   } //, []);

   const bgDiv = "#d0d1cf"

   return (
      <Stack spacing={4}>

         <Stack sx={{
            justifyContent: "center",
            alignItems: "center",
         }}>
            <Grid lg={8} md={10} xs={12} container rowSpacing={1} columnSpacing={1} sx={{
               background: "#f2f4f8"
            }}>
               <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                  <Divider>ДОГОВІР ЗАВДАТКУ КУПІВЛІ-ПРОДАЖУ</Divider>
               </Grid>

               <Grid item sm={2} xs={4}>
                  <TextField fullWidth label="№ Договору" variant='standard' helperText="зразок: 25/04"
                     name='numberZS'
                     value={fieldsData.numberZS}
                     onChange={handleChangeData}
                     sx={{
                        background: "#e2ffc8",
                     }} />
               </Grid>
               <Grid item sm={2} xs={4}>
                  <TextField fullWidth label="Місце Договору" variant='standard' helperText="зразок: м.Львів"
                     name='placeZS'
                     value={fieldsData.placeZS}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={3} xs={4}>
                  <TextField fullWidth label="Дата Договору" variant='standard' helperText="зразок: 27 жовтян 2022р"
                     name='dateZS'
                     value={fieldsData.dateZS}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={5} xs={12}>
                  <TextField fullWidth label="ФОП угоди" variant='standard' helperText="зразок: ФОП Рачун Юрій Тарасович"
                     name='nameFOP'
                     value={fieldsData.nameFOP}
                     onChange={handleChangeData} />
               </Grid>



               <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                  <Divider>ПОКУПЕЦЬ</Divider>
               </Grid>

               <Grid item sm={4} xs={12}>
                  <TextField fullWidth label="ПІБ" variant='standard' helperText="зразок: Іванов Іван Іванович"
                     name='customerPIB'
                     value={fieldsData.customerPIB}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={5} xs={12}>
                  <TextField fullWidth label="Місце реєстрації" variant='standard' helperText="зразок: м.Львів, вул. Кульпарківська,139, квартира 602"
                     name='cPlaceRegister'
                     value={fieldsData.cPlaceRegister}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={3} xs={6}>
                  <TextField fullWidth label="ІПН" variant='standard' helperText="зразок: 3445678451"
                     name='cIPN'
                     value={fieldsData.cIPN}
                     onChange={handleChangeData} />
               </Grid>


               <Grid item sm={3} xs={6}>
                  <TextField fullWidth label="Серія та № паспорту" variant='standard' helperText="зразок: КА №715409"
                     name='cPassUkr'
                     value={fieldsData.cPassUkr}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={6} xs={8}>
                  <TextField fullWidth label="Ким видано паспорт" variant='standard' helperText="зразок: Шевченківським РВ ЛМУ УМВС України у Львівській області"
                     name='cPassIssued'
                     value={fieldsData.cPassIssued}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={3} xs={4}>
                  <TextField fullWidth label="Дата видачі паспорту" variant='standard' helperText="зразок: 18 червня 1998 року"
                     name='cPassDate'
                     value={fieldsData.cPassDate}
                     onChange={handleChangeData} />
               </Grid>

               <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                  <Divider>ПРОДАВЕЦЬ</Divider>
               </Grid>

               <Grid item sm={4} xs={12}>
                  <TextField fullWidth label="ПІБ" variant='standard' helperText="зразок: Іванов Іван Іванович"
                     name='sellerPIB'
                     value={fieldsData.sellerPIB}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={5} xs={12}>
                  <TextField fullWidth label="Місце реєстрації" variant='standard' helperText="зразок: м.Львів, вул. Кульпарківська,139, квартира 602"
                     name='selPlaceRegister'
                     value={fieldsData.selPlaceRegister}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={3} xs={6}>
                  <TextField fullWidth label="ІПН" variant='standard' helperText="зразок: 3445678451"
                     name='selIPN'
                     value={fieldsData.selIPN}
                     onChange={handleChangeData} />
               </Grid>


               <Grid item sm={3} xs={6}>
                  <TextField fullWidth label="Серія та № паспорту" variant='standard' helperText="зразок: КА №715409"
                     name='selPassUkr'
                     value={fieldsData.selPassUkr}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={6} xs={8}>
                  <TextField fullWidth label="Ким видано паспорт" variant='standard' helperText="зразок: Шевченківським РВ ЛМУ УМВС України у Львівській області"
                     name='selPassIssued'
                     value={fieldsData.selPassIssued}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={3} xs={4}>
                  <TextField fullWidth label="Дата видачі паспорту" variant='standard' helperText="зразок: 18 червня 1998 року"
                     name='selPassDate'
                     value={fieldsData.selPassDate}
                     onChange={handleChangeData} />
               </Grid>


               <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                  <Divider>ІСТОТНІ УМОВИ ДОГОВОРУ</Divider>
               </Grid>

               <Grid item sm={2} xs={4}>
                  <TextField fullWidth label="Вартість Об'єкту" variant='standard'
                     name='estateCost'
                     value={fieldsData.estateCost}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={2} xs={4}>
                  <TextField fullWidth label="Валюта Договору" variant='standard'
                     name='zsCurrency'
                     value={fieldsData.zsCurrency}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={2} xs={4}>
                  <TextField fullWidth label="Сума ЗАВДАТКУ" variant='standard'
                     name='zsAvans'
                     value={fieldsData.zsAvans}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={2} xs={4}>
                  <TextField fullWidth label="Завдаток Агентству" variant='standard'
                     name='zsAvansRP'
                     value={fieldsData.zsAvansRP}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={2} xs={4}>
                  <TextField fullWidth label="Рієлторська комісія" variant='standard'
                     name='RP_Customer'
                     value={fieldsData.RP_Customer}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={2} xs={4}>
                  <TextField fullWidth label="Курс для Договору" variant='standard'
                     name='zsForex'
                     value={fieldsData.zsForex}
                     onChange={handleChangeData} />
               </Grid>



               <Grid item sm={4} xs={12}>
                  <TextField fullWidth label="Об'єкт нерухомості (кого?що?)" variant='standard' helperText="зразок: одно-кімнатну квартиру"
                     name='estateName'
                     value={fieldsData.estateName}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={8} xs={12}>
                  <TextField fullWidth label="Адреса Об'єкту" variant='standard' helperText="зразок: м.Львів, вулиця Замарстинівська 170, проектний номер №03/5"
                     name='estateAdress'
                     value={fieldsData.estateAdress}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={9} xs={12}>
                  <TextField fullWidth label="Документи на право власності" variant='standard' helperText='зразок: Договір купівлі-продажу від 05.06.2006року, серія №5174'
                     name='estateDocuments'
                     value={fieldsData.estateDocuments}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={3} xs={6}>
                  <TextField fullWidth label="Дата переоформлення" variant='standard' helperText='зразок: 31 грудня 2025 року'
                     name='dateZSLast'
                     value={fieldsData.dateZSLast}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={3} xs={6}>
                  <TextField fullWidth label="Дата звільнення" variant='standard' helperText='зразок: 31 грудня 2025 року'
                     name='dateMoveOut'
                     value={fieldsData.dateMoveOut}
                     onChange={handleChangeData} />
               </Grid>
               <Grid item sm={9} xs={12}>
                  <TextField fullWidth label="Залишають меблі та техніка" variant='standard' helperText='зразок: усі двері, уся сантехніка, кухонний гарнітур, газова плита, шафа-купе'
                     name='furnitureRemain'
                     value={fieldsData.furnitureRemain}
                     onChange={handleChangeData} />
               </Grid>
               

               <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                  <Divider>ДОДАТКОВІ ПЛАТЕЖІ</Divider>
               </Grid>

               <Grid item sm={3} xs={6}>
                  <FormControl fullWidth variant='standard' >
                     <InputLabel id="demo-simple-select-label">Нотаріальний договір</InputLabel>
                     <Select
                        labelId="demo-simple-select-label"
                        // id="demo-simple-select"
                        // value={age}
                        // label="Age"
                        name='costsNotarDeal'
                        value={fieldsData.costsNotarDeal}
                        onChange={handleChangeData}
                     >
                        <MenuItem value="Покупець">Покупець</MenuItem>
                        <MenuItem value="Продавець">Продавець</MenuItem>
                        <MenuItem value="Продавець та Покупець пополам">Продавець та Покупець пополам</MenuItem>
                        <MenuItem value="Агентство нерухомості">Агентство нерухомості</MenuItem>
                        <MenuItem value="кожен свої">кожен свої</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item sm={3} xs={6}>
                  <FormControl fullWidth variant='standard' >
                     <InputLabel id="demo-simple-select-label">1% Пенсійний фонд</InputLabel>
                     <Select
                        labelId="demo-simple-select-label"
                        name='costs_1PF'
                        value={fieldsData.costs_1PF}
                        onChange={handleChangeData}
                     >
                        <MenuItem value="Покупець">Покупець</MenuItem>
                        <MenuItem value="Продавець">Продавець</MenuItem>
                        <MenuItem value="Продавець та Покупець пополам">Продавець та Покупець пополам</MenuItem>
                        <MenuItem value="Агентство нерухомості">Агентство нерухомості</MenuItem>
                        <MenuItem value="кожен свої">кожен свої</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item sm={3} xs={6}>
                  <FormControl fullWidth variant='standard' >
                     <InputLabel id="demo-simple-select-label">1% Державне мито</InputLabel>
                     <Select
                        labelId="demo-simple-select-label"
                        name='costs_1DM'
                        value={fieldsData.costs_1DM}
                        onChange={handleChangeData}
                     >
                        <MenuItem value="Покупець">Покупець</MenuItem>
                        <MenuItem value="Продавець">Продавець</MenuItem>
                        <MenuItem value="Продавець та Покупець пополам">Продавець та Покупець пополам</MenuItem>
                        <MenuItem value="Агентство нерухомості">Агентство нерухомості</MenuItem>
                        <MenuItem value="кожен свої">кожен свої</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item sm={3} xs={6}>
                  <FormControl fullWidth variant='standard' >
                     <InputLabel id="demo-simple-select-label">Нотаріальні довідки об'єкту</InputLabel>
                     <Select
                        labelId="demo-simple-select-label"
                        name='costsNotarCheking'
                        value={fieldsData.costsNotarCheking}
                        onChange={handleChangeData}
                     >
                        <MenuItem value="Покупець">Покупець</MenuItem>
                        <MenuItem value="Продавець">Продавець</MenuItem>
                        <MenuItem value="Продавець та Покупець пополам">Продавець та Покупець пополам</MenuItem>
                        <MenuItem value="Агентство нерухомості">Агентство нерухомості</MenuItem>
                        <MenuItem value="кожен свої">кожен свої</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item sm={3} xs={6}>
                  <FormControl fullWidth variant='standard' >
                     <InputLabel id="demo-simple-select-label">Експертна оцінка об'єкту</InputLabel>
                     <Select
                        labelId="demo-simple-select-label"
                        name='costsOcinka'
                        value={fieldsData.costsOcinka}
                        onChange={handleChangeData}
                     >
                        <MenuItem value="Покупець">Покупець</MenuItem>
                        <MenuItem value="Продавець">Продавець</MenuItem>
                        <MenuItem value="Продавець та Покупець пополам">Продавець та Покупець пополам</MenuItem>
                        <MenuItem value="Агентство нерухомості">Агентство нерухомості</MenuItem>
                        <MenuItem value="кожен свої">кожен свої</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item sm={3} xs={6}>
                  <FormControl fullWidth variant='standard' >
                     <InputLabel id="demo-simple-select-label">Додаткові витрати</InputLabel>
                     <Select
                        labelId="demo-simple-select-label"
                        name='costsAdd'
                        value={fieldsData.costsAdd}
                        onChange={handleChangeData}
                     >
                        <MenuItem value="Покупець">Покупець</MenuItem>
                        <MenuItem value="Продавець">Продавець</MenuItem>
                        <MenuItem value="Продавець та Покупець пополам">Продавець та Покупець пополам</MenuItem>
                        <MenuItem value="Агентство нерухомості">Агентство нерухомості</MenuItem>
                        <MenuItem value="кожен свої">кожен свої</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item sm={6} xs={12}>
                  <FormControl fullWidth variant='standard' >
                     <InputLabel id="demo-simple-select-label">5% ПДФО та 5% військовий збір, якщо є</InputLabel>
                     <Select
                        labelId="demo-simple-select-label"
                        name='costs_5PPFO_15VZ'
                        value={fieldsData.costs_5PPFO_15VZ}
                        onChange={handleChangeData}
                     >
                        <MenuItem value="Покупець">Покупець</MenuItem>
                        <MenuItem value="Продавець">Продавець</MenuItem>
                        <MenuItem value="Продавець та Покупець пополам">Продавець та Покупець пополам</MenuItem>
                        <MenuItem value="Агентство нерухомості">Агентство нерухомості</MenuItem>
                        <MenuItem value="кожен свої">кожен свої</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
               

               <Grid item xs={12}>
                  <TextField fullWidth label="Будь-які інші витрати поза списком, які прописуються окремим пунктом у договорі" variant='standard' helperText='зразок: виготовлення документації на підключення світла оплачує Продавець'
                     name='costsElse'
                     value={fieldsData.costsElse}
                     onChange={handleChangeData} />
               </Grid>



               {/* <Grid item xs={12} mt={2}>
                  <Divider>ЮРИДИЧНІ ДЕТАЛІ ДОГОВОРУ</Divider>
               </Grid>
               <Grid item xs={12}>
                  <TextField fullWidth label="ФОП агентства" variant='standard' helperText="зразок: ФОП Рачун Юрій Тарасович"
                     name='nameFOP'
                     value={fieldsData.nameFOP}
                     onChange={handleChangeData} />
               </Grid> */}

            </Grid>
         </Stack>


         <Stack spacing={1} direction="row"
            sx={{
               justifyContent: "center",
               alignItems: "center",
            }}>

            <Button variant='contained' color="secondary" endIcon={<SendIcon />}
               disableRipple
               // onClick={() => alert('Click')}
               onClick={e => generateDealZS()}
            >Згенерувати договір завдатку</Button>
         </Stack>
      </Stack>
   )
}

export default genWord