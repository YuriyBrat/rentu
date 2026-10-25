'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, InputAdornment, LinearProgress, MenuItem, Pagination, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import NavodkaRowCard from './components/NavodkaRowCard';
import NavodkaFormDialog from './components/NavodkaFormDialog';
import NavodkaNoteDialog from './components/NavodkaNoteDialog';
import NavodkyTheme, { navodkaPanelSx } from './navodky.theme';
import { NAVODKA_STATUSES } from './navodky.constants';

const initialFilters = { q: '', status: 'all', source: 'all', period: 'all', dateField: 'updatedAt', from: '', to: '', assignedTo: 'all', readiness: 'all', contactFilter: 'all', sort: 'updatedAt' };

function FilterSelect({ name, label, value, onChange, options }) {
  return <TextField id={'navodky-' + name} name={name} fullWidth select size="small" label={label} value={value} onChange={event => onChange(name, event.target.value)}>
    {options.map(([key, text]) => <MenuItem key={key} value={key}>{text}</MenuItem>)}
  </TextField>;
}

export default function NavodkyPage() {
  return <NavodkyTheme><NavodkyContent /></NavodkyTheme>;
}

function NavodkyContent() {
  const [filters, setFilters] = useState(initialFilters);
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState({ sources: [], employees: [] });
  const [permissions, setPermissions] = useState({});
  const [stats, setStats] = useState({ total: 0, today: 0, overdue: 0, active: 0 });
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [noteItem, setNoteItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const deletingRef = useRef(false);
  const reload = () => setRefresh(value => value + 1);
  const changeFilter = (name, value) => { setFilters(previous => ({ ...previous, [name]: value })); setPage(1); };

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setFilters(previous => ({ ...previous, q }));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams({ ...filters, page: String(page), pageSize: String(pageSize) });
        const response = await fetch('/api/crm/navodky?' + query, { signal: controller.signal, cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Не вдалося завантажити наводки.');
        if (controller.signal.aborted) return;
        if (page > 1 && page > result.pagination.pages) { setPage(Math.max(1, result.pagination.pages)); return; }
        setItems(result.items || []);
        setStats(result.stats);
        setPagination(result.pagination);
        setOptions(result.filters);
        setPermissions(result.permissions);
      } catch (failure) {
        if (!controller.signal.aborted) {
          setError(failure.message || 'Перевірте з’єднання та спробуйте ще раз.');
          setItems([]);
        }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [filters, page, pageSize, refresh]);

  async function confirmDelete() {
    if (!deleteItem || deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true); setDeleteError('');
    try {
      const response = await fetch('/api/crm/navodky/' + deleteItem._id, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Не вдалося видалити наводку.');
      setItems(previous => previous.filter(item => item._id !== deleteItem._id));
      setDeleteItem(null);
      reload();
    } catch (failure) { setDeleteError(failure.message); }
    finally { deletingRef.current = false; setDeleting(false); }
  }

  const select = (name, label, values) => <FilterSelect name={name} label={label} value={filters[name]} onChange={changeFilter} options={values} />;
  const changed = Object.keys(initialFilters).some(key => filters[key] !== initialFilters[key]);
  // Keep the selected source readable after its last matching record is deleted.
  const sourceChoices = [...new Set([...options.sources, ...(!['all', '__none__'].includes(filters.source) ? [filters.source] : [])])];

  return <Box sx={{ p: { xs: 1.5, md: 3 }, color: 'text.primary', minWidth: 0 }}>
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Box><Typography component="h1" sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 850 }}>Наводки</Typography><Typography color="text.secondary" variant="body2">Звернення власників, контакти та наступні кроки</Typography></Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap"><Button aria-label="Оновити наводки" startIcon={<RefreshIcon />} onClick={reload} disabled={loading}>Оновити</Button>{permissions.canCreate && <Button variant="contained" onClick={() => { setEditItem(null); setOpenForm(true); }}>+ Додати наводку</Button>}</Stack>
      </Stack>

      <Grid container spacing={1.5}>
        {[['За фільтрами', stats.total], ['Контакт сьогодні', stats.today], ['Прострочені', stats.overdue], ['Активні / на контакті', stats.active]].map(([label, value], index) => <Grid item xs={6} md={3} key={label}>
          <Paper elevation={0} sx={navodkaPanelSx}><Typography color="text.secondary" variant="body2">{label}</Typography><Typography sx={{ fontSize: 28, fontWeight: 850, color: index === 2 && value ? 'error.main' : 'text.primary' }}>{value}</Typography></Paper>
        </Grid>)}
      </Grid>

      <Paper elevation={0} sx={navodkaPanelSx}>
        <Box component="section" aria-label="Фільтри наводок" sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5, '& > *': { minWidth: 0 } }}>
          <TextField id="navodky-search" fullWidth size="small" label="Пошук" placeholder="Назва, власник, телефон, район…" value={filters.q} onChange={event => changeFilter('q', event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }} />
          {select('source', 'Джерело', [['all', 'Усі джерела'], ['__none__', 'Без джерела'], ...sourceChoices.map(source => [source, source])])}
          {select('status', 'Статус', [['all', 'Усі статуси'], ...NAVODKA_STATUSES.map(option => [option.value, option.label])])}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>{select('assignedTo', 'Відповідальний', [['all', 'Усі'], ['__none__', 'Без відповідального'], ...options.employees.map(employee => [employee._id, employee.name])])}</Box>
            <Tooltip title="Скинути фільтри"><span><IconButton aria-label="Скинути фільтри" disabled={!changed} onClick={() => { setFilters(initialFilters); setPage(1); }}><FilterAltOffIcon /></IconButton></span></Tooltip>
          </Stack>
          {select('period', 'Період', [['all', 'За весь час'], ['today', 'Сьогодні'], ['7d', 'Останні 7 днів'], ['30d', 'Останні 30 днів'], ['custom', 'Власний період']])}
          {select('dateField', 'Період за датою', [['updatedAt', 'Оновлення'], ['createdAt', 'Додавання']])}
          {filters.period === 'custom' && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
            <TextField fullWidth size="small" id="navodky-from" label="Від" type="date" value={filters.from} InputLabelProps={{ shrink: true }} inputProps={{ max: filters.to || undefined }} onChange={event => changeFilter('from', event.target.value)} />
            <TextField fullWidth size="small" id="navodky-to" label="До включно" type="date" value={filters.to} InputLabelProps={{ shrink: true }} inputProps={{ min: filters.from || undefined }} onChange={event => changeFilter('to', event.target.value)} />
          </Box>}
          <Box sx={{ gridColumn: { md: filters.period === 'custom' ? 'auto' : 'span 2' } }}>{select('contactFilter', 'Наступний контакт', [['all', 'Усі контакти'], ['today', 'Сьогодні'], ['overdue', 'Прострочені'], ['planned', 'Заплановані далі'], ['unscheduled', 'Не заплановано']])}</Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>Повторити</Button>}>{error}</Alert>}
      {loading && <LinearProgress aria-label="Завантаження наводок" />}
      <Stack spacing={1.5} aria-busy={loading}>
        {items.map(item => <NavodkaRowCard key={item._id} item={item} onCreateNote={setNoteItem} onCall={row => { if (row.canViewPhone && row.phone) window.location.href = 'tel:' + row.phone; }} onEdit={row => { if (row.canEdit) { setEditItem(row); setOpenForm(true); } }} onDelete={row => { setDeleteError(''); setDeleteItem(row); }} />)}
        {!loading && !error && !items.length && <Paper elevation={0} sx={{ ...navodkaPanelSx, p: 4, textAlign: 'center' }}><Typography variant="h6">Наводок за цими умовами немає</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>Змініть період або скиньте фільтри.</Typography></Paper>}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
        <Typography variant="body2" color="text.secondary">Знайдено: {pagination.total}{items.length ? ' · На сторінці: ' + items.length : ''}</Typography>
        {pagination.pages > 1 && <Pagination page={page} count={pagination.pages} onChange={(_, value) => setPage(value)} color="primary" size="small" siblingCount={0} disabled={loading} />}
        <TextField select size="small" label="На сторінці" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }} sx={{ minWidth: 110 }}>{[25, 50, 100].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      </Stack>
    </Stack>

    <NavodkaFormDialog open={openForm} onClose={() => setOpenForm(false)} onCreated={reload} editItem={editItem} employees={options.employees} defaultEmployeeId={permissions.canManageAll ? '' : permissions.employeeId} />
    <NavodkaNoteDialog open={!!noteItem} onClose={() => setNoteItem(null)} item={noteItem} onCreated={reload} />
    <Dialog open={!!deleteItem} onClose={() => { if (!deleting) setDeleteItem(null); }} maxWidth="xs" aria-labelledby="navodka-delete-title">
      <DialogTitle id="navodka-delete-title">Видалити наводку?</DialogTitle>
      <DialogContent><DialogContentText>{deleteItem?.title}</DialogContentText><Typography variant="body2" sx={{ mt: 1.5 }}>Контакт і нотатки цієї наводки буде видалено з CRM. Відновлення не передбачене.</Typography>{deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}</DialogContent>
      <DialogActions><Button disabled={deleting} onClick={() => setDeleteItem(null)}>Скасувати</Button><Button variant="contained" color="error" disabled={deleting} onClick={confirmDelete} startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}>{deleting ? 'Видаляємо…' : 'Видалити'}</Button></DialogActions>
    </Dialog>
  </Box>;
}
