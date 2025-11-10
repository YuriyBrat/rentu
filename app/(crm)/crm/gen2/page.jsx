'use client';

import { useState } from 'react';
import {
   Container,
   Paper,
   Grid,
   Stack,
   TextField,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   Button,
   Divider,
   Typography,
   useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'react-toastify';
import FileSaver from 'file-saver';
import { getMyFormatDate } from '@/hooks/date.hook';

export default function GenContractPage() {
   const theme = useTheme();

   const colFulled = '#e2ffc8';
   const colRed = '#f6cede';
   const colEmpty = theme.palette.background.default;

   const [fieldsData, setFieldsData] = useState({
      numberZS: '',
      placeZS: 'м. Львів',
      dateZS: '',
      nameFOP: 'ФОП Рачун Юрій Тарасович',
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
      cPlaceRegister: '',
      cIPN: '',
      cPassUkr: '',
      cPassIssued: '',
      cPassDate: '',
      sellerPIB: '',
      selPlaceRegister: '',
      selIPN: '',
      selPassUkr: '',
      selPassIssued: '',
      selPassDate: '',
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
   });

   const handleChangeData = (e) => {
      const { name, value } = e.target;
      setFieldsData((prev) => ({ ...prev, [name]: value }));
   };

   const getFieldStyle = (value, required = false) => {
      if (value && value.trim() !== '') return { background: colFulled };
      if (required) return { background: colRed };
      return { background: colEmpty };
   };

   const generateDealZS = async (kind = 'zs') => {
      try {
         let nameFile = fieldsData.estateAdress || 'договір';
         const dateMyFormat = getMyFormatDate(new Date(), 'DD.MM.YY');
         nameFile = `${kind === 'zs' ? 'ЗС' : 'РП'} ${nameFile} ${dateMyFormat}.docx`;

         const response = await fetch('/api/rcs/genzs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fieldsData, kind, nameFile }),
         });

         if (response.status === 200) {
            toast.success('Договір успішно згенеровано!');
            const blob = await response.blob();
            FileSaver.saveAs(blob, nameFile);
         } else {
            toast.error('Помилка при генеруванні договору.');
         }
      } catch (err) {
         console.error(err);
         toast.error('Фатальна помилка при генеруванні договору.');
      }
   };

   const SectionDivider = ({ title }) => (
      <Divider
         sx={{
            my: 3,
            '&::before, &::after': {
               borderColor: theme.palette.divider,
            },
         }}
      >
         <Typography
            variant="subtitle1"
            fontWeight={600}
            color="text.primary"
            sx={{
               px: 2,
               bgcolor: theme.palette.background.paper,
               borderRadius: 2,
            }}
         >
            {title}
         </Typography>
      </Divider>
   );

   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
         <Paper
            elevation={6}
            sx={{
               p: { xs: 2, md: 4 },
               borderRadius: 3,
               bgcolor: theme.palette.mode === 'dark' ? '#1e1e2f' : '#f9fafc',
            }}
         >
            <Typography
               variant="h5"
               align="center"
               fontWeight={700}
               sx={{ mb: 3, color: theme.palette.text.primary }}
            >
               Договір завдатку купівлі-продажу
            </Typography>

            <Grid container spacing={2}>
               {/* --- Загальні дані договору --- */}
               <SectionDivider title="Основні дані" />

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="№ Договору"
                     name="numberZS"
                     value={fieldsData.numberZS}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.numberZS)}
                  />
               </Grid>

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="Місце Договору"
                     name="placeZS"
                     value={fieldsData.placeZS}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.placeZS, true)}
                  />
               </Grid>

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="Дата Договору"
                     name="dateZS"
                     value={fieldsData.dateZS}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.dateZS)}
                  />
               </Grid>

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="ФОП угоди"
                     name="nameFOP"
                     value={fieldsData.nameFOP}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.nameFOP, true)}
                  />
               </Grid>

               {/* --- ПОКУПЕЦЬ --- */}
               <SectionDivider title="Покупець" />

               <Grid item xs={12} sm={4}>
                  <TextField
                     fullWidth
                     label="ПІБ"
                     name="customerPIB"
                     value={fieldsData.customerPIB}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.customerPIB, true)}
                  />
               </Grid>

               <Grid item xs={12} sm={5}>
                  <TextField
                     fullWidth
                     label="Місце реєстрації"
                     name="cPlaceRegister"
                     value={fieldsData.cPlaceRegister}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.cPlaceRegister)}
                  />
               </Grid>

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="ІПН"
                     name="cIPN"
                     value={fieldsData.cIPN}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.cIPN)}
                  />
               </Grid>

               {/* --- ПРОДАВЕЦЬ --- */}
               <SectionDivider title="Продавець" />

               <Grid item xs={12} sm={4}>
                  <TextField
                     fullWidth
                     label="ПІБ"
                     name="sellerPIB"
                     value={fieldsData.sellerPIB}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.sellerPIB, true)}
                  />
               </Grid>

               <Grid item xs={12} sm={5}>
                  <TextField
                     fullWidth
                     label="Місце реєстрації"
                     name="selPlaceRegister"
                     value={fieldsData.selPlaceRegister}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.selPlaceRegister)}
                  />
               </Grid>

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="ІПН"
                     name="selIPN"
                     value={fieldsData.selIPN}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.selIPN)}
                  />
               </Grid>

               {/* --- Істотні умови --- */}
               <SectionDivider title="Істотні умови" />

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="Вартість об'єкту"
                     name="estateCost"
                     value={fieldsData.estateCost}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.estateCost)}
                  />
               </Grid>

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="Валюта договору"
                     name="zsCurrency"
                     value={fieldsData.zsCurrency}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.zsCurrency, true)}
                  />
               </Grid>

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="Сума завдатку"
                     name="zsAvans"
                     value={fieldsData.zsAvans}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.zsAvans)}
                  />
               </Grid>

               <Grid item xs={12} sm={3}>
                  <TextField
                     fullWidth
                     label="Завдаток агентству"
                     name="zsAvansRP"
                     value={fieldsData.zsAvansRP}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.zsAvansRP)}
                  />
               </Grid>

               <Grid item xs={12} sm={6}>
                  <TextField
                     fullWidth
                     label="Тип об'єкту"
                     name="estateName"
                     value={fieldsData.estateName}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.estateName, true)}
                  />
               </Grid>

               <Grid item xs={12} sm={6}>
                  <TextField
                     fullWidth
                     label="Адреса об'єкту"
                     name="estateAdress"
                     value={fieldsData.estateAdress}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.estateAdress, true)}
                  />
               </Grid>

               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Документи на право власності"
                     name="estateDocuments"
                     value={fieldsData.estateDocuments}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.estateDocuments)}
                  />
               </Grid>

               {/* --- Додаткові платежі --- */}
               <SectionDivider title="Додаткові платежі" />

               {[
                  ['costsNotarDeal', 'Нотаріальний договір'],
                  ['costs_1PF', '1% Пенсійний фонд'],
                  ['costs_1DM', '1% Держмито'],
                  ['costsNotarCheking', 'Нотаріальні довідки'],
                  ['costsOcinka', 'Експертна оцінка'],
                  ['costsAdd', 'Інші витрати'],
                  ['costs_5PPFO_15VZ', '5% ПДФО + військовий збір'],
               ].map(([name, label]) => (
                  <Grid item xs={12} sm={6} md={4} key={name}>
                     <FormControl fullWidth variant="standard">
                        <InputLabel>{label}</InputLabel>
                        <Select
                           name={name}
                           value={fieldsData[name]}
                           onChange={handleChangeData}
                        >
                           <MenuItem value=""></MenuItem>
                           <MenuItem value="Покупець">Покупець</MenuItem>
                           <MenuItem value="Продавець">Продавець</MenuItem>
                           <MenuItem value="Продавець та Покупець пополам">
                              Продавець та Покупець пополам
                           </MenuItem>
                           <MenuItem value="Агентство нерухомості">
                              Агентство нерухомості
                           </MenuItem>
                           <MenuItem value="кожен свої">кожен свої</MenuItem>
                        </Select>
                     </FormControl>
                  </Grid>
               ))}

               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Будь-які інші витрати (опис)"
                     name="costsElse"
                     value={fieldsData.costsElse}
                     onChange={handleChangeData}
                     sx={getFieldStyle(fieldsData.costsElse)}
                  />
               </Grid>

               {/* --- Кнопки --- */}
               <Grid item xs={12} mt={3}>
                  <Stack
                     direction={{ xs: 'column', sm: 'row' }}
                     spacing={2}
                     justifyContent="center"
                  >
                     <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<SendIcon />}
                        onClick={() => generateDealZS('zs')}
                     >
                        Згенерувати договір завдатку
                     </Button>

                     <Button
                        variant="contained"
                        color="success"
                        endIcon={<SendIcon />}
                        onClick={() => generateDealZS('rp')}
                     >
                        Згенерувати договір послуг
                     </Button>
                  </Stack>
               </Grid>
            </Grid>
         </Paper>
      </Container>
   );
}
