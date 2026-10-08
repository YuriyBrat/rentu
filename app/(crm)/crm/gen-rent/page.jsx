'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import FileSaver from 'file-saver';
import { toast } from 'react-toastify';

import '@/assets/styles/globals.css';

import {
   Autocomplete,
   Box,
   Button,
   Chip,
   Collapse,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Divider,
   Grid,
   IconButton,
   Stack,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
   TextField,
   Tooltip,
   Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DriveFileMoveRoundedIcon from '@mui/icons-material/DriveFileMoveRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { getMyFormatDate } from '@/hooks/date.hook';

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

const formatContractDate = (date = new Date()) => `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}р.`;

const getTomorrow = () => {
   const date = new Date();
   date.setDate(date.getDate() + 1);
   return date;
};

const getPhone = (entity) => {
   if (!entity) return '';
   if (Array.isArray(entity.phones)) {
      const first = entity.phones.find(Boolean);
      return typeof first === 'string' ? first : first?.number || '';
   }
   return '';
};

const getPropertyLabel = (property) => {
   if (!property) return '';
   const title = property.rentOptions?.rentTitle || property.title || property.type_estate || '';
   const location = property.location_text || [property.location?.city, property.location?.street, property.location?.number].filter(Boolean).join(', ');
   const priceValue = property.rentOptions?.price || property.cost || '';
   const currency = property.rentOptions?.currency || property.currency || '';
   const price = priceValue ? `${priceValue} ${currency}`.trim() : '';

   return [title, location, price].filter(Boolean).join(' | ');
};

const getLeadLabel = (lead) => {
   if (!lead) return '';
   const phone = getPhone(lead);
   const stage = lead.stage ? `етап: ${lead.stage}` : '';

   return [lead.name, phone, stage].filter(Boolean).join(' | ');
};

const mapCurrency = (currency) => {
   if (currency === 'EUR') return 'євро';
   if (currency === 'UAH') return 'гривень';
   return 'доларів США';
};

const sanitizeFileName = (value) => String(value || '')
   .replace(/[<>:"/\\|?*]+/g, ' ')
   .replace(/\s+/g, ' ')
   .trim();

const sectionDividerSx = {
   color: '#111827',
   fontWeight: 800,
   letterSpacing: 0.4,
   '&::before, &::after': {
      borderColor: 'rgba(17,24,39,0.75)',
   },
};

const bgDiv = '#d0d1cf';
const styleFulled = { background: '#f6cede' };
const styleChanged = { background: '#e2ffc8' };
const styleSoft = { background: 'rgba(242,244,248,0.82)' };
const tomorrow = getTomorrow();
const quickFurniture = ['диван', 'ліжко', 'шафа', 'комод', 'стіл', 'стільці', 'кухонний гарнітур', 'прихожа', 'тумба'];
const quickAppliances = [
   'холодильник',
   { label: 'пралка', value: 'пральна машина' },
   { label: 'посудомийка', value: 'посудомийна машина' },
   { label: 'духовка', value: 'духова шафа' },
   'варильна поверхня',
   { label: 'ТВ', value: 'телевізор' },
   'бойлер',
   'мікрохвильова',
   'кондиціонер',
   'котел',
   'пилосос',
];

const documentTypeLabel = {
   rent_contract: 'Договір оренди + акт',
   rent_deposit: 'Договір завдатку оренди',
   rent_service: 'Договір послуг оренди',
};

const rentFieldLabelMap = {
   contractPlace: 'Місце договору',
   contractDate: 'Дата договору',
   objectName: "Об'єкт нерухомості",
   objectAddress: "Адреса об'єкту",
   objectState: 'Фактичний стан',
   ownershipDocs: 'Документи права власності',
   landlordName: 'ПІБ орендодавця',
   landlordTaxId: 'ІПН орендодавця',
   landlordPhone: 'Телефон орендодавця',
   landlordPassport: 'Паспорт орендодавця',
   landlordPassportIssued: 'Ким видано паспорт орендодавця',
   landlordRegistration: 'Місце реєстрації орендодавця',
   tenantName: 'ПІБ орендаря',
   tenantTaxId: 'ІПН орендаря',
   tenantPhone: 'Телефон орендаря',
   tenantPassport: 'Паспорт орендаря',
   tenantPassportIssued: 'Ким видано паспорт орендаря',
   tenantRegistration: 'Місце реєстрації орендаря',
   rentTerm: 'Термін оренди',
   noticeTerm: 'Попередження про відмову',
   returnTerm: 'Повернення після завершення',
   rentPrice: 'Орендна плата',
   rentEquivalent: 'Еквівалент',
   paymentStartsAt: 'Дата старту оплати',
   paymentDay: 'Оплата до числа',
   actDeadlineDays: 'Строк до акту',
   residents: 'Хто проживатиме',
   pets: 'Тварини',
   depositAmount: 'Сума при укладенні',
   depositPurpose: 'Призначення платежу',
   witnesses: 'У присутності',
   actDate: 'Дата акту',
   actFurniture: 'Меблі',
   actAppliances: 'Побутова техніка',
   actTechState: 'Технічний стан',
   actDefects: 'Недоліки / зауваження',
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

const getSnapshotEntries = (snapshot = {}) => Object.entries(snapshot || {})
   .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
   .map(([key, value]) => ({
      key,
      label: rentFieldLabelMap[key] || key,
      value: Array.isArray(value) ? value.join(', ') : String(value),
   }));

const initialFields = {
   contractPlace: 'м. Львів',
   contractDate: formatContractDate(),

   objectName: 'квартира',
   objectAddress: 'м. Львів, вулиця ',
   objectState: 'житловий стан, придатний для проживання',
   ownershipDocs: 'Договір купівлі-продажу',

   landlordName: '',
   landlordTaxId: '',
   landlordPassport: '',
   landlordPassportIssued: '',
   landlordRegistration: '',
   landlordPhone: '',

   tenantName: '',
   tenantTaxId: '',
   tenantPassport: '',
   tenantPassportIssued: '',
   tenantRegistration: '',
   tenantPhone: '',

   rentTerm: '12 місяців',
   noticeTerm: '1 місяць',
   returnTerm: '1 день',
   rentPrice: '',
   rentEquivalent: '',
   paymentStartsAt: formatContractDate(tomorrow),
   paymentDay: String(tomorrow.getDate()),
   actDeadlineDays: '1 день',

   residents: '',
   pets: 'не допускається без письмової згоди Орендодавця',
   depositAmount: '',
   depositPurpose: 'перший місяць та гарантійний платіж за збереження майна та виконання умов договору',
   witnesses: '',

   actDate: formatContractDate(),
   actFurniture: '',
   actAppliances: '',
   actTechState: 'відмінний',
   actDefects: 'не виявлено',
};

export default function RentContractGenerator() {
   const [fieldsData, setFieldsData] = useState(initialFields);
   const [dirtyFields, setDirtyFields] = useState({});
   const [selectedProperty, setSelectedProperty] = useState(null);
   const [selectedLead, setSelectedLead] = useState(null);
   const [propertyOptions, setPropertyOptions] = useState([]);
   const [leadOptions, setLeadOptions] = useState([]);
   const [propertySearch, setPropertySearch] = useState('');
   const [leadSearch, setLeadSearch] = useState('');
   const [documentsOpen, setDocumentsOpen] = useState(false);
   const [documentRows, setDocumentRows] = useState([]);
   const [documentsLoading, setDocumentsLoading] = useState(false);
   const [documentsError, setDocumentsError] = useState('');
   const [expandedDocumentId, setExpandedDocumentId] = useState('');
   const [pendingDeleteDocument, setPendingDeleteDocument] = useState(null);
   const [deleteInProgress, setDeleteInProgress] = useState(false);
   const skipNextPropertySearchRef = useRef(false);
   const skipNextLeadSearchRef = useRef(false);

   useEffect(() => {
      if (skipNextPropertySearchRef.current) {
         skipNextPropertySearchRef.current = false;
         return undefined;
      }

      const controller = new AbortController();
      const timeout = setTimeout(async () => {
         try {
            const params = new URLSearchParams({ target: 'properties', deal: 'rent', limit: '10' });
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

   const handleChangeData = (event) => {
      const { name, value } = event.target;
      setDirtyFields((prev) => ({ ...prev, [name]: true }));
      setFieldsData((prev) => ({ ...prev, [name]: value }));
   };

   const appendQuickValue = (name, value) => {
      setDirtyFields((prev) => ({ ...prev, [name]: true }));
      setFieldsData((prev) => {
         const current = String(prev[name] || '').trim();
         const parts = current
            ? current.split(',').map((item) => item.trim()).filter(Boolean)
            : [];
         if (parts.some((item) => item.toLowerCase() === value.toLowerCase())) return prev;

         return {
            ...prev,
            [name]: [...parts, value].join(', '),
         };
      });
   };

   const markFieldsDirty = (names) => {
      setDirtyFields((prev) => names.reduce((acc, name) => ({ ...acc, [name]: true }), prev));
   };

   const getFieldSx = (name) => {
      if (dirtyFields[name]) return styleChanged;
      if (String(initialFields[name] ?? '').trim()) return styleFulled;
      if (String(fieldsData[name] ?? '').trim()) return styleChanged;
      return styleSoft;
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
         tenantName: lead.name || prev.tenantName,
         tenantPhone: getPhone(lead) || prev.tenantPhone,
      }));
      markFieldsDirty(['tenantName', 'tenantPhone']);
   };

   const fetchDocumentRows = async () => {
      setDocumentsLoading(true);
      setDocumentsError('');

      try {
         const response = await fetch('/api/crm/document-generations?documentDomain=rent&pageSize=50', {
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
         const dateMyFormat = getMyFormatDate(new Date(), 'DD.MM.YY');
         const address = fieldsData.objectAddress || 'оренда';
         const fileName = sanitizeFileName(`Оренда ${address} ${dateMyFormat}`) + '.docx';
         const response = await fetch('/api/crm/document-generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               documentDomain: 'rent',
               documentType: 'rent_contract',
               fieldsData,
               fileName,
               propertyId: selectedProperty?._id || null,
               leadId: selectedLead?._id || null,
            }),
         });

         if (!response.ok) throw new Error('Не вдалося зберегти форму в базу');

         toast.success('Орендний договір збережено в базу');
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
      setDirtyFields({});

      setSelectedProperty(item?.property || null);
      skipNextPropertySearchRef.current = true;
      setPropertySearch(item?.property ? getPropertyLabel(item.property) : '');

      setSelectedLead(item?.lead || null);
      skipNextLeadSearchRef.current = true;
      setLeadSearch(item?.lead ? getLeadLabel(item.lead) : '');

      setDocumentsOpen(false);
      toast.success('Орендний договір завантажено у форму');
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
      await generateRentDocument('contract', {
         fieldsData: item?.fieldsSnapshot || {},
         nameFile: item?.fileName || '',
         propertyId: item?.property?._id || item?.property || null,
         leadId: item?.lead?._id || item?.lead || null,
         saveLog: false,
      });
   };

   const generateRentDocument = async (docType = 'contract', options = {}) => {
      try {
         const dateMyFormat = getMyFormatDate(new Date(), 'DD.MM.YY');
         const generationFields = options.fieldsData || fieldsData;
         const address = generationFields.objectAddress || 'оренда';
         const prefix = docType === 'act' ? 'Акт приймання-передачі' : 'Оренда';
         const nameFile = options.nameFile || (sanitizeFileName(`${prefix} ${address} ${dateMyFormat}`) + '.docx');

         const response = await fetch('/api/rcs/genrent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               docType,
               fieldsData: generationFields,
               nameFile,
               propertyId: options.propertyId ?? selectedProperty?._id ?? null,
               leadId: options.leadId ?? selectedLead?._id ?? null,
               saveLog: options.saveLog,
            }),
         });

         if (!response.ok) {
            toast.error('На жаль, виникла помилка при генеруванні документа оренди!');
            return;
         }

         const blob = await response.blob();
         FileSaver.saveAs(blob, nameFile);
         toast.success(docType === 'act' ? 'Акт приймання-передачі успішно згенеровано!' : 'Договір оренди успішно згенеровано!');
         return true;
      } catch (error) {
         console.log(error);
         toast.error('На жаль, фатальна помилка при генеруванні документа оренди!');
         return false;
      }
   };

   return (
      <div className="mui-scope">
         {!documentsOpen && (
         <Stack
            spacing={4}
            sx={{
               backgroundImage: 'url(/esta/assets/docs/docu2.jpg)',
               backgroundAttachment: 'fixed',
               backgroundSize: 'cover',
            }}
         >
            <Stack sx={{ justifyContent: 'center', alignItems: 'center' }}>
               <Grid
                  lg={8}
                  md={10}
                  xs={12}
                  container
                  rowSpacing={1}
                  columnSpacing={1}
                  sx={{
                     background: '#f2f4f8',
                     opacity: '90%',
                  }}
               >
                  <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                     <Divider sx={sectionDividerSx}>ДОГОВІР ОРЕНДИ КВАРТИРИ</Divider>
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
                              helperText="пошук по назві, орендній назві, адресі, ціні, місту, вулиці або власнику"
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
                              label="Прив'язати ліда / орендаря"
                              variant="standard"
                              helperText="пошук по ПІБ, телефону, email, запиту або об'єкту інтересу"
                           />
                        )}
                     />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                     <TextField fullWidth label="Місце договору" variant="standard" helperText="зразок: м. Львів" name="contractPlace" value={fieldsData.contractPlace} onChange={handleChangeData} sx={getFieldSx('contractPlace')} />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                     <TextField fullWidth label="Дата договору" variant="standard" helperText="зразок: 27 вересня 2026р." name="contractDate" value={fieldsData.contractDate} onChange={handleChangeData} sx={getFieldSx('contractDate')} />
                  </Grid>

                  <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                     <Divider sx={sectionDividerSx}>ОБ'ЄКТ ОРЕНДИ</Divider>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                     <TextField fullWidth label="Об'єкт нерухомості" variant="standard" helperText="зразок: двокімнатна квартира" name="objectName" value={fieldsData.objectName} onChange={handleChangeData} sx={getFieldSx('objectName')} />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                     <TextField fullWidth label="Адреса" variant="standard" helperText="зразок: м. Львів, вул. Зелена, буд. 269, кв. 10" name="objectAddress" value={fieldsData.objectAddress} onChange={handleChangeData} sx={getFieldSx('objectAddress')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <TextField fullWidth label="Фактичний стан" variant="standard" helperText="зразок: житловий стан, придатний для проживання" name="objectState" value={fieldsData.objectState} onChange={handleChangeData} sx={getFieldSx('objectState')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <TextField fullWidth label="Документи права власності" variant="standard" helperText="зразок: витяг з ДРРП, договір купівлі-продажу..." name="ownershipDocs" value={fieldsData.ownershipDocs} onChange={handleChangeData} sx={getFieldSx('ownershipDocs')} />
                  </Grid>

                  <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                     <Divider sx={sectionDividerSx}>ОРЕНДОДАВЕЦЬ</Divider>
                  </Grid>
                  <PersonFields prefix="landlord" fieldsData={fieldsData} onChange={handleChangeData} getFieldSx={getFieldSx} />

                  <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                     <Divider sx={sectionDividerSx}>ОРЕНДАР</Divider>
                  </Grid>
                  <PersonFields prefix="tenant" fieldsData={fieldsData} onChange={handleChangeData} getFieldSx={getFieldSx} />

                  <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                     <Divider sx={sectionDividerSx}>УМОВИ ОРЕНДИ</Divider>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                     <TextField fullWidth label="Термін оренди" variant="standard" helperText="зразок: 12 місяців" name="rentTerm" value={fieldsData.rentTerm} onChange={handleChangeData} sx={getFieldSx('rentTerm')} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                     <TextField fullWidth label="Попередження про відмову" variant="standard" helperText="зразок: один місяць" name="noticeTerm" value={fieldsData.noticeTerm} onChange={handleChangeData} sx={getFieldSx('noticeTerm')} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                     <TextField fullWidth label="Повернення після завершення" variant="standard" helperText="зразок: 3 днів" name="returnTerm" value={fieldsData.returnTerm} onChange={handleChangeData} sx={getFieldSx('returnTerm')} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                     <TextField fullWidth label="Строк до акту" variant="standard" helperText="зразок: 1 день" name="actDeadlineDays" value={fieldsData.actDeadlineDays} onChange={handleChangeData} sx={getFieldSx('actDeadlineDays')} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                     <TextField fullWidth label="Орендна плата, грн" variant="standard" helperText="зразок: 25000" name="rentPrice" value={fieldsData.rentPrice} onChange={handleChangeData} sx={getFieldSx('rentPrice')} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                     <TextField fullWidth label="Еквівалент" variant="standard" helperText="зразок: 600 доларів США" name="rentEquivalent" value={fieldsData.rentEquivalent} onChange={handleChangeData} sx={getFieldSx('rentEquivalent')} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                     <TextField fullWidth label="Дата старту оплати" variant="standard" helperText="зразок: 01 жовтня 2025р." name="paymentStartsAt" value={fieldsData.paymentStartsAt} onChange={handleChangeData} sx={getFieldSx('paymentStartsAt')} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                     <TextField fullWidth label="Оплата до числа" variant="standard" helperText="зразок: 10" name="paymentDay" value={fieldsData.paymentDay} onChange={handleChangeData} sx={getFieldSx('paymentDay')} />
                  </Grid>

                  <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                     <Divider sx={sectionDividerSx}>ІНШІ УМОВИ</Divider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <TextField fullWidth label="Хто проживатиме" variant="standard" helperText="зразок: двоє дорослих осіб" name="residents" value={fieldsData.residents} onChange={handleChangeData} sx={getFieldSx('residents')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <TextField fullWidth label="Тварини" variant="standard" helperText="зразок: не допускається без письмової згоди" name="pets" value={fieldsData.pets} onChange={handleChangeData} sx={getFieldSx('pets')} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                     <TextField fullWidth label="Сума при укладенні" variant="standard" helperText="зразок: 25000 грн" name="depositAmount" value={fieldsData.depositAmount} onChange={handleChangeData} sx={getFieldSx('depositAmount')} />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                     <TextField fullWidth label="Призначення платежу як плата за" variant="standard" helperText="зразок: перший місяць та гарантійний платіж..." name="depositPurpose" value={fieldsData.depositPurpose} onChange={handleChangeData} sx={getFieldSx('depositPurpose')} />
                  </Grid>
                   <Grid item xs={12}>
                      <TextField fullWidth label="У присутності" variant="standard" helperText="зразок: ПІБ / підписи свідків" name="witnesses" value={fieldsData.witnesses} onChange={handleChangeData} sx={getFieldSx('witnesses')} />
                   </Grid>

                   <Grid item xs={12} mt={2} sx={{ background: bgDiv }}>
                      <Divider sx={sectionDividerSx}>АКТ ПРИЙМАННЯ-ПЕРЕДАЧІ</Divider>
                   </Grid>
                   <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Дата акту" variant="standard" helperText="зразок: 27 вересня 2026р." name="actDate" value={fieldsData.actDate} onChange={handleChangeData} sx={getFieldSx('actDate')} />
                   </Grid>
                   <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Технічний стан" variant="standard" helperText="зразок: відмінний" name="actTechState" value={fieldsData.actTechState} onChange={handleChangeData} sx={getFieldSx('actTechState')} />
                   </Grid>
                   <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Недоліки / зауваження" variant="standard" helperText="зразок: не виявлено" name="actDefects" value={fieldsData.actDefects} onChange={handleChangeData} sx={getFieldSx('actDefects')} />
                   </Grid>
                   <Grid item xs={12} sm={6}>
                      <TextField fullWidth multiline minRows={2} label="Меблі" variant="standard" name="actFurniture" value={fieldsData.actFurniture} onChange={handleChangeData} sx={getFieldSx('actFurniture')} />
                      <QuickChips items={quickFurniture} onPick={(value) => appendQuickValue('actFurniture', value)} />
                   </Grid>
                   <Grid item xs={12} sm={6}>
                      <TextField fullWidth multiline minRows={2} label="Побутова техніка" variant="standard" name="actAppliances" value={fieldsData.actAppliances} onChange={handleChangeData} sx={getFieldSx('actAppliances')} />
                      <QuickChips items={quickAppliances} onPick={(value) => appendQuickValue('actAppliances', value)} />
                   </Grid>
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
                            endIcon={<SendIcon />}
                            disableRipple
                            onClick={() => generateRentDocument('contract')}
                            sx={{
                               bgcolor: '#d946ef',
                               color: '#fff',
                              '&:hover': { bgcolor: '#c026d3' },
                           }}
                         >
                            Згенерувати договір оренди
                         </Button>
                         </Box>
                         <Box />
                      </Box>
                   </Grid>
               </Grid>
            </Stack>
         </Stack>
         )}
         {documentsOpen && (
            <DocumentsBaseView
               rows={documentRows}
               loading={documentsLoading}
               error={documentsError}
               expandedId={expandedDocumentId}
               onToggleExpanded={(id) => setExpandedDocumentId(expandedDocumentId === id ? '' : id)}
               onClose={() => setDocumentsOpen(false)}
               onRefresh={fetchDocumentRows}
               onSave={saveCurrentFormToBase}
               onLoad={loadDocumentToForm}
               onDownload={downloadDocumentFromBase}
               onDelete={requestDeleteDocument}
            />
         )}
         <DeleteDocumentDialog
            item={pendingDeleteDocument}
            inProgress={deleteInProgress}
            onClose={closeDeleteDialog}
            onDelete={deleteDocumentRow}
         />
      </div>
   );
}

function DocumentsBaseView({
   rows,
   loading,
   error,
   expandedId,
   onToggleExpanded,
   onClose,
   onRefresh,
   onSave,
   onLoad,
   onDownload,
   onDelete,
}) {
   return (
      <Box sx={{
         minHeight: 'calc(100vh - 130px)',
         backgroundImage: `linear-gradient(135deg, rgba(8,7,17,0.88), rgba(19,16,31,0.82)), url(/esta/assets/docs/docu2.jpg)`,
         backgroundAttachment: 'fixed',
         backgroundSize: 'cover',
         color: '#f8fafc',
         py: { xs: 2, md: 3 },
         px: { xs: 1.5, md: 3 },
      }}>
         <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ maxWidth: 1500, mx: 'auto', mb: 2, px: { xs: 1, md: 0 } }}>
            <Box>
               <Typography sx={{ fontWeight: 900, fontSize: { xs: 24, md: 32 }, lineHeight: 1, color: '#f8fafc' }}>
                  База договорів
               </Typography>
               <Typography sx={{ color: '#b9b4c8', mt: 0.5 }}>
                  Орендні генерації, прив'язки, працівники та повні дані форми
               </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ bgcolor: 'rgba(17, 24, 39, 0.95)', color: '#fff', border: '1px solid rgba(139,92,246,0.35)', '&:hover': { bgcolor: '#2d1f4f' } }}>
               <CloseRoundedIcon />
            </IconButton>
         </Stack>

         <Box sx={{ maxWidth: 1500, mx: 'auto', background: 'rgba(34,34,34,0.94)', border: '1px solid rgba(139,92,246,0.22)', boxShadow: '0 24px 70px rgba(0,0,0,0.42)', overflow: 'hidden' }}>
            <Stack direction="row" spacing={1} sx={{ p: 2, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(29,29,37,0.92)' }}>
               <Button variant="contained" onClick={onSave} sx={{ bgcolor: '#20bfae', color: '#071312', fontWeight: 800, '&:hover': { bgcolor: '#18a999' } }}>
                  Зберегти поточну форму
               </Button>
               <Button variant="outlined" onClick={onRefresh} disabled={loading} sx={{ color: '#a855f7', borderColor: 'rgba(168,85,247,0.65)', '&:hover': { borderColor: '#c084fc', background: 'rgba(168,85,247,0.12)' } }}>
                  Оновити
               </Button>
            </Stack>

            {!!error && (
               <Typography sx={{ color: '#f87171', fontWeight: 700, px: 2, pt: 2 }}>
                  {error}
               </Typography>
            )}

            <Box sx={{ overflowX: 'auto' }}>
               <Table size="small" sx={{ minWidth: 1180, '& .MuiTableCell-root': { color: '#d8d4e2', borderColor: 'rgba(255,255,255,0.08)' } }}>
                  <TableHead>
                     <TableRow sx={{ background: 'rgba(30,41,59,0.96)' }}>
                        <TableCell sx={{ width: 48 }} />
                        <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Дата</TableCell>
                        <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Тип</TableCell>
                        <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Працівник</TableCell>
                        <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Об'єкт</TableCell>
                        <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Орендар</TableCell>
                        <TableCell sx={{ fontWeight: 900, color: '#f8fafc' }}>Дата договору</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: '#f8fafc' }}>Дії</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {rows.map((item) => {
                        const expanded = expandedId === item._id;
                        const snapshotEntries = getSnapshotEntries(item.fieldsSnapshot);

                        return (
                           <Fragment key={item._id}>
                              <TableRow hover sx={{ background: expanded ? 'rgba(53,42,75,0.92)' : 'rgba(42,42,42,0.92)', '&:hover': { background: 'rgba(49,46,61,0.98)' } }}>
                                 <TableCell>
                                    <IconButton size="small" onClick={() => onToggleExpanded(item._id)} sx={{ color: '#c4b5fd', '&:hover': { background: 'rgba(139,92,246,0.16)' } }}>
                                       {expanded ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
                                    </IconButton>
                                 </TableCell>
                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(item.generatedAt || item.createdAt)}</TableCell>
                                 <TableCell>
                                    <Chip size="small" label={documentTypeLabel[item.documentType] || item.documentType} sx={{ fontWeight: 800, bgcolor: '#30384c', color: '#dbeafe' }} />
                                 </TableCell>
                                 <TableCell>{item.generatedByEmployee?.name || item.generatedByName || '-'}</TableCell>
                                 <TableCell sx={{ minWidth: 260 }}>{getPropertyLabel(item.property) || item.fieldsSnapshot?.objectAddress || '-'}</TableCell>
                                 <TableCell sx={{ minWidth: 190 }}>{getLeadLabel(item.lead) || item.fieldsSnapshot?.tenantName || '-'}</TableCell>
                                 <TableCell sx={{ minWidth: 150 }}>{item.contractDateText || item.fieldsSnapshot?.contractDate || '-'}</TableCell>
                                 <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                       <Tooltip title="Завантажити договір" arrow>
                                          <IconButton size="small" onClick={() => onDownload(item)} sx={{ width: 42, height: 42, color: '#b7f7ff', border: '1px solid rgba(45,212,191,0.55)', background: 'rgba(20,184,166,0.12)', '&:hover': { color: '#071312', borderColor: '#2dd4bf', background: '#2dd4bf' } }}>
                                             <DownloadRoundedIcon fontSize="small" />
                                          </IconButton>
                                       </Tooltip>
                                       <Tooltip title="Завантажити у форму" arrow>
                                          <IconButton size="small" onClick={() => onLoad(item)} sx={{ width: 42, height: 42, bgcolor: '#7137f2', color: '#fff', '&:hover': { bgcolor: '#6126db' } }}>
                                             <DriveFileMoveRoundedIcon fontSize="small" />
                                          </IconButton>
                                       </Tooltip>
                                       <Tooltip title="Видалити" arrow>
                                          <IconButton size="small" onClick={() => onDelete(item)} sx={{ width: 42, height: 42, color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.55)', background: 'rgba(239,68,68,0.06)', '&:hover': { color: '#fff', borderColor: '#ff6b6b', background: 'rgba(239,68,68,0.22)' } }}>
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
                                          <Typography sx={{ fontWeight: 900, mb: 1.5, color: '#f8fafc' }}>Усі дані договору</Typography>
                                          <Grid container spacing={1.25}>
                                             {snapshotEntries.map((entry) => (
                                                <Grid item xs={12} sm={6} md={4} key={`${item._id}-${entry.key}`}>
                                                   <Box sx={{ p: 1.2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', minHeight: 76 }}>
                                                      <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>{entry.label}</Typography>
                                                      <Typography sx={{ fontWeight: 700, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#f8fafc' }}>{entry.value}</Typography>
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

                     {!rows.length && (
                        <TableRow>
                           <TableCell colSpan={8}>
                              <Typography sx={{ py: 4, color: '#b9b4c8', textAlign: 'center', fontWeight: 700 }}>
                                 {loading ? 'Завантаження...' : 'Збережених орендних договорів поки нема'}
                              </Typography>
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            </Box>
         </Box>
      </Box>
   );
}

function DeleteDocumentDialog({ item, inProgress, onClose, onDelete }) {
   return (
      <Dialog
         open={Boolean(item)}
         onClose={onClose}
         maxWidth="xs"
         fullWidth
         PaperProps={{
            sx: {
               bgcolor: 'rgba(25,24,33,0.98)',
               color: '#f8fafc',
               border: '1px solid rgba(255,107,107,0.25)',
            },
         }}
      >
         <DialogTitle sx={{ pb: 1.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
               <Box sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', color: '#fecaca', bgcolor: 'rgba(239,68,68,0.14)', border: '1px solid rgba(248,113,113,0.25)' }}>
                  <WarningAmberRoundedIcon />
               </Box>
               <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: 20 }}>Видалити договір?</Typography>
                  <Typography sx={{ color: '#a8a3b7', fontSize: 13, mt: 0.2 }}>Дію не можна буде швидко скасувати</Typography>
               </Box>
            </Stack>
         </DialogTitle>
         <DialogContent sx={{ pt: 1 }}>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
               <Typography sx={{ color: '#c7c2d4', fontSize: 13 }}>{formatDateTime(item?.generatedAt || item?.createdAt)}</Typography>
               <Typography sx={{ fontWeight: 800, mt: 0.4 }}>{documentTypeLabel[item?.documentType] || item?.documentType || 'Договір'}</Typography>
               <Typography sx={{ color: '#a8a3b7', mt: 0.5, fontSize: 14 }}>{getPropertyLabel(item?.property) || item?.fieldsSnapshot?.objectAddress || 'Запис із бази договорів'}</Typography>
            </Box>
         </DialogContent>
         <DialogActions sx={{ p: 2, pt: 1.5 }}>
            <Button onClick={onClose} disabled={inProgress} sx={{ color: '#c4b5fd', '&:hover': { background: 'rgba(139,92,246,0.12)' } }}>
               Скасувати
            </Button>
            <Button variant="contained" onClick={onDelete} disabled={inProgress} startIcon={<DeleteOutlineRoundedIcon />} sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 800, '&:hover': { bgcolor: '#dc2626' } }}>
               {inProgress ? 'Видаляю...' : 'Видалити'}
            </Button>
         </DialogActions>
      </Dialog>
   );
}

function QuickChips({ items, onPick }) {
   return (
      <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap" sx={{ mt: 0.8, mb: 0.4 }}>
         {items.map((item) => {
            const label = typeof item === 'string' ? item : item.label;
            const value = typeof item === 'string' ? item : item.value;

            return (
               <Chip
                  key={value}
                  label={label}
                  size="small"
                  variant="outlined"
                  onClick={() => onPick(value)}
                  sx={{
                     height: 22,
                     borderColor: 'rgba(17,24,39,0.35)',
                     color: '#111827',
                     bgcolor: 'rgba(255,255,255,0.34)',
                     fontSize: 12,
                     '&:hover': {
                        bgcolor: 'rgba(226,255,200,0.82)',
                        borderColor: 'rgba(17,24,39,0.55)',
                     },
                  }}
               />
            );
         })}
      </Stack>
   );
}

function PersonFields({ prefix, fieldsData, onChange, getFieldSx }) {
   const labelPrefix = prefix === 'landlord' ? 'орендодавця' : 'орендаря';

   return (
      <>
         <Grid item xs={12} sm={6}>
            <TextField fullWidth label={`ПІБ ${labelPrefix}`} variant="standard" helperText="зразок: Іванов Іван Іванович" name={`${prefix}Name`} value={fieldsData[`${prefix}Name`]} onChange={onChange} sx={getFieldSx(`${prefix}Name`)} />
         </Grid>
         <Grid item xs={12} sm={2}>
            <TextField fullWidth label="ІПН" variant="standard" helperText="зразок: 3445678451" name={`${prefix}TaxId`} value={fieldsData[`${prefix}TaxId`]} onChange={onChange} sx={getFieldSx(`${prefix}TaxId`)} />
         </Grid>
         <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Телефон" variant="standard" helperText="зразок: 0671234567" name={`${prefix}Phone`} value={fieldsData[`${prefix}Phone`]} onChange={onChange} sx={getFieldSx(`${prefix}Phone`)} />
         </Grid>
         <Grid item xs={12} sm={3}>
            <TextField fullWidth label="Паспорт" variant="standard" helperText="зразок: КА №715409" name={`${prefix}Passport`} value={fieldsData[`${prefix}Passport`]} onChange={onChange} sx={getFieldSx(`${prefix}Passport`)} />
         </Grid>
         <Grid item xs={12} sm={5}>
            <TextField fullWidth label="Ким видано паспорт" variant="standard" helperText="зразок: Шевченківським РВ ЛМУ УМВС України" name={`${prefix}PassportIssued`} value={fieldsData[`${prefix}PassportIssued`]} onChange={onChange} sx={getFieldSx(`${prefix}PassportIssued`)} />
         </Grid>
         <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Місце реєстрації" variant="standard" helperText="зразок: м. Львів, вул. ..." name={`${prefix}Registration`} value={fieldsData[`${prefix}Registration`]} onChange={onChange} sx={getFieldSx(`${prefix}Registration`)} />
         </Grid>
      </>
   );
}
