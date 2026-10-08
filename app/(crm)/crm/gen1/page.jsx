'use client';
import { toast } from 'react-toastify';

import { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import FileSaver from "file-saver";

import '@/assets/styles/globals.css';

import {
   Button, ButtonGroup, IconButton, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Box, Checkbox, Rating, Grid, Container, Divider,
   InputLabel, Select, MenuItem, FormControl, Autocomplete,
   Table, TableHead, TableBody, TableRow, TableCell, Typography, Chip, Collapse, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import DriveFileMoveRoundedIcon from '@mui/icons-material/DriveFileMoveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import { getMyFormatDate } from "@/hooks/date.hook";

const formatContractDate = (date = new Date()) => {
   const months = [
      'січня',
      'лютого',
      'березня',
      'квітня',
      'травня',
      'червня',
      'липня',
      'серпня',
      'вересня',
      'жовтня',
      'листопада',
      'грудня',
   ];

   return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}р`;
};

const getPropertyLabel = (property) => {
   if (!property) return '';
   const title = property.rentOptions?.rentTitle || property.title || '';
   const location = property.location_text || [property.location?.city, property.location?.street, property.location?.number].filter(Boolean).join(', ');
   const price = property.cost ? `${property.cost} ${property.currency || ''}`.trim() : '';

   return [title, location, price].filter(Boolean).join(' | ');
};

const getLeadLabel = (lead) => {
   if (!lead) return '';
   const phone = Array.isArray(lead.phones) ? lead.phones.find(Boolean) : '';
   const stage = lead.stage ? `етап: ${lead.stage}` : '';

   return [lead.name, phone, stage].filter(Boolean).join(' | ');
};

const documentTypeLabel = {
   sale_deposit: 'Договір завдатку продажу',
   sale_buyer_service: 'Договір послуг з покупцем',
   sale_seller_service: 'Договір послуг з продавцем',
   rent_deposit: 'Договір завдатку оренди',
   rent_service: 'Договір послуг оренди',
};

const formatDateTime = (value) => {
   if (!value) return '';
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return '';

   return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   });
};

const fieldLabelMap = {
   numberZS: '№ договору',
   placeZS: 'Місце договору',
   dateZS: 'Дата договору',
   nameFOP: 'ФОП угоди',
   estateCost: "Вартість об'єкту",
   zsCurrency: 'Валюта договору',
   zsAvans: 'Сума завдатку',
   zsAvansRP: 'Завдаток агентству',
   RP_Customer: 'Рієлторська комісія',
   zsForex: 'Курс для договору',
   estateName: "Об'єкт нерухомості",
   estateAdress: "Адреса об'єкту",
   estateDocuments: 'Документи на право власності',
   customerPIB: 'ПІБ покупця',
   cPlaceRegister: 'Місце реєстрації покупця',
   cIPN: 'ІПН покупця',
   cPassUkr: 'Паспорт покупця',
   cPassIssued: 'Ким видано паспорт покупця',
   cPassDate: 'Дата видачі паспорту покупця',
   sellerPIB: 'ПІБ продавця',
   selPlaceRegister: 'Місце реєстрації продавця',
   selIPN: 'ІПН продавця',
   selPassUkr: 'Паспорт продавця',
   selPassIssued: 'Ким видано паспорт продавця',
   selPassDate: 'Дата видачі паспорту продавця',
   dateZSLast: 'Дата переоформлення',
   dateMoveOut: 'Дата звільнення',
   furnitureRemain: 'Залишають меблі та техніка',
   costsNotarDeal: 'Нотаріальний договір',
   costsNotarCheking: "Нотаріальні довідки об'єкту",
   costsOcinka: "Експертна оцінка об'єкту",
   costs_5PPFO_15VZ: '5% ПДФО та військовий збір',
   costs_1DM: '1% Державне мито',
   costs_1PF: '1% Пенсійний фонд',
   costsAdd: 'Додаткові витрати',
   costsElse: 'Інші витрати',
};

const getSnapshotEntries = (snapshot = {}) => Object.entries(snapshot || {})
   .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
   .map(([key, value]) => ({
      key,
      label: fieldLabelMap[key] || key,
      value: String(value),
   }));

const genWord = () => {

   const [value, setValue] = useState('');

   const bgDiv = "#d0d1cf"
   const colFulled = "#e2ffc8"
   const colEmpty = 'rgb(242, 244, 248)'
   const colRed = '#f6cede'
   const sectionDividerSx = {
      color: '#111827',
      fontWeight: 700,
      letterSpacing: 0.4,
      '&::before, &::after': {
         borderColor: 'rgba(17,24,39,0.75)',
      },
   };
   const styleFulled = {
      background: colFulled,
   };
   const styleRed = {
      background: colRed,
   }

   const fieldsDataZero = {
      numberZS: '',
      placeZS: 'м. Львів',
      dateZS: formatContractDate(),
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
   const [selectedProperty, setSelectedProperty] = useState(null);
   const [selectedLead, setSelectedLead] = useState(null);
   const [propertyOptions, setPropertyOptions] = useState([]);
   const [leadOptions, setLeadOptions] = useState([]);
   const [propertySearch, setPropertySearch] = useState('');
   const [leadSearch, setLeadSearch] = useState('');
   const skipNextPropertySearchRef = useRef(false);
   const skipNextLeadSearchRef = useRef(false);
   const [documentsOpen, setDocumentsOpen] = useState(false);
   const [documentRows, setDocumentRows] = useState([]);
   const [documentsLoading, setDocumentsLoading] = useState(false);
   const [documentsError, setDocumentsError] = useState('');
   const [expandedDocumentId, setExpandedDocumentId] = useState('');
   const [pendingDeleteDocument, setPendingDeleteDocument] = useState(null);
   const [deleteInProgress, setDeleteInProgress] = useState(false);

   useEffect(() => {
      if (skipNextPropertySearchRef.current) {
         skipNextPropertySearchRef.current = false;
         return undefined;
      }

      const controller = new AbortController();
      const timeout = setTimeout(async () => {
         try {
            const params = new URLSearchParams({ target: 'properties', limit: '10' });
            if (propertySearch.trim()) params.set('q', propertySearch.trim());

            const response = await fetch(`/api/crm/document-generations/search?${params.toString()}`, {
               cache: 'no-store',
               signal: controller.signal,
            });
            if (!response.ok) return;

            const data = await response.json();
            setPropertyOptions(Array.isArray(data.items) ? data.items : []);
         } catch (error) {
            if (error?.name === 'AbortError') return;
            console.log(error);
         }
      }, 300);

      return () => {
         clearTimeout(timeout);
         controller.abort();
      };
   }, [propertySearch]);

   useEffect(() => {
      if (skipNextLeadSearchRef.current) {
         skipNextLeadSearchRef.current = false;
         return undefined;
      }

      const controller = new AbortController();
      const timeout = setTimeout(async () => {
         try {
            const params = new URLSearchParams({ target: 'leads', limit: '10' });
            if (leadSearch.trim()) params.set('q', leadSearch.trim());

            const response = await fetch(`/api/crm/document-generations/search?${params.toString()}`, {
               cache: 'no-store',
               signal: controller.signal,
            });
            if (!response.ok) return;

            const data = await response.json();
            setLeadOptions(Array.isArray(data.items) ? data.items : []);
         } catch (error) {
            if (error?.name === 'AbortError') return;
            console.log(error);
         }
      }, 300);

      return () => {
         clearTimeout(timeout);
         controller.abort();
      };
   }, [leadSearch]);


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

      if (e.target.tagName == 'INPUT') {
         if (value != "") {
            if (value.trim() != "") {
               e.target.style = styleFulled
               e.target.parentElement.parentElement.style.background = colFulled
               // console.log(e.target.tagName);
            } else {
               e.target.parentElement.parentElement.style.background = colEmpty
            }
         } else {
            e.target.parentElement.parentElement.style.background = colEmpty
         }
      }
   };

   const handlePropertySelect = (property) => {
      setSelectedProperty(property);
      skipNextPropertySearchRef.current = true;
      setPropertySearch(property ? getPropertyLabel(property) : '');
   };

   const handleLeadSelect = (lead) => {
      setSelectedLead(lead);
      skipNextLeadSearchRef.current = true;
      setLeadSearch(lead ? getLeadLabel(lead) : '');

      if (!lead) return;

      setFieldsData((prev) => ({
         ...prev,
         customerPIB: lead.name || prev.customerPIB,
      }));
   };

   const fetchDocumentRows = async () => {
      setDocumentsLoading(true);
      setDocumentsError('');

      try {
         const response = await fetch('/api/crm/document-generations?documentDomain=sale&pageSize=50', {
            cache: 'no-store',
         });
         if (!response.ok) throw new Error('Не вдалося завантажити базу договорів');

         const data = await response.json();
         setDocumentRows(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
         setDocumentsError(error?.message || 'Помилка завантаження бази договорів');
      } finally {
         setDocumentsLoading(false);
      }
   };

   const openDocumentsBase = async () => {
      setDocumentsOpen(true);
      await fetchDocumentRows();
   };

   const saveCurrentFormToBase = async () => {
      setDocumentsError('');

      try {
         const response = await fetch('/api/crm/document-generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               fieldsData,
               documentType: 'sale_deposit',
               propertyId: selectedProperty?._id || null,
               leadId: selectedLead?._id || null,
            }),
         });

         if (!response.ok) throw new Error('Не вдалося зберегти форму в базу');

         toast.success('Договір збережено в базу');
         await fetchDocumentRows();
      } catch (error) {
         setDocumentsError(error?.message || 'Помилка збереження договору');
         toast.error(error?.message || 'Помилка збереження договору');
      }
   };

   const loadDocumentToForm = (item) => {
      setFieldsData((prev) => ({
         ...prev,
         ...(item?.fieldsSnapshot || {}),
      }));

      setSelectedProperty(item?.property || null);
      skipNextPropertySearchRef.current = true;
      setPropertySearch(item?.property ? getPropertyLabel(item.property) : '');

      setSelectedLead(item?.lead || null);
      skipNextLeadSearchRef.current = true;
      setLeadSearch(item?.lead ? getLeadLabel(item.lead) : '');

      setDocumentsOpen(false);
      toast.success('Договір завантажено у форму');
   };

   const requestDeleteDocument = (item) => {
      setPendingDeleteDocument(item);
   };

   const closeDeleteDialog = () => {
      if (deleteInProgress) return;
      setPendingDeleteDocument(null);
   };

   const deleteDocumentRow = async () => {
      if (!pendingDeleteDocument?._id) return;
      setDeleteInProgress(true);

      try {
         const response = await fetch(`/api/crm/document-generations/${pendingDeleteDocument._id}`, {
            method: 'DELETE',
         });

         if (!response.ok) throw new Error('Не вдалося видалити договір');

         toast.success('Договір видалено');
         setPendingDeleteDocument(null);
         await fetchDocumentRows();
      } catch (error) {
         setDocumentsError(error?.message || 'Помилка видалення договору');
         toast.error(error?.message || 'Помилка видалення договору');
      } finally {
         setDeleteInProgress(false);
      }
   };

   const downloadDocumentFromBase = async (item) => {
      const kind = item?.documentType === 'sale_buyer_service' ? 'rp' : 'zs';

      await generateDealZS(kind, {
         fieldsData: item?.fieldsSnapshot || {},
         nameFile: item?.fileName || '',
         propertyId: item?.property?._id || item?.property || null,
         leadId: item?.lead?._id || item?.lead || null,
         saveLog: false,
      });
   };




   const generateDealZS = async (kind = 'zs', options = {}) => {
      console.log('fetch genDealZS');
      try {
         const generationFields = options.fieldsData || fieldsData;
         let nameFile = options.nameFile || generationFields.estateAdress || 'Договір';
         let dateMyFormat = getMyFormatDate(new Date(), 'DD.MM.YY');
         if (!options.nameFile && kind == 'zs') {
            nameFile = 'ЗС ' + nameFile
         } else if (!options.nameFile && kind == 'rp') {
            nameFile = 'РП ' + nameFile
         }

         if (!nameFile.endsWith('.docx')) {
            nameFile = nameFile + ' ' + dateMyFormat + '.docx';
         }


         await fetch('/api/rcs/genzs', {
            method: 'POST',
            body: JSON.stringify({
               fieldsData: generationFields,
               kind,
               nameFile,
               propertyId: options.propertyId ?? selectedProperty?._id ?? null,
               leadId: options.leadId ?? selectedLead?._id ?? null,
               saveLog: options.saveLog,
            }),
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
                  FileSaver.saveAs(blob, nameFile);
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
         //! setFieldsData(fieldsDataZero) //не обновляємо форму для подальшої можливої корекції!!! І для Договору послуг!
      }
   } //, []);

   function randomIntFromInterval(min, max) { // min and max included 
      return Math.floor(Math.random() * (max - min + 1) + min);
   }
   // const rndInt = randomIntFromInterval(1, 6);



   return (

      <div className="mui-scope">
         {!documentsOpen && (
         <Stack spacing={4} sx={{
            backgroundImage: `url(/esta/assets/docs/docu2.jpg)`,
            // width: '100%'
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover'
            // position: 'fixed',

         }}>

            <Stack sx={{
               justifyContent: "center",
               alignItems: "center",
            }}>
               <Grid lg={8} md={10} xs={12} container rowSpacing={1} columnSpacing={1} sx={{
                  background: "#f2f4f8",
                  opacity: '90%'
               }}>
                  <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                     <Divider sx={sectionDividerSx}>ДОГОВІР ЗАВДАТКУ КУПІВЛІ-ПРОДАЖУ</Divider>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <Autocomplete
                        options={propertyOptions}
                        value={selectedProperty}
                        inputValue={propertySearch}
                        onChange={(event, value) => handlePropertySelect(value)}
                        onInputChange={(event, value, reason) => {
                           if (reason === 'input') {
                              setSelectedProperty(null);
                              setPropertySearch(value);
                           }
                           if (reason === 'clear') handlePropertySelect(null);
                        }}
                        filterOptions={(options) => options}
                        getOptionLabel={getPropertyLabel}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        renderInput={(params) => (
                           <TextField
                              {...params}
                              label="Прив'язати об'єкт"
                              variant="standard"
                              helperText="пошук по назві, адресі, місту, вулиці, власнику або телефону"
                              inputProps={{
                                 ...params.inputProps,
                                 onChange: (event) => {
                                    params.inputProps.onChange?.(event);
                                    setSelectedProperty(null);
                                    setPropertySearch(event.target.value);
                                 },
                              }}
                           />
                        )}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <Autocomplete
                        options={leadOptions}
                        value={selectedLead}
                        inputValue={leadSearch}
                        onChange={(event, value) => handleLeadSelect(value)}
                        onInputChange={(event, value, reason) => {
                           if (reason === 'input') {
                              setSelectedLead(null);
                              setLeadSearch(value);
                           }
                           if (reason === 'clear') handleLeadSelect(null);
                        }}
                        filterOptions={(options) => options}
                        getOptionLabel={getLeadLabel}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        renderInput={(params) => (
                           <TextField
                              {...params}
                              label="Прив'язати ліда / клієнта"
                              variant="standard"
                              helperText="пошук по ПІБ, телефону, email, запиту або об'єкту інтересу"
                              inputProps={{
                                 ...params.inputProps,
                                 onChange: (event) => {
                                    params.inputProps.onChange?.(event);
                                    setSelectedLead(null);
                                    setLeadSearch(event.target.value);
                                 },
                              }}
                           />
                        )}
                     />
                  </Grid>

                  <Grid item sm={2} xs={4}>
                     <TextField fullWidth label="№ Договору" variant='standard' helperText="зразок: 25/04"
                        name='numberZS'
                        value={fieldsData.numberZS}
                        onChange={handleChangeData} />
                  </Grid>
                  <Grid item sm={2} xs={4}>
                     <TextField fullWidth label="Місце Договору" variant='standard' helperText="зразок: м.Львів"
                        name='placeZS'
                        value={fieldsData.placeZS}
                        onChange={handleChangeData}
                        sx={styleFulled} />
                  </Grid>
                  <Grid item sm={3} xs={4}>
                     <TextField fullWidth label="Дата Договору" variant='standard' helperText="зразок: 27 жовтня 2022р"
                        name='dateZS'
                        value={fieldsData.dateZS}
                        onChange={handleChangeData}
                        sx={styleFulled} />
                  </Grid>
                  <Grid item sm={5} xs={12}>
                     <FormControl fullWidth variant='standard' sx={styleFulled}>
                        <InputLabel id="name-fop-label">ФОП угоди</InputLabel>
                        <Select
                           labelId="name-fop-label"
                           name='nameFOP'
                           value={fieldsData.nameFOP}
                           onChange={handleChangeData}
                           label="ФОП угоди"
                        >
                           <MenuItem value="ФОП Рачун Юрій Тарасович">ФОП Рачун Юрій Тарасович</MenuItem>
                           <MenuItem value="ФОП Рачун Наталія Тарасівна">ФОП Рачун Наталія Тарасівна</MenuItem>
                        </Select>
                     </FormControl>
                  </Grid>



                  <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                     <Divider sx={sectionDividerSx}>ПОКУПЕЦЬ</Divider>
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
                     <Divider sx={sectionDividerSx}>ПРОДАВЕЦЬ</Divider>
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
                     <Divider sx={sectionDividerSx}>ІСТОТНІ УМОВИ ДОГОВОРУ</Divider>
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
                        onChange={handleChangeData}
                        sx={styleFulled} />
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
                        onChange={handleChangeData}
                        sx={styleRed} />
                  </Grid>
                  <Grid item sm={8} xs={12}>
                     <TextField fullWidth label="Адреса Об'єкту" variant='standard' helperText="зразок: м.Львів, вулиця Замарстинівська 170, проектний номер №03/5"
                        name='estateAdress'
                        value={fieldsData.estateAdress}
                        onChange={handleChangeData}
                        sx={styleRed} />
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
                     <Divider sx={sectionDividerSx}>ДОДАТКОВІ ПЛАТЕЖІ</Divider>
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
                        // sx={styleFulled}
                        >
                           <MenuItem value=""></MenuItem>
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
                        // sx={styleFulled}
                        >
                           <MenuItem value=""></MenuItem>
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
                        // sx={styleFulled}
                        >
                           <MenuItem value=""></MenuItem>
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
                        // sx={styleFulled}
                        >
                           <MenuItem value=""></MenuItem>
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
                        // sx={styleFulled}
                        >
                           <MenuItem value=""></MenuItem>
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
                        // sx={styleFulled}
                        >
                           <MenuItem value=""></MenuItem>
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
                           <MenuItem value=""></MenuItem>
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
                  <Divider sx={sectionDividerSx}>ЮРИДИЧНІ ДЕТАЛІ ДОГОВОРУ</Divider>
               </Grid>
               <Grid item xs={12}>
                  <TextField fullWidth label="ФОП агентства" variant='standard' helperText="зразок: ФОП Рачун Юрій Тарасович"
                     name='nameFOP'
                     value={fieldsData.nameFOP}
                     onChange={handleChangeData} />
               </Grid> */}

                  {/* <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                  <Divider sx={sectionDividerSx}>ГЕНЕРАЦІЯ ДОГОВОРІВ</Divider>
               </Grid> */}

                  <Grid item xs={12} mt={1} pb={2} sx={{ background: bgDiv }}>
                     <Box
                        sx={{
                           display: 'grid',
                           gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
                           alignItems: 'center',
                           gap: 1.5,
                           px: { xs: 1, md: 2 },
                        }}
                     >
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                           <Button
                              variant="contained"
                              onClick={openDocumentsBase}
                              sx={{
                                 bgcolor: '#f8fafc',
                                 color: '#111827',
                                 border: '1px solid rgba(17,24,39,0.28)',
                                 boxShadow: 'none',
                                 '&:hover': {
                                    bgcolor: '#e2e8f0',
                                    boxShadow: 'none',
                                 },
                              }}
                           >
                              База договорів
                           </Button>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                           <Button
                              variant="contained"
                              color="secondary"
                              endIcon={<SendIcon />}
                              disableRipple
                              onClick={e => generateDealZS()}
                           >
                              Згенерувати договір завдатку
                           </Button>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                           <Button
                              variant="contained"
                              endIcon={<SendIcon />}
                              disableRipple
                              onClick={e => generateDealZS('rp')}
                              sx={{
                                 bgcolor: '#d946ef',
                                 color: '#fff',
                                 '&:hover': {
                                    bgcolor: '#c026d3',
                                 },
                              }}
                           >
                              Згенерувати договір послуг
                           </Button>
                        </Box>
                     </Box>
                  </Grid>

               </Grid>
            </Stack>



         </Stack>
         )}
         {documentsOpen && (
            <Box sx={{
               minHeight: 'calc(100vh - 130px)',
               backgroundImage: `linear-gradient(135deg, rgba(8,7,17,0.88), rgba(19,16,31,0.82)), url(/esta/assets/docs/docu2.jpg)`,
               backgroundAttachment: 'fixed',
               backgroundSize: 'cover',
               color: '#f8fafc',
               py: { xs: 2, md: 3 },
               px: { xs: 1.5, md: 3 },
            }}>
               <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                     maxWidth: 1500,
                     mx: 'auto',
                     mb: 2,
                     px: { xs: 1, md: 0 },
                  }}
               >
                  <Box>
                     <Typography sx={{ fontWeight: 900, fontSize: { xs: 24, md: 32 }, lineHeight: 1, color: '#f8fafc' }}>
                        База договорів
                     </Typography>
                     <Typography sx={{ color: '#b9b4c8', mt: 0.5 }}>
                        Збережені генерації, прив'язки, працівники та повні дані форми
                     </Typography>
                  </Box>

                  <IconButton
                     onClick={() => setDocumentsOpen(false)}
                     sx={{
                        bgcolor: 'rgba(17, 24, 39, 0.95)',
                        color: '#fff',
                        border: '1px solid rgba(139,92,246,0.35)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                        '&:hover': { bgcolor: '#2d1f4f' },
                     }}
                  >
                     <CloseRoundedIcon />
                  </IconButton>
               </Stack>

               <Box
                  sx={{
                     maxWidth: 1500,
                     mx: 'auto',
                     background: 'rgba(34,34,34,0.94)',
                     border: '1px solid rgba(139,92,246,0.22)',
                     boxShadow: '0 24px 70px rgba(0,0,0,0.42)',
                     overflow: 'hidden',
                  }}
               >
                  <Stack
                     direction="row"
                     spacing={1}
                     sx={{
                        p: 2,
                        flexWrap: 'wrap',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(29,29,37,0.92)',
                     }}
                  >
                     <Button
                        variant="contained"
                        onClick={saveCurrentFormToBase}
                        sx={{
                           bgcolor: '#20bfae',
                           color: '#071312',
                           fontWeight: 800,
                           '&:hover': { bgcolor: '#18a999' },
                        }}
                     >
                        Зберегти поточну форму
                     </Button>
                     <Button
                        variant="outlined"
                        onClick={fetchDocumentRows}
                        disabled={documentsLoading}
                        sx={{
                           color: '#a855f7',
                           borderColor: 'rgba(168,85,247,0.65)',
                           '&:hover': {
                              borderColor: '#c084fc',
                              background: 'rgba(168,85,247,0.12)',
                           },
                        }}
                     >
                        Оновити
                     </Button>
                  </Stack>

                  {!!documentsError && (
                     <Typography sx={{ color: '#f87171', fontWeight: 700, px: 2, pt: 2 }}>
                        {documentsError}
                     </Typography>
                  )}

                  <Box sx={{ overflowX: 'auto' }}>
                     <Table
                        size="small"
                        sx={{
                           minWidth: 1180,
                           '& .MuiTableCell-root': {
                              color: '#d8d4e2',
                              borderColor: 'rgba(255,255,255,0.08)',
                           },
                        }}
                     >
                        <TableHead>
                           <TableRow sx={{ background: 'rgba(30,41,59,0.96)' }}>
                              <TableCell sx={{ width: 48 }} />
                              <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Дата</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Тип</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Працівник</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Об'єкт</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Покупець</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>ФОП</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 900, color: '#f8fafc' }}>Дії</TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {documentRows.map((item) => {
                              const expanded = expandedDocumentId === item._id;
                              const snapshotEntries = getSnapshotEntries(item.fieldsSnapshot);

                              return (
                                 <Fragment key={item._id}>
                                     <TableRow
                                        hover
                                        sx={{
                                           background: expanded ? 'rgba(53,42,75,0.92)' : 'rgba(42,42,42,0.92)',
                                           transition: 'background 160ms ease',
                                           '&:hover': { background: 'rgba(49,46,61,0.98)' },
                                           '& td': { borderColor: 'rgba(255,255,255,0.08)' },
                                        }}
                                     >
                                        <TableCell>
                                          <IconButton
                                              size="small"
                                              onClick={() => setExpandedDocumentId(expanded ? '' : item._id)}
                                              sx={{
                                                 color: '#c4b5fd',
                                                 '&:hover': { background: 'rgba(139,92,246,0.16)' },
                                              }}
                                           >
                                             {expanded ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
                                          </IconButton>
                                       </TableCell>
                                       <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {formatDateTime(item.generatedAt || item.createdAt)}
                                       </TableCell>
                                       <TableCell>
                                          <Chip
                                             size="small"
                                             label={documentTypeLabel[item.documentType] || item.documentType}
                                             sx={{ fontWeight: 800, bgcolor: '#30384c', color: '#dbeafe' }}
                                          />
                                       </TableCell>
                                       <TableCell>
                                          {item.generatedByEmployee?.name || item.generatedByName || '—'}
                                       </TableCell>
                                       <TableCell sx={{ minWidth: 240 }}>
                                          {getPropertyLabel(item.property) || '—'}
                                       </TableCell>
                                       <TableCell sx={{ minWidth: 190 }}>
                                          {getLeadLabel(item.lead) || item.fieldsSnapshot?.customerPIB || '—'}
                                       </TableCell>
                                       <TableCell sx={{ minWidth: 150 }}>
                                          {item.fopName || item.fieldsSnapshot?.nameFOP || '—'}
                                       </TableCell>
                                       <TableCell align="right">
                                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                                             <Tooltip title="Завантажити договір" arrow>
                                                <IconButton
                                                   size="small"
                                                   onClick={() => downloadDocumentFromBase(item)}
                                                   sx={{
                                                      width: 42,
                                                      height: 42,
                                                      color: '#b7f7ff',
                                                      border: '1px solid rgba(45,212,191,0.55)',
                                                      background: 'rgba(20,184,166,0.12)',
                                                      '&:hover': {
                                                         color: '#071312',
                                                         borderColor: '#2dd4bf',
                                                         background: '#2dd4bf',
                                                         transform: 'translateY(-1px)',
                                                      },
                                                   }}
                                                >
                                                   <DownloadRoundedIcon fontSize="small" />
                                                </IconButton>
                                             </Tooltip>
                                             <Tooltip title="Завантажити у форму" arrow>
                                                <IconButton
                                                   size="small"
                                                   onClick={() => loadDocumentToForm(item)}
                                                   sx={{
                                                      width: 42,
                                                      height: 42,
                                                      bgcolor: '#7137f2',
                                                      color: '#fff',
                                                      boxShadow: '0 10px 24px rgba(113,55,242,0.25)',
                                                      '&:hover': {
                                                         bgcolor: '#6126db',
                                                         transform: 'translateY(-1px)',
                                                      },
                                                   }}
                                                >
                                                   <DriveFileMoveRoundedIcon fontSize="small" />
                                                </IconButton>
                                             </Tooltip>
                                             <Tooltip title="Видалити" arrow>
                                                <IconButton
                                                   size="small"
                                                   onClick={() => requestDeleteDocument(item)}
                                                   sx={{
                                                      width: 42,
                                                      height: 42,
                                                      color: '#ff6b6b',
                                                      border: '1px solid rgba(255,107,107,0.55)',
                                                      background: 'rgba(239,68,68,0.06)',
                                                      '&:hover': {
                                                         color: '#fff',
                                                         borderColor: '#ff6b6b',
                                                         background: 'rgba(239,68,68,0.22)',
                                                         transform: 'translateY(-1px)',
                                                      },
                                                   }}
                                                >
                                                   <DeleteOutlineRoundedIcon fontSize="small" />
                                                </IconButton>
                                             </Tooltip>
                                          </Stack>
                                       </TableCell>
                                    </TableRow>

                                    <TableRow>
                                       <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                                          <Collapse in={expanded} timeout="auto" unmountOnExit>
                                             <Box sx={{ p: 2.5, background: 'rgba(22,21,29,0.96)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <Typography sx={{ fontWeight: 900, mb: 1.5, color: '#f8fafc' }}>
                                                   Усі дані договору
                                                </Typography>
                                                <Grid container spacing={1.25}>
                                                   <Grid item xs={12} md={3}>
                                                      <Box sx={{ p: 1.2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                                         <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>ID запису</Typography>
                                                         <Typography sx={{ fontWeight: 700, wordBreak: 'break-all', color: '#f8fafc' }}>{item._id}</Typography>
                                                      </Box>
                                                   </Grid>
                                                   <Grid item xs={12} md={3}>
                                                      <Box sx={{ p: 1.2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                                         <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>Файл</Typography>
                                                         <Typography sx={{ fontWeight: 700, color: '#f8fafc' }}>{item.fileName || '—'}</Typography>
                                                      </Box>
                                                   </Grid>
                                                   <Grid item xs={12} md={3}>
                                                      <Box sx={{ p: 1.2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                                         <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>№ / дата договору</Typography>
                                                         <Typography sx={{ fontWeight: 700, color: '#f8fafc' }}>{item.contractNumber || '—'} / {item.contractDateText || '—'}</Typography>
                                                      </Box>
                                                   </Grid>
                                                   <Grid item xs={12} md={3}>
                                                      <Box sx={{ p: 1.2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                                         <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>Створено</Typography>
                                                         <Typography sx={{ fontWeight: 700, color: '#f8fafc' }}>{formatDateTime(item.createdAt)}</Typography>
                                                      </Box>
                                                   </Grid>

                                                   {snapshotEntries.map((entry) => (
                                                      <Grid item xs={12} sm={6} md={4} key={`${item._id}-${entry.key}`}>
                                                         <Box sx={{ p: 1.2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', minHeight: 76 }}>
                                                            <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                                                               {entry.label}
                                                            </Typography>
                                                            <Typography sx={{ fontWeight: 700, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#f8fafc' }}>
                                                               {entry.value}
                                                            </Typography>
                                                         </Box>
                                                      </Grid>
                                                   ))}
                                                </Grid>
                                             </Box>
                                          </Collapse>
                                       </TableCell>
                                    </TableRow>
                                 </Fragment>
                              );
                           })}

                           {!documentRows.length && (
                              <TableRow>
                                 <TableCell colSpan={8}>
                                    <Typography sx={{ py: 4, color: '#b9b4c8', textAlign: 'center', fontWeight: 700 }}>
                                       {documentsLoading ? 'Завантаження...' : 'Збережених договорів поки нема'}
                                    </Typography>
                                 </TableCell>
                              </TableRow>
                           )}
                        </TableBody>
                     </Table>
                  </Box>
               </Box>
            </Box>
         )}
         <Dialog
            open={Boolean(pendingDeleteDocument)}
            onClose={closeDeleteDialog}
            maxWidth="xs"
            fullWidth
            PaperProps={{
               sx: {
                  bgcolor: 'rgba(25,24,33,0.98)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255,107,107,0.25)',
                  boxShadow: '0 28px 80px rgba(0,0,0,0.55)',
               },
            }}
            BackdropProps={{
               sx: {
                  backgroundColor: 'rgba(5,5,12,0.72)',
                  backdropFilter: 'blur(4px)',
               },
            }}
         >
            <DialogTitle sx={{ pb: 1.5 }}>
               <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                     sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fecaca',
                        bgcolor: 'rgba(239,68,68,0.14)',
                        border: '1px solid rgba(248,113,113,0.25)',
                     }}
                  >
                     <WarningAmberRoundedIcon />
                  </Box>
                  <Box>
                     <Typography sx={{ fontWeight: 900, fontSize: 20 }}>
                        Видалити договір?
                     </Typography>
                     <Typography sx={{ color: '#a8a3b7', fontSize: 13, mt: 0.2 }}>
                        Дію не можна буде швидко скасувати
                     </Typography>
                  </Box>
               </Stack>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
               <Box
                  sx={{
                     p: 1.5,
                     bgcolor: 'rgba(255,255,255,0.06)',
                     border: '1px solid rgba(255,255,255,0.10)',
                  }}
               >
                  <Typography sx={{ color: '#c7c2d4', fontSize: 13 }}>
                     {formatDateTime(pendingDeleteDocument?.generatedAt || pendingDeleteDocument?.createdAt)}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, mt: 0.4 }}>
                     {documentTypeLabel[pendingDeleteDocument?.documentType] || pendingDeleteDocument?.documentType || 'Договір'}
                  </Typography>
                  <Typography sx={{ color: '#a8a3b7', mt: 0.5, fontSize: 14 }}>
                     {getPropertyLabel(pendingDeleteDocument?.property) || pendingDeleteDocument?.fieldsSnapshot?.customerPIB || 'Запис із бази договорів'}
                  </Typography>
               </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1.5 }}>
               <Button
                  onClick={closeDeleteDialog}
                  disabled={deleteInProgress}
                  sx={{
                     color: '#c4b5fd',
                     '&:hover': { background: 'rgba(139,92,246,0.12)' },
                  }}
               >
                  Скасувати
               </Button>
               <Button
                  variant="contained"
                  onClick={deleteDocumentRow}
                  disabled={deleteInProgress}
                  startIcon={<DeleteOutlineRoundedIcon />}
                  sx={{
                     bgcolor: '#ef4444',
                     color: '#fff',
                     fontWeight: 800,
                     '&:hover': { bgcolor: '#dc2626' },
                  }}
               >
                  {deleteInProgress ? 'Видаляю...' : 'Видалити'}
               </Button>
            </DialogActions>
         </Dialog>
      </div>

   )
}

export default genWord
