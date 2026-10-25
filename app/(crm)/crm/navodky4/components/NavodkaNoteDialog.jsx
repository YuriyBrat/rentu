'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { NAVODKA_NOTE_TYPES } from '../navodky.constants';

const initial = { text: '', type: 'info', activityType: 'note', contactDate: '', nextContactAt: '' };
export default function NavodkaNoteDialog({ open, onClose, item, onCreated }) {
  const [form, setForm] = useState(initial), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const saving = useRef(false);
  useEffect(() => { if (open) { setForm(initial); setError(''); } }, [open, item?._id]);
  const change = event => { setForm(previous => ({ ...previous, [event.target.name]: event.target.value })); setError(''); };
  async function submit(event) {
    event.preventDefault();
    if (saving.current || !item?._id) return;
    saving.current = true; setBusy(true); setError('');
    try {
      const response = await fetch('/api/crm/navodky/' + item._id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newNote: { ...form, contactDate: form.contactDate ? new Date(form.contactDate).toISOString() : null, nextContactAt: form.nextContactAt || null } }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не вдалося зберегти нотатку.');
      onCreated?.(result); onClose?.();
    } catch (failure) { setError(failure.message); }
    finally { saving.current = false; setBusy(false); }
  }
  return <Dialog open={open} onClose={() => { if (!busy) onClose?.(); }} maxWidth="sm" aria-labelledby="navodka-note-title">
    <DialogTitle id="navodka-note-title">Додати запис<Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{item?.title}</Typography></DialogTitle>
    <form onSubmit={submit} aria-label="Нотатка наводки"><DialogContent dividers><Grid container spacing={2}>
      <Grid item xs={12}><TextField fullWidth name="text" id="navodka-note-text" label="Текст" multiline minRows={4} required value={form.text} onChange={change} inputProps={{ maxLength: 6000 }} /></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth select name="type" label="Тип нотатки" value={form.type} onChange={change}>{NAVODKA_NOTE_TYPES.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth select name="activityType" label="Тип контакту" value={form.activityType} onChange={change}>{[['note', 'Нотатка'], ['call', 'Дзвінок'], ['message', 'Переписка'], ['meeting', 'Зустріч']].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth name="contactDate" label="Дата контакту" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.contactDate} onChange={change} /></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth name="nextContactAt" label="Наступний контакт" type="date" InputLabelProps={{ shrink: true }} value={form.nextContactAt} onChange={change} /></Grid>
    </Grid>{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}</DialogContent>
    <DialogActions><Button disabled={busy} onClick={onClose}>Скасувати</Button><Button variant="contained" type="submit" disabled={busy}>{busy ? 'Зберігаємо…' : 'Додати запис'}</Button></DialogActions></form>
  </Dialog>;
}
