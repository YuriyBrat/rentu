'use client';

import { useState } from 'react';
import { Avatar, Box, Button, Chip, Collapse, Divider, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCommentIcon from '@mui/icons-material/AddComment';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { NAVODKA_STATUSES, NAVODKA_READINESS } from '../navodky.constants';
import { navodkaDate, navodkaPanelSx } from '../navodky.theme';
import { kyivDateString } from '@/utils/crm/navodky.mjs';

const statusColors = { active: 'warning', contact: 'info', waiting: 'secondary', converted: 'success', lost: 'error' };
const noteLabels = { positive: 'Позитивна', negative: 'Негативна', info: 'Інформуюча', important: 'Важлива' };
const noteColors = { positive: 'success', negative: 'error', info: 'warning', important: 'info' };
const activityLabels = { note: 'Нотатка', call: 'Дзвінок', message: 'Переписка', meeting: 'Зустріч' };
const employeeName = employee => employee?.name || [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') || 'Не вказано';

export default function NavodkaRowCard({ item, onCreateNote, onCall, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const color = statusColors[item.status] || 'warning';
  const nextDate = item.nextContactAt ? kyivDateString(new Date(item.nextContactAt)) : '';
  const today = kyivDateString();
  const overdue = nextDate && nextDate < today;
  const notes = [...(item.notes || [])].sort((a, b) => new Date(b.contactDate || b.createdAt || 0) - new Date(a.contactDate || a.createdAt || 0));
  const detailsId = 'navodka-details-' + item._id;
  return <Paper elevation={0} data-navodka-id={item._id} data-phone-visible={item.canViewPhone ? 'true' : 'false'} sx={{ ...navodkaPanelSx, borderLeft: 4, borderLeftColor: color + '.main', overflow: 'hidden', '& .MuiTypography-root': { overflowWrap: 'anywhere' } }}>
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ lg: 'center' }} justifyContent="space-between">
      <Stack direction="row" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
        <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main', width: 42, height: 42 }}>{item.ownerName?.[0] || 'Н'}</Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Typography component="h2" sx={{ fontSize: 18, fontWeight: 800, overflowWrap: 'anywhere' }}>{item.title}</Typography>
            <Chip size="small" color={color} variant="outlined" label={NAVODKA_STATUSES.find(status => status.value === item.status)?.label || item.status} />
            <Chip size="small" variant="outlined" label={NAVODKA_READINESS.find(value => value.value === item.readiness)?.label || 'Невідомо'} />
          </Stack>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            <Typography variant="body2">{item.ownerName}</Typography>
            {item.canViewPhone && item.phone ? <Box component="a" href={'tel:' + item.phone} sx={{ color: 'primary.main', fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>{item.phone}</Box> : <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}><LockOutlinedIcon sx={{ fontSize: 15 }} /><Typography variant="body2">Телефон закритий</Typography></Stack>}
            {item.locationText && <Typography variant="body2" color="text.secondary">{item.locationText}</Typography>}
            {item.priceExpectation && <Typography variant="body2" color="text.secondary">{item.priceExpectation}</Typography>}
          </Stack>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
            <Typography variant="caption" color="text.secondary">{item.source || 'Без джерела'}</Typography>
            <Typography variant="caption" color="text.secondary">{item.assignedTo ? 'Відповідальний: ' + employeeName(item.assignedTo) : 'Без відповідального'}</Typography>
            <Typography variant="caption" color={overdue ? 'error.main' : nextDate === today ? 'warning.main' : 'text.secondary'}>{nextDate ? 'Контакт: ' + navodkaDate(item.nextContactAt) + (overdue ? ' · прострочено' : nextDate === today ? ' · сьогодні' : '') : 'Контакт не заплановано'}</Typography>
            <Typography variant="caption" color="text.secondary">Оновлено: {navodkaDate(item.updatedAt || item.createdAt, true)}</Typography>
          </Stack>
        </Box>
      </Stack>
      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end" useFlexGap flexWrap="wrap">
        {item.canEdit && <Button size="small" startIcon={<AddCommentIcon />} onClick={() => onCreateNote?.(item)}>Нотатка</Button>}
        <Tooltip title={item.canViewPhone ? 'Подзвонити' : 'Телефон доступний відповідальному, його керівникам та адміністратору'}><span><IconButton size="small" aria-label="Подзвонити" disabled={!item.canViewPhone || !item.phone} onClick={() => onCall?.(item)}><PhoneIcon /></IconButton></span></Tooltip>
        {item.canEdit && <Tooltip title="Редагувати"><IconButton size="small" aria-label="Редагувати наводку" onClick={() => onEdit?.(item)}><EditIcon /></IconButton></Tooltip>}
        <Tooltip title={open ? 'Згорнути' : 'Розгорнути'}><IconButton size="small" aria-label={open ? 'Згорнути наводку' : 'Розгорнути наводку'} aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen(value => !value)} color={open ? 'primary' : 'default'}>{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton></Tooltip>
      </Stack>
    </Stack>
    <Collapse in={open} unmountOnExit>
      <Box id={detailsId} sx={{ pt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} lg={5}><Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Typography component="h3" fontWeight={800} sx={{ mb: 1.5 }}>Деталі</Typography>
            <Stack spacing={1}>
              <Typography variant="body2">Додано: {navodkaDate(item.createdAt, true)}</Typography>
              <Typography variant="body2">Оновлено: {navodkaDate(item.updatedAt, true)}</Typography>
              <Typography variant="body2">Останній контакт: {navodkaDate(item.lastContactAt, true)}</Typography>
              <Typography variant="body2">Наступний контакт: {navodkaDate(item.nextContactAt, true)}</Typography>
              <Typography variant="body2">Вніс: {employeeName(item.createdBy)}</Typography>
              {item.propertyType && <Typography variant="body2">Нерухомість: {item.propertyType}</Typography>}
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.phoneHidden ? 'Опис і контактні дані доступні відповідальному працівнику, його керівникам та адміністратору.' : item.description || 'Без опису'}</Typography>
            </Stack>
          </Box></Grid>
          <Grid item xs={12} lg={7}><Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Typography component="h3" fontWeight={800} sx={{ mb: 1.5 }}>Історія контактів і нотатки</Typography>
            <Stack spacing={1.25}>
              {item.phoneHidden ? <Typography color="text.secondary" variant="body2">Нотатки закриті разом із контактними даними.</Typography> : notes.length ? notes.map(note => <Box key={note._id} sx={{ p: 1.3, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap"><Chip size="small" variant="outlined" label={activityLabels[note.activityType] || 'Нотатка'} /><Chip size="small" color={noteColors[note.type] || 'info'} variant="outlined" label={noteLabels[note.type] || 'Нотатка'} /><Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>{navodkaDate(note.contactDate || note.createdAt, true)}</Typography></Stack>
                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{note.text}</Typography>
                <Stack direction="row" justifyContent="space-between" useFlexGap flexWrap="wrap" sx={{ mt: 1 }}><Typography variant="caption" color="text.secondary">{employeeName(note.createdBy)}</Typography><Typography variant="caption" color="text.secondary">Внесено: {navodkaDate(note.createdAt, true)}</Typography></Stack>
              </Box>) : <Typography color="text.secondary" variant="body2">Нотаток ще немає</Typography>}
            </Stack>
          </Box></Grid>
        </Grid>
        {item.canDelete && <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}><Button color="error" size="small" startIcon={<DeleteOutlineIcon />} onClick={() => onDelete?.(item)}>Видалити наводку</Button></Stack>}
      </Box>
    </Collapse>
  </Paper>;
}
