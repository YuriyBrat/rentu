'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField } from '@mui/material';
import { NAVODKA_READINESS, NAVODKA_STATUSES } from '../navodky.constants';
import { kyivDateString } from '@/utils/crm/navodky.mjs';

const initial = { title: '', ownerName: '', phone: '', source: '', status: 'active', readiness: 'unknown', propertyType: '', locationText: '', priceExpectation: '', description: '', lastContactAt: '', nextContactAt: '', assignedTo: '' };

export default function NavodkaFormDialog({ open, onClose, onCreated, editItem, employees = [], defaultEmployeeId = '' }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  const selectedEmployee = editItem?.assignedTo;
  const employeeOptions = selectedEmployee?._id && !employees.some(employee => employee._id === selectedEmployee._id)
    ? [...employees, { ...selectedEmployee, lockedAssignment: true }] : employees;
  useEffect(() => {
    if (!open) return;
    const next = { ...initial, assignedTo: defaultEmployeeId || '' };
    if (editItem) {
      for (const key of Object.keys(initial)) next[key] = editItem[key] || initial[key];
      next.assignedTo = editItem.assignedTo?._id || editItem.assignedTo || '';
      for (const key of ['lastContactAt', 'nextContactAt']) next[key] = editItem[key] ? kyivDateString(new Date(editItem[key])) : '';
    }
    setForm(next); setError('');
  }, [open, editItem, defaultEmployeeId]);
  const change = event => { setForm(previous => ({ ...previous, [event.target.name]: event.target.value })); setError(''); };
  const close = () => { if (!busy) onClose?.(); };
  async function submit(event) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true; setBusy(true); setError('');
    try {
      const response = await fetch(editItem ? '/api/crm/navodky/' + editItem._id : '/api/crm/navodky', {
        method: editItem ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, assignedTo: form.assignedTo || null, lastContactAt: form.lastContactAt || null, nextContactAt: form.nextContactAt || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не вдалося зберегти наводку.');
      onCreated?.(data); onClose?.();
    } catch (failure) { setError(failure.message || 'Перевірте з’єднання. Введені дані збережені у формі.'); }
    finally { saving.current = false; setBusy(false); }
  }
  const field = (name, label, extra = {}) => <TextField fullWidth size="small" name={name} id={'navodka-form-' + name} label={label} value={form[name]} onChange={change} {...extra} />;
  return <Dialog open={open} onClose={close} maxWidth="md" aria-labelledby="navodka-form-dialog-title">
    <DialogTitle id="navodka-form-dialog-title">{editItem ? 'Редагувати наводку' : 'Нова наводка'}</DialogTitle>
    <form onSubmit={submit} aria-label="Форма наводки">
      <DialogContent dividers><Grid container spacing={2}>
        <Grid item xs={12} sm={6}>{field('title', 'Назва', { required: true, inputProps: { maxLength: 180 } })}</Grid>
        <Grid item xs={12} sm={6}>{field('ownerName', 'Власник', { required: true, inputProps: { maxLength: 120 } })}</Grid>
        <Grid item xs={12} sm={6}>{field('phone', 'Телефон', { required: true, type: 'tel', inputProps: { maxLength: 80 } })}</Grid>
        <Grid item xs={12} sm={6}>{field('source', 'Джерело', { inputProps: { maxLength: 180 }, placeholder: 'Рекомендація, сайт, дзвінок…' })}</Grid>
        <Grid item xs={12} sm={6}>{field('status', 'Статус', { select: true, children: NAVODKA_STATUSES.map(item => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>) })}</Grid>
        <Grid item xs={12} sm={6}>{field('assignedTo', 'Відповідальний', { select: true, children: [<MenuItem key="none" value="">Без відповідального</MenuItem>, ...employeeOptions.map(employee => <MenuItem key={employee._id} value={employee._id} disabled={employee.lockedAssignment}>{employee.name}{employee.isActive === false ? ' (неактивний)' : ''}</MenuItem>)] })}</Grid>
        <Grid item xs={12} sm={6}>{field('propertyType', 'Тип нерухомості', { inputProps: { maxLength: 100 } })}</Grid>
        <Grid item xs={12} sm={6}>{field('locationText', 'Локація', { inputProps: { maxLength: 300 } })}</Grid>
        <Grid item xs={12} sm={6}>{field('priceExpectation', 'Очікувана ціна', { inputProps: { maxLength: 100 } })}</Grid>
        <Grid item xs={12} sm={6}>{field('readiness', 'Готовність до продажу', { select: true, children: NAVODKA_READINESS.map(item => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>) })}</Grid>
        <Grid item xs={12} sm={6}>{field('lastContactAt', 'Останній контакт', { type: 'date', InputLabelProps: { shrink: true } })}</Grid>
        <Grid item xs={12} sm={6}>{field('nextContactAt', 'Наступний контакт', { type: 'date', InputLabelProps: { shrink: true } })}</Grid>
        <Grid item xs={12}>{field('description', 'Опис / коментар', { multiline: true, minRows: 4, inputProps: { maxLength: 6000 } })}</Grid>
      </Grid>{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}</DialogContent>
      <DialogActions><Button onClick={close} disabled={busy}>Скасувати</Button><Button type="submit" variant="contained" disabled={busy}>{busy ? 'Зберігаємо…' : 'Зберегти'}</Button></DialogActions>
    </form>
  </Dialog>;
}
