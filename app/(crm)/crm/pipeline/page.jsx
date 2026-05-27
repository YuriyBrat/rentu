'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   CircularProgress,
   Chip,
   Avatar,
   TextField,
   MenuItem,
   Drawer,
   Divider,
   Button,
   Dialog,
   DialogTitle,
   DialogContent,
   Alert,
} from '@mui/material';

import {
   DndContext,
   PointerSensor,
   useSensor,
   useSensors,
   closestCorners,
   useDroppable
} from '@dnd-kit/core';

import {
   SortableContext,
   useSortable,
   verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import useCurrentUser from '@/utils/useCurrentUser';
import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

const HEADER_HEIGHT = 64;

const STAGE_META = {
   ps: { label: 'ПС', color: '#60a5fa', text: '#111' },
   rs: { label: 'РС', color: '#2dd4bf', text: '#111' },
   ds: { label: 'ДС', color: '#fb923c', text: '#111' },
   pzs: { label: 'ПЗС', color: '#f472b6', text: '#111' },
   zs: { label: 'ЗС', color: '#4ade80', text: '#111' },
   pers: { label: 'ПЕРС', color: '#a78bfa', text: '#111' },
};
const STAGES = [
   { id: 'ps', label: 'ПС', color: '#60a5fa', text: '#111' },      // синій
   { id: 'rs', label: 'РС', color: '#2dd4bf', text: '#111' },      // бірюзовий
   { id: 'ds', label: 'ДС', color: '#fb923c', text: '#111' },      // помаранчевий
   { id: 'pzs', label: 'ПЗС', color: '#f472b6', text: '#111' },    // рожево-малиновий
   { id: 'zs', label: 'ЗС', color: '#4ade80', text: '#111' },      // зелений
   { id: 'pers', label: 'ПЕРС', color: '#a78bfa', text: '#111' },  // фіолетовий
];

function formatMoney(value) {
   if (!value) return '—';
   return `${Number(value).toLocaleString('uk-UA')} $`;
}

function getNoteMeta(type, mode, theme) {
   const light = {
      positive: { label: 'Позитивна', color: '#047857', bg: '#ecfdf5', border: 'rgba(4,120,87,0.22)' },
      negative: { label: 'Негативна', color: '#b91c1c', bg: '#fef2f2', border: 'rgba(185,28,28,0.20)' },
      info: { label: 'Інформуюча', color: '#92400e', bg: '#fffbeb', border: 'rgba(146,64,14,0.22)' },
      important: { label: 'Важлива', color: '#1d4ed8', bg: '#eff6ff', border: 'rgba(29,78,216,0.22)' },
   };
   const dark = {
      positive: { label: 'Позитивна', color: '#86efac', bg: 'rgba(34,197,94,0.14)', border: 'rgba(34,197,94,0.24)' },
      negative: { label: 'Негативна', color: '#fca5a5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.24)' },
      info: { label: 'Інформуюча', color: '#fde68a', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.24)' },
      important: { label: 'Важлива', color: '#93c5fd', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.24)' },
   };
   const fallback = { label: 'Нотатка', color: theme.text, bg: theme.hover, border: theme.border };
   return (mode === 'light' ? light : dark)[type] || fallback;
}

const getFieldSx = (theme) => ({
   '& .MuiOutlinedInput-root': {
      bgcolor: theme.hover,
      borderRadius: 3,
      color: theme.text,
      '& fieldset': { borderColor: theme.border },
      '&:hover fieldset': { borderColor: theme.accent },
      '&.Mui-focused fieldset': { borderColor: theme.accentLight },
   },
   '& .MuiInputLabel-root': {
      color: theme.textSoft,
   },
   '& .MuiSelect-icon': {
      color: theme.text,
   },
   '& .MuiSelect-select': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
});

function LeadCard({ item, isMine, onOpen, theme, mode }) {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: item._id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
   };

   // const stageMeta = STAGE_META[item.stage] || { label: item.stage, color: '#9ca3af', text: '#111' };


   return (
      // <Box
      //    ref={setNodeRef}
      //    style={style}
      //    {...attributes}
      //    {...listeners}
      //    sx={{
      //       p: 1.1,
      //       borderRadius: 3,
      //       border: '1px solid rgba(255,255,255,0.08)',
      //       bgcolor: isDragging ? 'rgba(139,92,246,0.16)' : 'rgba(255,255,255,0.04)',
      //       cursor: 'grab',
      //       boxShadow: isDragging ? '0 16px 32px rgba(0,0,0,0.28)' : 'none',
      //    }}
      // >
      <Box
         ref={setNodeRef}
         style={style}
         {...attributes}
         {...listeners}
         onClick={() => onOpen?.(item)}
         sx={{
            p: 1.1,
            borderRadius: 3,
            border: isMine
               ? `1px solid ${theme.accent}`
               : `1px solid ${theme.border}`,
            bgcolor: isDragging
               ? theme.hover
               : isMine
                  ? theme.hover
                  : mode === 'light' ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.04)',
            cursor: 'grab',
            boxShadow: isDragging
               ? '0 16px 32px rgba(0,0,0,0.28)'
               : isMine
                  ? `0 0 0 1px ${theme.glow}`
                  : 'none',
            transition: '0.18s ease',
            '&:hover': {
               bgcolor: isMine
                  ? theme.hover
                  : mode === 'light' ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.06)',
            },
         }}
      >
         <Stack spacing={0.55}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
               <Typography
                  sx={{ color: theme.text, fontWeight: 800, fontSize: 13.5, lineHeight: 1.2 }}
               >
                  {item.name}
               </Typography>

               <Chip
                  label={formatMoney(item.budgetMax)}
                  size="small"
                  sx={{
                     bgcolor: mode === 'light' ? '#ecfdf5 !important' : 'rgba(17,24,39,0.92) !important',
                     color: mode === 'light' ? '#047857' : '#5eead4',
                     border: mode === 'light' ? '1px solid rgba(4,120,87,0.18)' : '1px solid rgba(156,163,175,0.28)',
                     fontWeight: 500,
                  }}
               />
            </Stack>

            <Typography
               sx={{
                  color: theme.textSoft,
                  fontSize: 12,
                  lineHeight: 1.25,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
               }}
            >
               {item.requestSummary || 'Без опису'}
            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
               <Typography
                  sx={{
                     color: theme.textSoft,
                     fontSize: 11,
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                  }}
               >
                  {item.assignee?.name || 'Без відповідального'}
               </Typography>

               {item.assignee?.name ? (
                  <Avatar
                     src={item.assignee?.avatarUrl || ''}
                     sx={{
                        width: 24,
                        height: 24,
                        fontSize: 11,
                        bgcolor: item.assignee?.color || '#7c3aed',
                     }}
                  >
                     {item.assignee?.name?.[0] || '?'}
                  </Avatar>
               ) : null}
            </Stack>
         </Stack>
      </Box>
   );
}

function StageColumn({ stage, items, currentEmployeeId, onOpen, theme, mode }) {
   const { setNodeRef, isOver } = useDroppable({
      id: stage.id,
   });

   return (
      <Box
         ref={setNodeRef}
         sx={{
            minWidth: 290,
            width: 290,
            borderRadius: 4,
            border: `1px solid ${theme.border}`,
            bgcolor: isOver ? theme.hover : mode === 'light' ? 'rgba(255,255,255,0.64)' : 'rgba(255,255,255,0.03)',
            p: 1,
            flexShrink: 0,
            transition: '0.18s ease',
         }}
      >
         <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
               <Chip
                  label={stage.label}
                  sx={{
                     bgcolor: `${stage.color} !important`,
                     color: `${stage.text} !important`,
                     fontWeight: 900,
                     borderRadius: 999,
                  }}
               />
               <Chip
                  label={items.length}
                  size="small"
                  sx={{
                     bgcolor: mode === 'light' ? '#ffffff !important' : `${theme.hover} !important`,
                     color: theme.text,
                     border: `1px solid ${theme.border}`,
                     fontWeight: 900,
                  }}
               />
            </Stack>

            <SortableContext items={items.map((x) => x._id)} strategy={verticalListSortingStrategy}>
               <Stack spacing={1} sx={{ minHeight: 120 }}>
                  {items.map((item) => (
                     <LeadCard
                        key={item._id}
                        item={item}
                        isMine={(item.assignee?._id || item.assignee) === currentEmployeeId}
                        onOpen={onOpen}
                        theme={theme}
                        mode={mode}
                     />
                  ))}

                  {!items.length && (
                     <Box
                        sx={{
                           minHeight: 80,
                           borderRadius: 3,
                           border: `1px dashed ${theme.border}`,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           color: theme.textSoft,
                           fontSize: 12,
                        }}
                     >
                        Перетягни сюди
                     </Box>
                  )}
               </Stack>
            </SortableContext>
         </Stack>
      </Box>
   );
}


export default function PipelinePage() {
   const { user } = useCurrentUser();
   const { theme, mode } = useCRMTheme();
   const fieldSx = getFieldSx(theme);

   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);


   const [employees, setEmployees] = useState([]);
   const [filterType, setFilterType] = useState('all');
   const [assigneeFilter, setAssigneeFilter] = useState('');
   const [selectedLead, setSelectedLead] = useState(null);

   const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));


   const [assignDialogOpen, setAssignDialogOpen] = useState(false);
   const [pendingDrop, setPendingDrop] = useState(null);
   const [assignEmployeeId, setAssignEmployeeId] = useState('');
   const [assignError, setAssignError] = useState('');
   const [savingAssign, setSavingAssign] = useState(false);
   const STAGES_REQUIRING_ASSIGNEE = ['rs', 'ds', 'pzs'];


   const selectedLeadStageMeta =
      selectedLead?.stage && STAGE_META[selectedLead.stage]
         ? STAGE_META[selectedLead.stage]
         : {
            label: selectedLead?.stage || '—',
            color: '#9ca3af',
            text: '#111',
         };


   const loadLeads = async () => {
      try {
         setLoading(true);
         const res = await fetch('/api/crm/leads', { cache: 'no-store' });
         const data = await res.json();
         setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   const loadEmployees = async () => {
      try {
         const res = await fetch('/api/crm/employees', { cache: 'no-store' });
         const data = await res.json();
         setEmployees(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
      }
   };

   useEffect(() => {
      loadLeads();
      loadEmployees();
   }, []);

   const currentEmployeeId = user?._id || user?.employeeId || null;

   const visiblePipelineItems = useMemo(() => {
      return items.filter((item) => {
         const stageOk = ['ps', 'rs', 'ds', 'pzs', 'zs', 'pers'].includes(item.stage);
         // const actualityOk = String(item.actualityStatus || '').includes('В роботі');
         const actualityOk = (['ps', 'rs', 'ds', 'pzs'].includes(item.stage) && String(item.actualityStatus || '').includes('Актуальний')) || ['zs', 'pers'].includes(item.stage);

         if (!stageOk || !actualityOk) return false;

         const assigneeId = item.assignee?._id || item.assignee || null;

         if (filterType === 'mine') {
            if (!(currentEmployeeId && assigneeId === currentEmployeeId)) return false;
         }

         if (filterType === 'free') {
            if (!!assigneeId) return false;
         }

         if (filterType === 'notMine') {
            if (!(assigneeId && currentEmployeeId && assigneeId !== currentEmployeeId)) return false;
         }

         if (assigneeFilter) {
            if (assigneeId !== assigneeFilter) return false;
         }

         return true;
      });
   }, [items, filterType, assigneeFilter, currentEmployeeId]);

   const grouped = useMemo(() => {
      const buckets = Object.fromEntries(STAGES.map((s) => [s.id, []]));
      for (const item of visiblePipelineItems) {
         const stage = item.stage || 'ps';
         if (!buckets[stage]) buckets[stage] = [];
         buckets[stage].push(item);
      }
      return buckets;
   }, [visiblePipelineItems]);

   const findStageByLeadId = (id) => {
      const found = items.find((x) => x._id === id);
      return found?.stage || null;
   };

   // const handleDragEnd = async (event) => {
   //    const { active, over } = event;

   //    if (!over) return;

   //    const activeId = active.id;
   //    const overId = over.id;

   //    const fromStage = findStageByLeadId(activeId);
   //    const overItemStage = findStageByLeadId(overId);

   //    const targetStage =
   //       STAGES.find((s) => s.id === overId)?.id || overItemStage || null;

   //    if (!fromStage || !targetStage || fromStage === targetStage) return;

   //    // optimistic update
   //    setItems((prev) =>
   //       prev.map((item) =>
   //          item._id === activeId
   //             ? { ...item, stage: targetStage }
   //             : item
   //       )
   //    );

   //    try {
   //       const res = await fetch(`/api/crm/leads/${activeId}`, {
   //          method: 'PATCH',
   //          headers: { 'Content-Type': 'application/json' },
   //          body: JSON.stringify({
   //             action: 'set_stage',
   //             stage: targetStage,
   //             changedByEmployee: user?._id || user?.employeeId || undefined,
   //          }),
   //       });

   //       const data = await res.json();

   //       if (!res.ok) {
   //          throw new Error(data?.error || 'Не вдалося змінити стадію');
   //       }

   //       setItems((prev) =>
   //          prev.map((item) => (item._id === data.item._id ? data.item : item))
   //       );

   //       setSelectedLead((prev) => (prev?._id === data.item._id ? data.item : prev));
   //    } catch (e) {
   //       console.error(e);
   //       await loadLeads();
   //    }
   // };

   const handleDragEnd = async (event) => {
      const { active, over } = event;

      if (!over) return;

      const activeId = active.id;
      const overId = over.id;

      const fromStage = findStageByLeadId(activeId);
      const overItemStage = findStageByLeadId(overId);

      const targetStage =
         STAGES.find((s) => s.id === overId)?.id || overItemStage || null;

      if (!fromStage || !targetStage || fromStage === targetStage) return;

      const movedItem = items.find((x) => x._id === activeId);
      if (!movedItem) return;

      const assigneeId = movedItem.assignee?._id || movedItem.assignee || null;

      // якщо стадія вимагає відповідального, а його нема -> відкриваємо модалку
      if (STAGES_REQUIRING_ASSIGNEE.includes(targetStage) && !assigneeId) {
         setPendingDrop({
            leadId: activeId,
            fromStage,
            targetStage,
         });
         setAssignEmployeeId('');
         setAssignError('');
         setAssignDialogOpen(true);
         return;
      }

      // optimistic update
      setItems((prev) =>
         prev.map((item) =>
            item._id === activeId
               ? { ...item, stage: targetStage }
               : item
         )
      );

      try {
         const res = await fetch(`/api/crm/leads/${activeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               action: 'set_stage',
               stage: targetStage,
               changedByEmployee: user?._id || user?.employeeId || undefined,
            }),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data?.error || 'Не вдалося змінити стадію');
         }

         setItems((prev) =>
            prev.map((item) => (item._id === data.item._id ? data.item : item))
         );

         setSelectedLead((prev) =>
            prev?._id === data.item._id ? data.item : prev
         );
      } catch (e) {
         console.error(e);
         await loadLeads();
      }
   };

   const handleAssignAndMove = async () => {
      try {
         if (!pendingDrop?.leadId || !pendingDrop?.targetStage) return;

         if (!assignEmployeeId) {
            setAssignError('Оберіть відповідального');
            return;
         }

         setSavingAssign(true);
         setAssignError('');

         const res = await fetch(`/api/crm/leads/${pendingDrop.leadId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               action: 'set_stage_with_assignee',
               stage: pendingDrop.targetStage,
               assignee: assignEmployeeId,
               changedByEmployee: user?._id || user?.employeeId || undefined,
            }),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data?.error || 'Не вдалося призначити відповідального');
         }

         setItems((prev) =>
            prev.map((item) => (item._id === data.item._id ? data.item : item))
         );

         setSelectedLead((prev) =>
            prev?._id === data.item._id ? data.item : prev
         );

         setAssignDialogOpen(false);
         setPendingDrop(null);
         setAssignEmployeeId('');
      } catch (e) {
         console.error(e);
         setAssignError(e?.message || 'Помилка збереження');
      } finally {
         setSavingAssign(false);
      }
   };

   if (loading) {
      return (
         <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
         </Stack>
      );
   }

   return (
      <Box
         sx={{
            p: 2,
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.45)' : theme.bgDark,
            color: theme.text,
            minHeight: '100vh',
            transition: 'background-color 0.2s ease, color 0.2s ease',
         }}
      >
         <Stack spacing={2}>
            <Stack spacing={0.5}>
               <Typography sx={{ color: theme.text, fontSize: 24, fontWeight: 950 }}>
                  Воронки продажів
               </Typography>
               <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                  Перетягуй картки між стадіями як в amoCRM
               </Typography>
            </Stack>


            <Stack
               direction={{ xs: 'column', lg: 'row' }}
               spacing={1.2}
               sx={{
                  p: 1.2,
                  borderRadius: 4,
                  bgcolor: theme.bgPanel,
                  border: `1px solid ${theme.border}`,
               }}
            >
               <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ minHeight: 44, flexWrap: 'wrap' }}
               >
                  {[
                     { value: 'all', label: 'Усі' },
                     { value: 'mine', label: 'Мої' },
                     { value: 'free', label: 'Без відповідального' },
                     { value: 'notMine', label: 'Не мої' },
                  ].map((x) => (
                     <Chip
                        key={x.value}
                        label={x.label}
                        onClick={() => {
                           setFilterType(x.value);
                           setAssigneeFilter('');
                        }}
                        sx={{
                           bgcolor:
                              filterType === x.value
                                 ? `${theme.accent} !important`
                                 : mode === 'light' ? '#ffffff !important' : 'rgba(255,255,255,0.05) !important',
                           color: filterType === x.value ? '#fff' : theme.text,
                           border: `1px solid ${filterType === x.value ? theme.accent : theme.border}`,
                           cursor: 'pointer',
                           fontWeight: 800,
                        }}
                     />
                  ))}
               </Stack>

               <TextField
                  select
                  label="Відповідальний"
                  value={assigneeFilter}
                  onChange={(e) => {
                     setAssigneeFilter(e.target.value);
                     setFilterType('all');
                  }}
                  sx={{ minWidth: { xs: '100%', lg: 220 }, ...fieldSx }}
               >
                  <MenuItem value="">—</MenuItem>
                  {employees.map((emp) => (
                     <MenuItem key={emp._id} value={emp._id}>
                        {emp.name}
                     </MenuItem>
                  ))}
               </TextField>
            </Stack>



            <DndContext
               sensors={sensors}
               collisionDetection={closestCorners}
               onDragEnd={handleDragEnd}
            >
               <Stack
                  direction="row"
                  spacing={1.2}
                  sx={{
                     overflowX: 'auto',
                     pb: 1,
                  }}
               >
                  {STAGES.map((stage) => (
                     <StageColumn
                        key={stage.id}
                        stage={stage}
                        items={grouped[stage.id] || []}
                        currentEmployeeId={currentEmployeeId}
                        onOpen={setSelectedLead}
                        theme={theme}
                        mode={mode}
                     />
                  ))}
               </Stack>
            </DndContext>
         </Stack>




         <Drawer
            anchor="right"
            open={!!selectedLead}
            onClose={() => setSelectedLead(null)}
            PaperProps={{
               sx: {
                  top: `${HEADER_HEIGHT}px`,
                  height: `calc(100% - ${HEADER_HEIGHT}px)`,
                  width: { xs: '100%', sm: 420 },
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  borderLeft: `1px solid ${theme.border}`,
                  overflowY: 'auto',
               },
            }}
         >
            {selectedLead && (
               <Box sx={{ p: 2 }}>
                  <Stack spacing={1.4}>
                     <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip
                           label={selectedLeadStageMeta.label}
                           size="small"
                           sx={{
                              alignSelf: 'flex-start',
                              bgcolor: selectedLeadStageMeta.color + ' !important',
                              color: selectedLeadStageMeta.text + ' !important',
                              fontWeight: 900,
                              borderRadius: 999,
                              height: 22,
                           }}
                        />
                        <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                           {selectedLead.name}
                        </Typography>

                        <Chip
                           label={selectedLead.stage?.toUpperCase()}
                           sx={{
                              bgcolor: 'rgba(139,92,246,0.25)',
                              color: theme.text,
                           }}
                        />
                     </Stack>

                     <Typography sx={{ color: theme.textSoft, lineHeight: 1.5 }}>
                        {selectedLead.requestSummary || 'Без опису'}
                     </Typography>

                     <Divider sx={{ borderColor: theme.border }} />

                      <Typography sx={{ color: theme.text }}>
                        <b>Бюджет:</b> {formatMoney(selectedLead.budgetMax)}
                     </Typography>

                      <Typography sx={{ color: theme.text }}>
                        <b>Відповідальний:</b> {selectedLead.assignee?.name || '—'}
                     </Typography>

                      <Typography sx={{ color: theme.text }}>
                        <b>Актуальність:</b> {selectedLead.actualityStatus || '—'}
                     </Typography>

                      <Typography sx={{ color: theme.text }}>
                        <b>Джерело:</b> {selectedLead.sourceChannel || '—'}
                     </Typography>

                      <Typography sx={{ color: theme.text }}>
                        <b>Обʼєкт:</b> {selectedLead.sourceObject || '—'}
                     </Typography>

                     {!!selectedLead.notes?.length && (
                        <>
                           <Divider sx={{ borderColor: theme.border }} />
                           <Typography sx={{ fontWeight: 850 }}>Нотатки</Typography>

                           <Stack spacing={0.8}>
                              {selectedLead.notes.map((note, idx) => {
                                 const noteMeta = getNoteMeta(note.type, mode, theme);
                                 return (
                                 <Box
                                    key={idx}
                                    sx={{
                                       p: 1,
                                       borderRadius: 2.5,
                                       bgcolor: `${noteMeta.bg} !important`,
                                       border: `1px solid ${noteMeta.border}`,
                                    }}
                                 >
                                    <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mb: 0.45 }}>
                                       <Typography sx={{ color: noteMeta.color, fontWeight: 900 }}>
                                          {noteMeta.label}
                                       </Typography>
                                       <Typography sx={{ color: theme.textSoft, fontSize: 11 }}>
                                          {note.createdByName || '—'}
                                       </Typography>
                                    </Stack>
                                    <Typography sx={{ color: theme.text, lineHeight: 1.45 }}>
                                       {note.text}
                                    </Typography>
                                 </Box>
                                 );
                              })}
                           </Stack>
                        </>
                     )}

                     {!!selectedLead.history?.length && (
                        <>
                           <Divider sx={{ borderColor: theme.border }} />
                           <Typography sx={{ fontWeight: 850 }}>Історія</Typography>

                           <Stack spacing={0.7}>
                              {selectedLead.history.map((h, idx) => (
                                 <Box
                                    key={idx}
                                    sx={{
                                       p: 0.9,
                                       borderRadius: 2.5,
                                       bgcolor: theme.hover,
                                       border: `1px solid ${theme.border}`,
                                    }}
                                 >
                                    <Typography sx={{ color: theme.text, fontSize: 13 }}>
                                       {h.type === 'stage_change'
                                          ? `${h.fromStage || '—'} → ${h.toStage || '—'}`
                                          : h.type}
                                    </Typography>
                                    <Typography sx={{ color: theme.textSoft, fontSize: 11 }}>
                                       {h.changedByName || '—'}
                                    </Typography>
                                 </Box>
                              ))}
                           </Stack>
                        </>
                     )}

                     <Button
                        onClick={() => setSelectedLead(null)}
                        sx={{
                           mt: 1,
                           color: theme.text,
                           border: `1px solid ${theme.border}`,
                           borderRadius: 3,
                        }}
                     >
                        Закрити
                     </Button>
                  </Stack>
               </Box>
            )}
         </Drawer>




         <Dialog
            open={assignDialogOpen}
            onClose={() => {
               setAssignDialogOpen(false);
               setPendingDrop(null);
               setAssignEmployeeId('');
               setAssignError('');
            }}
            maxWidth="xs"
            fullWidth
            PaperProps={{
               sx: {
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  borderRadius: 4,
                  border: `1px solid ${theme.border}`,
               },
            }}
         >
            <DialogTitle sx={{ fontWeight: 900 }}>
               Призначити відповідального
            </DialogTitle>

            <DialogContent sx={{ pb: 2 }}>
               <Stack spacing={1.4} sx={{ mt: 0.5 }}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                     Для переходу в стадію <b>{pendingDrop?.targetStage?.toUpperCase() || '—'}</b> потрібно вибрати відповідального.
                  </Typography>

                  {!!assignError && (
                     <Alert severity="error">{assignError}</Alert>
                  )}

                  <TextField
                     select
                     label="Відповідальний"
                     value={assignEmployeeId}
                     onChange={(e) => setAssignEmployeeId(e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  >
                     <MenuItem value="">—</MenuItem>
                     {employees.map((emp) => (
                        <MenuItem key={emp._id} value={emp._id}>
                           {emp.name}
                        </MenuItem>
                     ))}
                  </TextField>

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                     <Button
                        onClick={() => {
                           setAssignDialogOpen(false);
                           setPendingDrop(null);
                           setAssignEmployeeId('');
                           setAssignError('');
                        }}
                        sx={{
                           color: theme.textSoft,
                           border: `1px solid ${theme.border}`,
                           borderRadius: 3,
                        }}
                     >
                        Скасувати
                     </Button>

                     <Button
                        onClick={handleAssignAndMove}
                        disabled={savingAssign}
                        sx={{
                           color: '#111',
                           fontWeight: 900,
                           borderRadius: 3,
                           background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                        }}
                     >
                        {savingAssign ? 'Збереження...' : 'Підтвердити'}
                     </Button>
                  </Stack>
               </Stack>
            </DialogContent>
         </Dialog>
      </Box>
   );
}
