'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import HeadsetMicRoundedIcon from '@mui/icons-material/HeadsetMicRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import { Area, AreaChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis } from 'recharts';
import { useCRMTheme } from '../context/CRMThemeContext';
import { CALL_OUTCOMES, CALL_PRIORITIES, getCallPriority, getOpenCallRequests, isCallClaimActive } from '@/utils/crm/callCenter';

const dateLabel = value => value ? new Date(value).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

async function readResponse(response) {
   let data;
   try { data = await response.json(); } catch { throw new Error('Немає відповіді сервера. Перевір інтернет і повтори дію.'); }
   if (!response.ok) throw new Error(data.error || 'Не вдалося виконати дію.');
   return data;
}

export function useCallCenter({ overview, onChange }) {
   const [data, setData] = useState(null);
   const [days, setDays] = useState(1);
   const [syncError, setSyncError] = useState('');
   const [lastSync, setLastSync] = useState(null);
   const [busyId, setBusyId] = useState('');
   const [dialog, setDialog] = useState(null);
   const [activeClaimId, setActiveClaimId] = useState('');
   const latest = useRef(onChange);
   latest.current = onChange;
   const revision = useRef(null);
   const channel = useRef(null);
   const fetching = useRef(false);
   const lastInteraction = useRef(Date.now());

   const refresh = useCallback(async () => {
      if (fetching.current || document.hidden) return;
      fetching.current = true;
      try {
         const response = await fetch(`/api/crm/call-center?summary=${overview ? '1' : '0'}&days=${days}`, { cache: 'no-store' });
         if ([401, 403].includes(response.status) && !overview) return;
         const next = await readResponse(response);
         setData(next);
         setSyncError('');
         setLastSync(Date.now());
         if (revision.current !== null && revision.current !== next.revision) latest.current?.();
         revision.current = next.revision;
      } catch (error) {
         setSyncError('Зв’язок перервано. Спробую оновити автоматично.');
      } finally { fetching.current = false; }
   }, [overview, days]);

   useEffect(() => {
      refresh();
      const timer = setInterval(refresh, 6000);
      const wake = () => { if (!document.hidden) refresh(); };
      const changed = () => { latest.current?.(); refresh(); };
      const touch = () => { lastInteraction.current = Date.now(); };
      window.addEventListener('online', wake);
      window.addEventListener('focus', wake);
      document.addEventListener('visibilitychange', wake);
      window.addEventListener('karamax:parsing-changed', changed);
      window.addEventListener('pointerdown', touch);
      window.addEventListener('keydown', touch);
      if (typeof BroadcastChannel !== 'undefined') {
         channel.current = new BroadcastChannel('karamax-parsing');
         channel.current.onmessage = changed;
      }
      return () => {
         clearInterval(timer);
         window.removeEventListener('online', wake);
         window.removeEventListener('focus', wake);
         document.removeEventListener('visibilitychange', wake);
         window.removeEventListener('karamax:parsing-changed', changed);
         window.removeEventListener('pointerdown', touch);
         window.removeEventListener('keydown', touch);
         channel.current?.close();
      };
   }, [refresh]);

   const notify = useCallback(() => {
      window.dispatchEvent(new Event('karamax:parsing-changed'));
      channel.current?.postMessage('changed');
   }, []);

   const mutate = async (item, payload) => {
      setBusyId(item._id);
      try {
         const result = await readResponse(await fetch(`/api/crm/parsing/${item._id}/workflow`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
         }));
         if (payload.action === 'claim') setActiveClaimId(item._id);
         if (['release', 'outcome'].includes(payload.action)) setActiveClaimId(previous => previous === item._id ? '' : previous);
         notify();
         return result;
      } finally { setBusyId(''); }
   };

   useEffect(() => {
      if (!activeClaimId) return;
      const timer = setInterval(async () => {
         if (document.hidden || Date.now() - lastInteraction.current > 120000) return;
         try {
            const response = await fetch(`/api/crm/parsing/${activeClaimId}/workflow`, {
               method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'heartbeat' }),
            });
            if (response.status === 409) { setActiveClaimId(''); latest.current?.(); }
         } catch { /* Lease expires automatically if the connection is lost. */ }
      }, 60000);
      return () => clearInterval(timer);
   }, [activeClaimId]);

   const openDialog = next => {
      if (next?.type === 'outcome') setActiveClaimId(next.item._id);
      setDialog(next);
   };
   return { data, days, setDays, syncError, lastSync, busyId, dialog, setDialog: openDialog, mutate, notify, refresh, actor: data?.actor };
}

export function CallCenterOverview({ workspace, queue, onQueueChange, onOpenRecord }) {
   const { theme, mode } = useCRMTheme();
   const [showRecent, setShowRecent] = useState(false);
   const { data, days, setDays, syncError, lastSync } = workspace;
   const metrics = [
      ['Спроби дзвінка', data?.stats?.attempts, '#60a5fa'],
      ['Поговорили', data?.stats?.reached, '#34d399'],
      ['Унікальні об’єкти', data?.stats?.unique, '#a78bfa'],
      ['Додано в Базу', data?.stats?.addedBase, '#22d3ee'],
   ];
   const queues = [
      ['new', 'Нові', data?.queue?.new], ['mine', 'В обробці у мене', data?.queue?.mine],
      ['overdue', 'Час передзвонити', data?.queue?.overdue], ['callbacks', 'Мої передзвони', data?.queue?.callbacks],
      ['retry', 'Не додзвонилися', data?.queue?.retry],
      ['requests', 'Запити рієлторів', data?.queue?.requests], ['all', 'Усі оголошення', null],
   ];
   return (
      <Stack spacing={1.5} sx={{ mb: 2 }}>
         <Box sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, border: `1px solid ${theme.border}`, background: mode === 'light' ? 'linear-gradient(115deg, #f0f7ff, #faf5ff)' : 'linear-gradient(115deg, rgba(30,64,100,0.35), rgba(70,40,105,0.20))' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
               <Stack direction="row" spacing={1} alignItems="center">
                  <HeadsetMicRoundedIcon sx={{ color: '#60a5fa' }} />
                  <Box>
                     <Typography sx={{ fontWeight: 900, fontSize: 17 }}>Мій день{data?.actor?.name ? ` · ${data.actor.name}` : ''}</Typography>
                     <Typography sx={{ fontSize: 11, color: theme.textSoft }}>Мої зафіксовані дзвінки та результати</Typography>
                  </Box>
               </Stack>
               <Stack direction="row" spacing={0.5}>
                  {[[1, 'Сьогодні'], [7, '7 днів'], [30, '30 днів']].map(([value, label]) => (
                     <Button key={value} size="small" onClick={() => setDays(value)} sx={{ color: days === value ? '#60a5fa' : theme.textSoft, bgcolor: days === value ? 'rgba(96,165,250,0.14)' : 'transparent', borderRadius: 2, textTransform: 'none' }}>{label}</Button>
                  ))}
               </Stack>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr)) minmax(180px, 1.5fr)' }, gap: 1.25, alignItems: 'center' }}>
               {metrics.map(([label, value, color]) => (
                  <Box key={label} sx={{ px: 1.25, py: 0.75, borderLeft: `2px solid ${color}`, minWidth: 0 }}>
                     <Typography sx={{ fontSize: 27, lineHeight: 1.15, fontWeight: 950, color }}>{value ?? '—'}</Typography>
                     <Typography sx={{ fontSize: 11, color: theme.textSoft }}>{label}</Typography>
                  </Box>
               ))}
               <Box sx={{ height: 76, minWidth: 0, gridColumn: { xs: '1 / -1', md: 'auto' } }}>
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={data?.chart || []} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <XAxis dataKey="label" tick={{ fill: theme.textSoft, fontSize: 9 }} axisLine={false} tickLine={false} minTickGap={18} />
                        <ChartTooltip contentStyle={{ background: theme.bgPanel, borderColor: theme.border, borderRadius: 10, fontSize: 12 }} />
                        <Area type="monotone" dataKey="attempts" name="Спроби" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.13} strokeWidth={2} />
                        <Area type="monotone" dataKey="reached" name="Поговорили" stroke="#34d399" fill="#34d399" fillOpacity={0.08} strokeWidth={2} />
                     </AreaChart>
                  </ResponsiveContainer>
               </Box>
            </Box>
         </Box>
         <Stack direction="row" gap={0.65} flexWrap="wrap" alignItems="center">
            {queues.map(([value, label, count]) => (
               <Button key={value} onClick={() => onQueueChange(value)} size="small" sx={{ px: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 800, color: queue === value ? '#60a5fa' : theme.textSoft, border: `1px solid ${queue === value ? '#60a5fa88' : theme.border}`, bgcolor: queue === value ? 'rgba(96,165,250,0.10)' : 'transparent' }}>
                  {label}{count != null ? ` · ${count}` : ''}
               </Button>
            ))}
            <Button size="small" onClick={() => setShowRecent(value => !value)} sx={{ color: showRecent ? '#a78bfa' : theme.textSoft, textTransform: 'none' }}>Моя активність</Button>
            <Typography sx={{ ml: 'auto', fontSize: 10.5, color: syncError ? '#f59e0b' : theme.textSoft }}>
               {syncError ? 'Зв’язок перервано' : lastSync ? `● Оновлено ${new Date(lastSync).toLocaleTimeString('uk-UA')}` : 'Підключення…'}
            </Typography>
         </Stack>
         {showRecent && <Box sx={{ p: 1.25, borderRadius: 2.5, border: `1px solid ${theme.border}` }}>
            <Typography sx={{ fontSize: 12, fontWeight: 850, mb: 0.75 }}>Останні 8 моїх комунікацій за обраний період</Typography>
            {!data?.recent?.length && <Typography sx={{ fontSize: 12, color: theme.textSoft }}>Комунікацій за цей період поки немає.</Typography>}
            {(data?.recent || []).map(record => <Button key={record._id} onClick={() => onOpenRecord?.(record.entityId)} sx={{ display: 'flex', width: '100%', justifyContent: 'flex-start', textAlign: 'left', gap: 1.25, textTransform: 'none', color: theme.text, borderRadius: 1.5 }}>
               <Typography sx={{ fontSize: 10.5, color: theme.textSoft, flexShrink: 0 }}>{dateLabel(record.happenedAt)}</Typography>
               <Typography sx={{ fontSize: 12 }} noWrap>{CALL_OUTCOMES[record.meta?.callCenter?.outcome] || (record.type === 'call' ? 'Дзвінок' : 'Комунікація')} · {record.text || 'Без нотатки'}</Typography>
            </Button>)}
         </Box>}
         {syncError && <Alert severity="warning" action={<Button color="inherit" onClick={workspace.refresh}>Оновити</Button>}>{syncError}</Alert>}
      </Stack>
   );
}

export function CallWorkflowBar({ item, workspace, expanded, now }) {
   const { theme } = useCRMTheme();
   const [error, setError] = useState('');
   if (!workspace?.actor || String(item._id).startsWith('demo-')) return null;
   const actor = workspace.actor;
   const active = isCallClaimActive(item, now);
   const mine = active && item.callQueue.ownerKey === actor.key;
   const requests = getOpenCallRequests(item);
   const priority = getCallPriority(item);
   const canRequest = ['owner', 'admin', 'manager', 'realtor'].includes(actor.role);
   const action = async name => {
      setError('');
      try { await workspace.mutate(item, { action: name }); } catch (error) { setError(error.message); }
   };
   return (
      <Stack spacing={0.6} sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
         <Stack direction="row" gap={0.65} alignItems="center" flexWrap="wrap">
            {priority && <Tooltip title={requests.map(request => `${request.requestedByName}: ${request.note || CALL_PRIORITIES[request.level]?.label}`).join('\n')}>
               <Chip size="small" icon={<StarRoundedIcon sx={{ color: `${priority.color} !important` }} />} label={`${priority.label} · ${requests.length}`} sx={{ height: 24, fontSize: 11, color: priority.color, bgcolor: `${priority.color}16` }} />
            </Tooltip>}
            {active && <Chip size="small" label={`В обробці: ${item.callQueue.ownerName}${mine ? ' · я' : ''}`} sx={{ height: 24, fontSize: 11, color: '#22d3ee', bgcolor: 'rgba(34,211,238,0.12)' }} />}
            {item.callQueue?.nextContactAt && <Typography sx={{ fontSize: 11, color: new Date(item.callQueue.nextContactAt).getTime() < now ? '#fb7185' : theme.textSoft }}>Передзвін: {dateLabel(item.callQueue.nextContactAt)}</Typography>}
            {item.callQueue?.lastOutcome && <Typography sx={{ fontSize: 10.5, color: theme.textSoft }}>{CALL_OUTCOMES[item.callQueue.lastOutcome]}</Typography>}
            <Stack direction="row" spacing={0.6} sx={{ ml: 'auto' }}>
               {canRequest && <Button size="small" startIcon={<StarRoundedIcon />} onClick={() => workspace.setDialog({ type: 'priority', item })} sx={{ textTransform: 'none', fontSize: 11, color: priority?.color || theme.textSoft }}>Запит</Button>}
               {!active && <Button size="small" disabled={workspace.busyId === item._id} onClick={() => action('claim')} startIcon={<HeadsetMicRoundedIcon />} sx={{ color: '#60a5fa', fontSize: 11, textTransform: 'none' }}>В обробку</Button>}
               {mine && <>
                  <Button size="small" startIcon={<PhoneInTalkRoundedIcon />} onClick={() => workspace.setDialog({ type: 'outcome', item })} sx={{ color: '#34d399', fontSize: 11, textTransform: 'none' }}>Результат дзвінка</Button>
                  <Button size="small" disabled={workspace.busyId === item._id} onClick={() => action('release')} sx={{ color: theme.textSoft, fontSize: 11, textTransform: 'none' }}>Звільнити</Button>
               </>}
            </Stack>
         </Stack>
         {error && <Alert severity="warning" onClose={() => setError('')}>{error}</Alert>}
         {expanded && (item.callRequests || []).map(request => (
            <Box key={request._id} sx={{ px: 1.25, py: 0.8, borderRadius: 2, border: `1px solid ${theme.border}` }}>
               <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                  <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: request.resolvedAt ? '#34d399' : CALL_PRIORITIES[request.level]?.color }}>
                     {request.requestedByName} · {request.resolvedAt ? 'Виконано' : CALL_PRIORITIES[request.level]?.label}{request.dueAt ? ` · до ${dateLabel(request.dueAt)}` : ''}
                  </Typography>
                  {!request.resolvedAt && mine && <Button size="small" onClick={() => workspace.setDialog({ type: 'resolveRequest', item, request })} sx={{ fontSize: 11, textTransform: 'none' }}>Відповісти</Button>}
               </Stack>
               {request.note && <Typography sx={{ fontSize: 12, color: theme.textSoft, whiteSpace: 'pre-wrap' }}>{request.note}</Typography>}
               {request.resolvedAt && <Typography sx={{ fontSize: 12, color: '#34d399', whiteSpace: 'pre-wrap' }}>{request.resolution}</Typography>}
            </Box>
         ))}
      </Stack>
   );
}

export function CallWorkflowDialogs({ workspace, onDecision }) {
   const { theme } = useCRMTheme();
   const { dialog } = workspace;
   const [form, setForm] = useState({});
   const [error, setError] = useState('');
   const [saving, setSaving] = useState(false);
   const submissionId = useRef('');
   useEffect(() => {
      const existing = dialog?.item?.callRequests?.find(request => !request.resolvedAt && request.requestedByKey === workspace.actor?.key);
      const dueAt = existing?.dueAt ? new Date(new Date(existing.dueAt).getTime() - new Date(existing.dueAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
      setForm({ outcome: 'reached', text: '', level: existing?.level || 'interesting', note: existing?.note || '', nextContactAt: '', dueAt, resolution: '' });
      setError('');
      submissionId.current = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
   }, [dialog, workspace.actor?.key]);
   const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
   const close = () => { if (!saving) workspace.setDialog(null); };
   const submit = async decision => {
      setSaving(true); setError('');
      try {
         const type = dialog.type;
         const result = await workspace.mutate(dialog.item, {
            action: type, ...form, submissionId: submissionId.current,
            requestId: dialog.request?._id,
            nextContactAt: form.nextContactAt ? new Date(form.nextContactAt).toISOString() : null,
            dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
         });
         workspace.setDialog(null);
         if (decision) onDecision?.(result.item, form.text);
      } catch (error) { setError(error.message); } finally { setSaving(false); }
   };
   const fieldSx = { '& .MuiInputBase-root': { color: theme.text }, '& .MuiInputLabel-root': { color: theme.textSoft }, '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border }, '& .MuiSelect-icon': { color: theme.textSoft } };
   return (
      <Dialog open={!!dialog} onClose={close} fullWidth maxWidth="sm" disableScrollLock PaperProps={{ sx: { bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 3 } }}>
         <DialogTitle sx={{ fontWeight: 900 }}>{dialog?.type === 'priority' ? 'Запит на продзвін' : dialog?.type === 'resolveRequest' ? 'Відповідь рієлтору' : 'Результат дзвінка'}</DialogTitle>
         <DialogContent>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
               <Typography sx={{ fontSize: 13, color: theme.textSoft }}>{dialog?.item?.title}</Typography>
               {dialog?.type === 'priority' && <>
                  <TextField select label="Пріоритет" value={form.level || 'interesting'} onChange={event => set('level', event.target.value)} sx={fieldSx} disabled={saving}>
                     {Object.entries(CALL_PRIORITIES).map(([key, value]) => <MenuItem key={key} value={key}>{value.label}</MenuItem>)}
                  </TextField>
                  <TextField label="Що потрібно уточнити" value={form.note || ''} onChange={event => set('note', event.target.value)} multiline minRows={3} sx={fieldSx} disabled={saving} />
                  <TextField label="Продзвонити до" type="datetime-local" value={form.dueAt || ''} onChange={event => set('dueAt', event.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} required={form.level === 'urgent'} disabled={saving} />
               </>}
               {dialog?.type === 'outcome' && <>
                  <TextField select label="Результат" value={form.outcome || 'reached'} onChange={event => set('outcome', event.target.value)} sx={fieldSx} disabled={saving}>
                     {Object.entries(CALL_OUTCOMES).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
                  </TextField>
                  <TextField label="Коротка нотатка" value={form.text || ''} onChange={event => set('text', event.target.value)} multiline minRows={3} sx={fieldSx} disabled={saving} />
                  <TextField label="Наступний дзвінок" type="datetime-local" value={form.nextContactAt || ''} onChange={event => set('nextContactAt', event.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} required={form.outcome === 'callback'} disabled={saving} />
               </>}
               {dialog?.type === 'resolveRequest' && <>
                  <Typography sx={{ fontSize: 13 }}>{dialog.request?.requestedByName}: {dialog.request?.note}</Typography>
                  <TextField label="Що вдалося з’ясувати" value={form.resolution || ''} onChange={event => set('resolution', event.target.value)} multiline minRows={3} sx={fieldSx} disabled={saving} />
               </>}
               {error && <Alert severity="error">{error}</Alert>}
            </Stack>
         </DialogContent>
         <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 0.5 }}>
            <Button onClick={close} disabled={saving} sx={{ color: theme.textSoft }}>Скасувати</Button>
            {dialog?.type === 'outcome' && form.outcome === 'reached' && <Button onClick={() => submit(true)} disabled={saving} sx={{ color: '#60a5fa', textTransform: 'none' }}>Зберегти й оцінити об’єкт</Button>}
            <Button onClick={() => submit(false)} disabled={saving} variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>{saving ? 'Збереження…' : 'Зберегти'}</Button>
         </DialogActions>
      </Dialog>
   );
}
