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

  const [fieldsData, setFieldsData] = useState({
    numberZS: '',
    placeZS: 'м. Львів',
    dateZS: '',
    nameFOP: 'ФОП Рачун Юрій Тарасович',
    zsCurrency: 'долар США',
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          bgcolor: theme.palette.background.paper,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom fontWeight={600}>
          Договір завдатку купівлі-продажу
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          {/* Основні дані */}
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="№ Договору"
              name="numberZS"
              value={fieldsData.numberZS}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Місце договору"
              name="placeZS"
              value={fieldsData.placeZS}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Дата договору"
              name="dateZS"
              value={fieldsData.dateZS}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="ФОП угоди"
              name="nameFOP"
              value={fieldsData.nameFOP}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>Покупець</Divider>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ПІБ покупця"
              name="customerPIB"
              value={fieldsData.customerPIB}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Місце реєстрації"
              name="cPlaceRegister"
              value={fieldsData.cPlaceRegister}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="ІПН"
              name="cIPN"
              value={fieldsData.cIPN}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>Продавець</Divider>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ПІБ продавця"
              name="sellerPIB"
              value={fieldsData.sellerPIB}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Місце реєстрації"
              name="selPlaceRegister"
              value={fieldsData.selPlaceRegister}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="ІПН"
              name="selIPN"
              value={fieldsData.selIPN}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>Об'єкт нерухомості</Divider>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Тип об'єкту"
              name="estateName"
              value={fieldsData.estateName}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Адреса"
              name="estateAdress"
              value={fieldsData.estateAdress}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>Вартість та умови</Divider>
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Вартість об'єкту"
              name="estateCost"
              value={fieldsData.estateCost}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Валюта"
              name="zsCurrency"
              value={fieldsData.zsCurrency}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Сума завдатку"
              name="zsAvans"
              value={fieldsData.zsAvans}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Завдаток агентству"
              name="zsAvansRP"
              value={fieldsData.zsAvansRP}
              onChange={handleChangeData}
            />
          </Grid>

          <Grid item xs={12} mt={3}>
            <Stack direction="row" justifyContent="center" spacing={2}>
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
