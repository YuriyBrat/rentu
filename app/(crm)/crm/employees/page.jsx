'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Box,
   Button,
   Chip,
   CircularProgress,
   Dialog,
   DialogContent,
   InputAdornment,
   MenuItem,
   Stack,
   TextField,
   Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import EmployeeCard from '@/crm_components/employees/EmployeeCard';
import EmployeeForm from '@/crm_components/employees/EmployeeForm';
import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

const ROLE_OPTIONS = [
   { value: 'all', label: 'Усі ролі' },
   { value: 'owner', label: 'Власник' },
   { value: 'admin', label: 'Адміністратор' },
   { value: 'manager', label: 'Менеджер' },
   { value: 'realtor', label: 'Рієлтор' },
   { value: 'callcenter', label: 'Кол-центр' },
   { value: 'viewer', label: 'Перегляд' },
];

function getFieldSx(theme, mode) {
   const isLight = mode === 'light';

   return {
   '& .MuiOutlinedInput-root': {
      bgcolor: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.04)',
      borderRadius: 3,
      color: theme?.text || '#fff',
      minHeight: 30,
      '& input': { color: `${theme?.text || '#fff'} !important`, WebkitTextFillColor: theme?.text || '#fff', padding: '10px 14px' },
      '& .MuiSelect-select': {
         color: `${theme?.text || '#fff'} !important`,
         WebkitTextFillColor: theme?.text || '#fff',
         display: 'flex',
         alignItems: 'center',
         minHeight: 'auto',
         paddingTop: '10px',
         paddingBottom: '8px',
      },
      '& fieldset': { borderColor: theme?.border || 'rgba(255,255,255,0.12)' },
      '&:hover fieldset': { borderColor: theme?.accent || 'rgba(139,92,246,0.35)' },
      '&.Mui-focused fieldset': { borderColor: theme?.accentLight || 'rgba(168,85,247,0.95)' },
   },
   '& .MuiInputLabel-root': { color: `${theme?.textSoft || 'rgba(255,255,255,0.82)'} !important`, fontWeight: 700 },
   '& .MuiSelect-icon': { color: theme?.textSoft || 'rgba(255,255,255,0.78)' },
   };
}

function getSelectMenuProps(theme) {
   return {
      PaperProps: {
         sx: {
            bgcolor: theme?.bgPanel || '#151521',
            color: theme?.text || '#fff',
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.08)'}`,
         },
      },
   };
}

function getManagerId(item) {
   return String(item?.manager?._id || item?.manager || '');
}

function buildTree(items) {
   const byId = new Map();
   const childrenByManager = new Map();

   items.forEach((item) => {
      const id = String(item._id);
      byId.set(id, item);
      childrenByManager.set(id, []);
   });

   const roots = [];
   items.forEach((item) => {
      const managerId = getManagerId(item);
      if (managerId && byId.has(managerId)) {
         childrenByManager.get(managerId).push(item);
      } else {
         roots.push(item);
      }
   });

   const sortNodes = (arr) => arr.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || String(a.name || '').localeCompare(String(b.name || '')));
   sortNodes(roots);
   childrenByManager.forEach(sortNodes);

   return { roots, childrenByManager };
}

function flattenHierarchy(roots, childrenByManager, level = 0) {
   return roots.flatMap((item) => {
      const children = childrenByManager.get(String(item._id)) || [];
      return [
         {
            item,
            level,
            hasChildren: children.length > 0,
         },
         ...flattenHierarchy(children, childrenByManager, level + 1),
      ];
   });
}

export default function EmployeesPage() {
   const { theme, mode } = useCRMTheme();
   const [q, setQ] = useState('');
   const [role, setRole] = useState('all');
   const [items, setItems] = useState([]);
   const [canManage, setCanManage] = useState(false);
   const [loading, setLoading] = useState(true);
   const [openCreate, setOpenCreate] = useState(false);
   const [editingEmployee, setEditingEmployee] = useState(null);

   const load = async () => {
      try {
         setLoading(true);
         const res = await fetch('/api/crm/employees');
         const data = await res.json();
         setItems(Array.isArray(data?.items) ? data.items : []);
         setCanManage(!!data?.canManage);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
   }, []);

   const filtered = useMemo(() => {
      return [...items]
         .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || String(a.name || '').localeCompare(String(b.name || '')))
         .filter((item) => {
            if (role !== 'all' && item.role !== role) return false;
            const text = [
               item.name,
               item.position,
               item.role,
               item.login,
               item.about,
               item.manager?.name,
               ...(item.phones || []).flatMap((phone) => typeof phone === 'string' ? [phone] : [phone?.number, phone?.note, phone?.type]),
               ...(item.emails || []),
               ...(item.notes || []).map((x) => x.text),
            ].filter(Boolean).join(' ').toLowerCase();
            return !q.trim() || text.includes(q.trim().toLowerCase());
         });
   }, [items, q, role]);

   const hierarchy = useMemo(() => buildTree(filtered), [filtered]);
   const hierarchyRows = useMemo(
      () => flattenHierarchy(hierarchy.roots, hierarchy.childrenByManager),
      [hierarchy]
   );

   const closeDialogs = () => {
      setOpenCreate(false);
      setEditingEmployee(null);
   };

   const fieldSx = useMemo(() => getFieldSx(theme, mode), [theme, mode]);
   const selectMenuProps = useMemo(() => getSelectMenuProps(theme), [theme]);
   const isLight = mode === 'light';

   return (
      <Box sx={{ p: { xs: 1.2, md: 2 }, bgcolor: 'transparent', minHeight: '100vh' }}>
         <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={1.2}>
               <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                      <GroupsRoundedIcon sx={{ color: theme?.accentLight || '#c084fc' }} />
                      <Typography sx={{ color: theme?.text || '#fff', fontSize: 24, fontWeight: 950 }}>
                        Персонал
                     </Typography>
                  </Stack>
                   <Typography sx={{ color: theme?.textSoft || 'rgba(255,255,255,0.62)', fontSize: 13 }}>
                     Працівники CRM: ролі доступу, контакти, фото, нотатки та ієрархія.
                  </Typography>
               </Stack>

               <Stack direction="row" spacing={1} alignItems="center">
                   <Chip
                      label={`Усього: ${filtered.length}`}
                      sx={{
                         color: isLight ? (theme?.accent || '#7c3aed') : (theme?.text || '#fff'),
                         backgroundColor: `${isLight ? '#fff' : 'rgba(255,255,255,0.05)'} !important`,
                         border: `1px solid ${isLight ? 'rgba(124,58,237,0.22)' : (theme?.border || 'rgba(255,255,255,0.08)')}`,
                         fontWeight: 900,
                         '& .MuiChip-label': {
                            color: `${isLight ? (theme?.accent || '#7c3aed') : (theme?.text || '#fff')} !important`,
                         },
                      }}
                   />
                  {canManage && (
                     <Button
                        onClick={() => setOpenCreate(true)}
                        startIcon={<AddRoundedIcon />}
                        sx={{
                           borderRadius: 3,
                           padding: '10px 25px',
                           fontWeight: 900,
                           color: '#0b0b12',
                           height: 40,
                            background: `linear-gradient(90deg, ${theme?.accent || 'rgba(139,92,246,1)'}, ${theme?.accentLight || 'rgba(168,85,247,1)'})`,
                        }}
                     >
                        Додати
                     </Button>
                  )}
               </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.2} sx={{ p: 1.2, borderRadius: 4, bgcolor: isLight ? 'rgba(255,255,255,0.66)' : 'rgba(255,255,255,0.03)', border: `1px solid ${theme?.border || 'rgba(255,255,255,0.06)'}` }}>
               <TextField
                  placeholder="Пошук за іменем, логіном, роллю, керівником, нотатками..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: theme?.textSoft || '#aaa' }} /></InputAdornment> }}
               />

               <TextField select label="CRM роль" value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: { xs: '100%', lg: 220 }, ...fieldSx }} SelectProps={{ MenuProps: selectMenuProps }}>
                  {ROLE_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
               </TextField>
            </Stack>

            {loading ? (
               <Stack alignItems="center" sx={{ mt: 5 }}><CircularProgress /></Stack>
            ) : (
               <Stack spacing={1.2}>
                  {hierarchyRows.map(({ item, level, hasChildren }) => (
                     <Box
                        key={item._id}
                        sx={{
                           pl: {
                              xs: level ? `${Math.min(level * 22, 52)}px` : 0,
                              md: level ? `${Math.min(level * 34, 120)}px` : 0,
                           },
                           boxSizing: 'border-box',
                           width: '100%',
                        }}
                     >
                        <EmployeeCard
                           item={item}
                           canManage={canManage}
                           onEdit={setEditingEmployee}
                           onChanged={load}
                           hierarchyLevel={level}
                           hasSubordinates={hasChildren}
                        />
                     </Box>
                  ))}
               </Stack>
            )}
         </Stack>

          <Dialog
             open={openCreate || !!editingEmployee}
             onClose={closeDialogs}
             maxWidth="md"
             fullWidth
             PaperProps={{
                sx: {
                   bgcolor: theme?.bgPanel || '#0f0f17',
                   border: `1px solid ${theme?.border || 'rgba(255,255,255,0.06)'}`,
                   borderRadius: 4,
                   '& .MuiTypography-root, & .MuiFormControlLabel-label': {
                      color: `${theme?.text || '#fff'} !important`,
                   },
                   '& .MuiInputLabel-root': {
                      color: `${theme?.textSoft || 'rgba(255,255,255,0.82)'} !important`,
                   },
                   '& .MuiOutlinedInput-root': {
                      color: `${theme?.text || '#fff'} !important`,
                      bgcolor: isLight ? 'rgba(124,58,237,0.045) !important' : 'rgba(255,255,255,0.04) !important',
                   },
                   '& input, & textarea, & .MuiSelect-select': {
                      color: `${theme?.text || '#fff'} !important`,
                      WebkitTextFillColor: `${theme?.text || '#fff'} !important`,
                   },
                   '& fieldset': {
                      borderColor: `${theme?.border || 'rgba(255,255,255,0.16)'} !important`,
                   },
                   '& .MuiButton-root': {
                      color: `${theme?.text || '#fff'} !important`,
                      borderColor: `${theme?.border || 'rgba(255,255,255,0.10)'} !important`,
                   },
                   '& button[type="submit"]': {
                      color: '#0b0b12 !important',
                   },
                },
             }}
          >
            <DialogContent>
               <EmployeeForm
                  initialData={editingEmployee}
                  employees={items}
                  onCancel={closeDialogs}
                  onCreated={() => {
                     closeDialogs();
                     load();
                  }}
               />
            </DialogContent>
         </Dialog>
      </Box>
   );
}
