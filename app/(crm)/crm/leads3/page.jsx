'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   TextField,
   InputAdornment,
   MenuItem,
   Menu,
   Chip,
   Button,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   CircularProgress,
   Alert,
} from '@mui/material';

import useCurrentUser from '@/utils/useCurrentUser';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import LeadRow from '@/crm_components/leads/LeadRow4';
import LeadForm from '@/crm_components/leads/LeadForm';
import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

const STAGE_OPTIONS = [
   { value: 'all', label: 'Усі стадії' },
   { value: 'lead', label: 'Холодний лід' },
   { value: 'hot', label: 'Гарячий лід' },
   { value: 'ps', label: 'ПС' },
   { value: 'rs', label: 'РС' },
   { value: 'ds', label: 'ДС' },
   { value: 'pzs', label: 'ПЗС' },
   { value: 'zs', label: 'ЗС' },
   { value: 'pers', label: 'ПЕРС' },
];

const escapeHtml = (value) => String(value ?? '')
   .replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&#039;');

const formatExportDate = (value) => {
   if (!value) return '';
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return '';

   return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   });
};

const toInputDate = (date = new Date()) => {
   const d = new Date(date);
   const yyyy = d.getFullYear();
   const mm = String(d.getMonth() + 1).padStart(2, '0');
   const dd = String(d.getDate()).padStart(2, '0');
   return `${yyyy}-${mm}-${dd}`;
};

const stageLabel = (value) => STAGE_OPTIONS.find((item) => item.value === value)?.label || value || '';

const REPORT_STAGE_VALUES = ['ps', 'rs', 'ds', 'pzs', 'zs', 'pers'];

const STAGE_RANK = {
   lead: 0,
   hot: 0,
   ps: 1,
   rs: 2,
   ds: 3,
   pzs: 4,
   zs: 5,
   pers: 6,
};

const employeeName = (employee) => {
   if (!employee) return '';
   return employee.name || [employee.surname, employee.fullName].filter(Boolean).join(' ') || '';
};

const defaultReportRange = () => {
   const to = new Date();
   const from = new Date();
   from.setDate(to.getDate() - 30);

   return {
      from: toInputDate(from),
      to: toInputDate(to),
   };
};

const isDateInRange = (value, from, to) => {
   if (!value) return false;

   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return false;

   const fromDate = from ? new Date(`${from}T00:00:00`) : null;
   const toDate = to ? new Date(`${to}T23:59:59.999`) : null;

   if (fromDate && date < fromDate) return false;
   if (toDate && date > toDate) return false;

   return true;
};

const downloadExcelHtml = (html, filename) => {
   const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = filename;
   document.body.appendChild(link);
   link.click();
   link.remove();
   URL.revokeObjectURL(url);
};

const openPrintableReport = (html, title) => {
   const printWindow = window.open('', '_blank');
   if (!printWindow) return;

   printWindow.document.open();
   printWindow.document.write(html);
   printWindow.document.close();
   printWindow.document.title = title;
   printWindow.focus();
   setTimeout(() => printWindow.print(), 250);
};

const getFieldSx = (theme) => ({
   '& .MuiOutlinedInput-root': {
      bgcolor: theme.hover,
      borderRadius: 3,
      color: theme.text,
      minHeight: 44,
      '& input': {
         color: `${theme.text} !important`,
         WebkitTextFillColor: theme.text,
         padding: '10px 14px',
      },
      '& .MuiSelect-select': {
         color: `${theme.text} !important`,
         WebkitTextFillColor: theme.text,
         display: 'flex',
         alignItems: 'center',
         minHeight: 'auto',
         paddingTop: '10px',
         paddingBottom: '10px',
      },
      '& fieldset': { borderColor: theme.border },
      '&:hover fieldset': { borderColor: theme.accent },
      '&.Mui-focused fieldset': { borderColor: theme.accentLight },
   },
   '& .MuiInputLabel-root': {
      color: `${theme.textSoft} !important`,
      fontWeight: 700,
   },
   '& .MuiSelect-icon': {
      color: theme.text,
   },
});

const getSelectMenuProps = (theme) => ({
   PaperProps: {
      sx: {
         bgcolor: theme.bgPanel,
         color: theme.text,
         border: `1px solid ${theme.border}`,
         '& .MuiMenuItem-root.Mui-selected': {
            bgcolor: theme.hover,
         },
      },
   },
});

export default function LeadsPage() {
   const { theme, mode } = useCRMTheme();
   const fieldSx = getFieldSx(theme);
   const selectMenuProps = getSelectMenuProps(theme);

   const [items, setItems] = useState([]);
   const [employees, setEmployees] = useState([]);

   const [q, setQ] = useState('');
   const [stage, setStage] = useState('all');

   const [loading, setLoading] = useState(true);
   const [employeesLoading, setEmployeesLoading] = useState(true);
   const [error, setError] = useState('');

   const [openCreate, setOpenCreate] = useState(false);
   const [editItem, setEditItem] = useState(null);
   const [exportAnchorEl, setExportAnchorEl] = useState(null);
   const [reportDialog, setReportDialog] = useState(null);
   const [reportRange, setReportRange] = useState(defaultReportRange);

   const [filterType, setFilterType] = useState('all');
   const [assigneeFilter, setAssigneeFilter] = useState('');

   const { user } = useCurrentUser();

   const loadEmployees = async () => {
      try {
         setEmployeesLoading(true);

         const res = await fetch('/api/crm/employees', {
            cache: 'no-store',
         });

         if (!res.ok) throw new Error('Не вдалося завантажити працівників');

         const data = await res.json();
         setEmployees(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
      } finally {
         setEmployeesLoading(false);
      }
   };

   const loadLeads = async () => {
      try {
         setLoading(true);
         setError('');

         const params = new URLSearchParams();
         if (q.trim()) params.set('q', q.trim());
         if (stage !== 'all') params.set('stage', stage);

         const res = await fetch(`/api/crm/leads?${params.toString()}`, {
            cache: 'no-store',
         });

         if (!res.ok) throw new Error('Не вдалося завантажити лідів');

         const data = await res.json();
         setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка завантаження');
      } finally {
         setLoading(false);
      }
   };

   const handlePatched = (updatedItem) => {
      if (!updatedItem?._id) return;

      setItems((prev) =>
         prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
      );
   };

   const currentEmployeeId = user?._id || user?.employeeId || null;

   const employeeNameById = (employeeId) => {
      if (!employeeId) return '';
      const id = typeof employeeId === 'object' ? employeeId._id : employeeId;
      return employees.find((employee) => String(employee._id) === String(id))?.name || '';
   };

   const historyManagerName = (event, lead) => {
      return (
         event?.changedByName ||
         employeeName(event?.changedByEmployee) ||
         employeeNameById(event?.changedByEmployee) ||
         employeeName(lead?.assignee) ||
         employeeName(lead?.createdByEmployee) ||
         'Без менеджера'
      );
   };


   // const filteredLeads = useMemo(() => {
   //    return items.filter((item) => {
   //       const assigneeId = item.assignee?._id || item.assignee || null;

   //       if (filterType === 'mine') {
   //          return currentEmployeeId && assigneeId === currentEmployeeId;
   //       }

   //       if (filterType === 'free') {
   //          return !assigneeId;
   //       }

   //       if (filterType === 'notMine') {
   //          return assigneeId && currentEmployeeId && assigneeId !== currentEmployeeId;
   //       }

   //       if (assigneeFilter) {
   //          return assigneeId === assigneeFilter;
   //       }

   //       return true;
   //    });
   // }, [items, filterType, assigneeFilter, currentEmployeeId]);

   // const currentEmployeeId = user?._id || user?.employeeId || null;

   const filteredLeads = useMemo(() => {
      const qNorm = q.trim().toLowerCase();

      return items.filter((item) => {
         const assigneeId = item.assignee?._id || item.assignee || null;

         // 1. швидкі фільтри
         if (filterType === 'mine') {
            if (!(currentEmployeeId && assigneeId === currentEmployeeId)) return false;
         }

         if (filterType === 'free') {
            if (!!assigneeId) return false;
         }

         if (filterType === 'notMine') {
            if (!(assigneeId && currentEmployeeId && assigneeId !== currentEmployeeId)) return false;
         }

         // 2. фільтр по конкретному відповідальному
         if (assigneeFilter === '__unassigned__') {
            if (assigneeId) return false;
         } else if (assigneeFilter) {
            if (assigneeId !== assigneeFilter) return false;
         }

         // 3. локальний текстовий пошук
         if (qNorm) {
            const haystack = [
               item.name,
               item.requestSummary,
               item.sourceChannel,
               item.sourceObject,
               item.sourceNote,
               item.actualityStatus,
               item.assignee?.name,
               item.createdByEmployee?.name,
               ...(item.phones || []),
               ...(item.emails || []),
               ...(item.notes || []).map((n) => n.text),
            ]
               .filter(Boolean)
               .join(' ')
               .toLowerCase();

            if (!haystack.includes(qNorm)) return false;
         }

         // 4. локальна підстраховка по стадії
         if (!isDateInRange(item.leadAppearedAt || item.createdAt, reportRange.from, reportRange.to)) {
            return false;
         }

         if (stage !== 'all' && item.stage !== stage) {
            return false;
         }

         return true;
      });
   }, [items, q, stage, filterType, assigneeFilter, currentEmployeeId, reportRange.from, reportRange.to]);


   useEffect(() => {
      loadEmployees();
   }, []);

   useEffect(() => {
      loadLeads();
   }, [q, stage]);

   const counts = useMemo(() => {
      return {
         total: items.length,
      };
   }, [items]);

   const handleCreated = async (createdItem) => {
      setOpenCreate(false);

      if (createdItem) {
         setItems((prev) => [createdItem, ...prev]);
      }

      await loadLeads();
   };

   const handleUpdated = async (updatedItem) => {
      setEditItem(null);
      if (updatedItem?._id) {
         setItems((prev) =>
            prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
         );
      }
      await loadLeads();
   };

   const handleDeleted = (id) => {
      setItems((prev) => prev.filter((item) => item._id !== id));
   };

   const downloadFilteredLeadsExcel = () => {
      const headers = [
         '№',
         'ПІБ',
         'Телефони',
         'Email',
         'Стадія',
         'Актуальність',
         'Відповідальний',
         'Джерело',
         'Обʼєкт / запит',
         'Нотатки',
         'Дата появи',
         'Створено',
      ];
      const rows = filteredLeads.map((lead, index) => ([
         index + 1,
         lead.name || '',
         (lead.phones || []).map((phone) => typeof phone === 'string' ? phone : phone?.number).filter(Boolean).join(', '),
         (lead.emails || []).filter(Boolean).join(', '),
         stageLabel(lead.stage),
         lead.actualityStatus || '',
         employeeName(lead.assignee),
         [lead.sourceChannel, lead.sourceNote].filter(Boolean).join(' | '),
         [lead.sourceObject, lead.requestSummary].filter(Boolean).join(' | '),
         (lead.notes || []).map((note) => note?.text || note).filter(Boolean).join(' | '),
         formatExportDate(lead.leadAppearedAt),
         formatExportDate(lead.createdAt),
      ]));

      const tableRows = [
         `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`,
         ...rows.map((row) => `<tr>${row.map((cell, cellIndex) => `<td class="${[2, 3].includes(cellIndex) ? 'text' : ''}">${escapeHtml(cell)}</td>`).join('')}</tr>`),
      ].join('');
      const html = `<!doctype html><html><head><meta charset="utf-8" /><style>
         table{border-collapse:collapse;font-family:Arial,sans-serif;font-size:11pt;}
         th{font-weight:800;background:#7c3aed;color:#ffffff;border:1px solid #2f1d66;padding:8px;text-align:center;}
         td{border:1px solid #9ca3af;padding:6px;vertical-align:top;mso-number-format:"\\@";}
         tr:nth-child(even) td{background:#f3f0ff;}
         .text{mso-number-format:"\\@";}
      </style></head><body><table>${tableRows}</table></body></html>`;

      downloadExcelHtml(html, `karamax-leads-${toInputDate(new Date())}.xls`);
      setExportAnchorEl(null);
   };

   const makeReportTable = ({ title, subtitle, tables }) => {
      const blocks = tables.map((table) => {
         const head = `<tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`;
         const body = table.rows.length
            ? table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
            : `<tr><td colspan="${table.headers.length}" class="empty">Немає даних за вибраний період</td></tr>`;

         return `
            <h2>${escapeHtml(table.title)}</h2>
            <table>${head}${body}</table>
         `;
      }).join('');

      return `<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><style>
         @page{size:A4 landscape;margin:12mm;}
         *{box-sizing:border-box;}
         body{font-family:Arial,sans-serif;color:#111827;margin:0;background:#ffffff;}
         h1{font-size:20pt;margin:0 0 4px;font-weight:900;}
         h2{font-size:13pt;margin:22px 0 8px;font-weight:900;color:#4c1d95;}
         .subtitle{font-size:11pt;color:#4b5563;margin-bottom:16px;}
         table{border-collapse:collapse;font-size:10pt;margin-bottom:18px;width:100%;page-break-inside:auto;}
         tr{page-break-inside:avoid;page-break-after:auto;}
         th{font-weight:900;background:#7c3aed;color:#ffffff;border:1px solid #2f1d66;padding:8px;text-align:center;}
         td{border:1px solid #9ca3af;padding:7px;vertical-align:top;mso-number-format:"\\@";}
         tr:nth-child(even) td{background:#f3f0ff;}
         .empty{text-align:center;color:#6b7280;font-weight:700;}
         @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;} h2{break-after:avoid;} table{break-inside:auto;}}
      </style></head><body><h1>${escapeHtml(title)}</h1><div class="subtitle">${escapeHtml(subtitle)}</div>${blocks}</body></html>`;
   };

   const downloadNewLeadsReport = () => {
      const rows = filteredLeads.filter((lead) =>
         isDateInRange(lead.leadAppearedAt || lead.createdAt, reportRange.from, reportRange.to)
      );

      const byManager = new Map();
      rows.forEach((lead) => {
         const name = employeeName(lead.createdByEmployee) || employeeName(lead.assignee) || 'Без менеджера';
         byManager.set(name, (byManager.get(name) || 0) + 1);
      });

      const summaryRows = [...byManager.entries()]
         .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
         .map(([name, count], index) => [index + 1, name, count]);

      const detailRows = rows.map((lead, index) => ([
         index + 1,
         formatExportDate(lead.leadAppearedAt || lead.createdAt),
         lead.name || '',
         (lead.phones || []).map((phone) => typeof phone === 'string' ? phone : phone?.number).filter(Boolean).join(', '),
         employeeName(lead.createdByEmployee) || employeeName(lead.assignee) || 'Без менеджера',
         stageLabel(lead.stage),
         [lead.sourceChannel, lead.sourceNote].filter(Boolean).join(' | '),
      ]));

      const html = makeReportTable({
         title: 'Звіт по нових лідах',
         subtitle: `Період: ${reportRange.from || '...'} - ${reportRange.to || '...'} | Поточний фільтр: ${filteredLeads.length} лідів`,
         tables: [
            {
               title: 'Підсумок по менеджерах',
               headers: ['№', 'Менеджер', 'К-сть нових лідів'],
               rows: summaryRows,
            },
            {
               title: 'Деталі нових лідів',
               headers: ['№', 'Дата появи', 'ПІБ', 'Телефони', 'Хто додав', 'Стадія', 'Джерело'],
               rows: detailRows,
            },
         ],
      });

      openPrintableReport(html, `karamax-new-leads-report-${reportRange.from || 'from'}-${reportRange.to || 'to'}`);
      setExportAnchorEl(null);
   };

   const downloadStageProgressReport = () => {
      const summary = new Map();
      const details = [];

      filteredLeads.forEach((lead) => {
         (lead.history || []).forEach((event) => {
            if (event?.type !== 'stage_change') return;
            if (!isDateInRange(event.createdAt, reportRange.from, reportRange.to)) return;

            const toStage = event.toStage || event.stage;
            if (!REPORT_STAGE_VALUES.includes(toStage)) return;

            const fromRank = STAGE_RANK[event.fromStage] ?? -1;
            const toRank = STAGE_RANK[toStage] ?? -1;
            if (fromRank >= 0 && toRank <= fromRank) return;

            const manager = historyManagerName(event, lead);
            if (!summary.has(manager)) {
               summary.set(manager, {
                  total: 0,
                  ps: 0,
                  rs: 0,
                  ds: 0,
                  pzs: 0,
                  zs: 0,
                  pers: 0,
               });
            }

            const managerSummary = summary.get(manager);
            managerSummary.total += 1;
            managerSummary[toStage] += 1;

            details.push([
               formatExportDate(event.createdAt),
               manager,
               lead.name || '',
               stageLabel(event.fromStage),
               stageLabel(toStage),
               (lead.phones || []).map((phone) => typeof phone === 'string' ? phone : phone?.number).filter(Boolean).join(', '),
            ]);
         });
      });

      const summaryRows = [...summary.entries()]
         .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]))
         .map(([name, data], index) => ([
            index + 1,
            name,
            data.total,
            data.ps,
            data.rs,
            data.ds,
            data.pzs,
            data.zs,
            data.pers,
         ]));

      const html = makeReportTable({
         title: 'Звіт по опрацюванню лідів',
         subtitle: `Період: ${reportRange.from || '...'} - ${reportRange.to || '...'} | Поточний фільтр: ${filteredLeads.length} лідів`,
         tables: [
            {
               title: 'Покращення стадій по менеджерах',
               headers: ['№', 'Менеджер', 'Всього', 'ПС', 'РС', 'ДС', 'ПЗС', 'ЗС', 'ПЕРС'],
               rows: summaryRows,
            },
            {
               title: 'Деталі покращень',
               headers: ['Дата', 'Менеджер', 'Лід', 'Було', 'Стало', 'Телефони'],
               rows: details,
            },
         ],
      });

      openPrintableReport(html, `karamax-lead-progress-report-${reportRange.from || 'from'}-${reportRange.to || 'to'}`);
      setExportAnchorEl(null);
   };

   return (
      <Box
         sx={{
            p: { xs: 1.2, md: 2 },
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.45)' : theme.bgDark,
            color: theme.text,
            minHeight: '100vh',
            transition: 'background-color 0.2s ease, color 0.2s ease',
         }}
      >
         <Stack spacing={2}>
            <Stack
               direction={{ xs: 'column', md: 'row' }}
               alignItems={{ xs: 'flex-start', md: 'center' }}
               justifyContent="space-between"
               spacing={1.2}
            >
               <Stack spacing={0.5}>
                  <Typography sx={{ color: theme.text, fontSize: 24, fontWeight: 950 }}>
                     Ліди / Клієнти
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                     Таблиця вхідних лідів та клієнтів у роботі з деталями, актуальністю і нотатками
                  </Typography>
               </Stack>

               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                     label={`Усього: ${counts.total}`}
                     sx={{
                        color: mode === 'light' ? '#fff' : theme.text,
                        bgcolor: mode === 'light' ? '#111827' : theme.hover,
                        border: `1px solid ${theme.border}`,
                     }}
                  />

                   <Button
                      startIcon={<FileDownloadRoundedIcon />}
                      endIcon={<KeyboardArrowDownRoundedIcon />}
                      onMouseEnter={(event) => setExportAnchorEl(event.currentTarget)}
                      disabled={!filteredLeads.length}
                      sx={{
                         borderRadius: 999,
                         padding: '4px 16px',
                         color: theme.text,
                         fontWeight: 900,
                         bgcolor: mode === 'light' ? '#ffffff' : theme.hover,
                         border: `1px solid ${theme.border}`,
                         '&:hover': {
                            bgcolor: mode === 'light' ? '#f3f4f6' : 'rgba(255,255,255,0.11)',
                         },
                      }}
                   >
                      Експорт
                   </Button>

                   <Button
                      startIcon={<AddRoundedIcon />}
                      onClick={() => setOpenCreate(true)}
                     sx={{
                        borderRadius: 999,
                        // px: 1.8,
                        padding: '4px 18px',
                        // my: '0px ',
                        color: '#111',
                        fontWeight: 900,
                        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                        boxShadow: `0 12px 28px ${theme.glow}`,
                        '&:hover': {
                           boxShadow: `0 16px 36px ${theme.glow}`,
                        },
                     }}
                  >
                      Додати ліда
                   </Button>
                   <Menu
                      anchorEl={exportAnchorEl}
                      open={Boolean(exportAnchorEl)}
                      onClose={() => setExportAnchorEl(null)}
                      MenuListProps={{
                         onMouseLeave: () => setExportAnchorEl(null),
                         sx: { py: 0.6 },
                      }}
                      disableScrollLock
                      PaperProps={{
                         sx: {
                            mt: 0.8,
                            bgcolor: theme.bgPanel,
                            color: theme.text,
                            border: `1px solid ${theme.border}`,
                            boxShadow: `0 18px 42px ${theme.glow}`,
                         },
                      }}
                   >
                      <MenuItem
                         onClick={downloadFilteredLeadsExcel}
                         disabled={!filteredLeads.length}
                         sx={{ fontWeight: 500, gap: 1 }}
                      >
                         <FileDownloadRoundedIcon fontSize="small" />
                         Експорт excel
                      </MenuItem>
                      <MenuItem
                         onClick={downloadNewLeadsReport}
                         disabled={!filteredLeads.length}
                         sx={{ fontWeight: 500, gap: 1 }}
                      >
                         <FileDownloadRoundedIcon fontSize="small" />
                         Звіт по нових лідах
                      </MenuItem>
                      <MenuItem
                         onClick={downloadStageProgressReport}
                         disabled={!filteredLeads.length}
                         sx={{ fontWeight: 500, gap: 1 }}
                      >
                         <FileDownloadRoundedIcon fontSize="small" />
                         Звіт по опрацюванню лідів
                      </MenuItem>
                   </Menu>
                </Stack>
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

               <Chip
                  label="Мої"
                  onClick={() => {
                     setFilterType((prev) => (prev === 'mine' ? 'all' : 'mine'));
                     setAssigneeFilter('');
                  }}
                  sx={{
                     bgcolor:
                        filterType === 'mine'
                           ? `${theme.accent} !important`
                           : mode === 'light' ? '#ffffff !important' : 'rgba(255,255,255,0.05) !important',
                     color: filterType === 'mine' ? '#fff' : theme.text,
                     border: `1px solid ${filterType === 'mine' ? theme.accent : theme.border}`,
                     cursor: 'pointer',
                     fontWeight: 800,
                     minHeight: 44,
                     px: 1.2,
                  }}
               />

               <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ display: 'none' }}
               // sx={{ minHeight: 44, flexWrap: 'wrap' }}
               >               {[
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
                     }} sx={{
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
                  }} sx={{ minWidth: { xs: '100%', lg: 250, }, ...fieldSx }}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  <MenuItem value="__unassigned__">БЕЗ ВІДПОВІДАЛЬНОГО</MenuItem>
                  <MenuItem value="">Усі відповідальні</MenuItem>

                  {employees.map((emp) => (
                     <MenuItem key={emp._id} value={emp._id}>
                        {emp.name}
                     </MenuItem>
                  ))}
               </TextField>

               <Stack
                  direction="row"
                  spacing={1}
                  sx={{ minWidth: { xs: '100%', lg: 280 } }}
               >
                  <TextField
                     label="Дата з"
                     type="date"
                     value={reportRange.from}
                     onChange={(event) => setReportRange((prev) => ({ ...prev, from: event.target.value }))}
                     sx={{ flex: 1, ...fieldSx }}
                     InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                     label="Дата по"
                     type="date"
                     value={reportRange.to}
                     onChange={(event) => setReportRange((prev) => ({ ...prev, to: event.target.value }))}
                     sx={{ flex: 1, ...fieldSx }}
                     InputLabelProps={{ shrink: true }}
                  />
               </Stack>


               <TextField
                  placeholder="Пошук по імені, заявці, джерелу, нотатках..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position="start">
                           <SearchRoundedIcon sx={{ color: '#aaa' }} />
                        </InputAdornment>
                     ),
                  }}
               />


               <TextField
                  select
                  label="Стадія"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  sx={{ minWidth: { xs: '100%', lg: 220 }, ...fieldSx }}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  {STAGE_OPTIONS.map((x) => (
                     <MenuItem key={x.value} value={x.value}>
                        {x.label}
                     </MenuItem>
                  ))}
               </TextField>
            </Stack>

            {!!error && <Alert severity="error">{error}</Alert>}

            {(loading || employeesLoading) && (
               <Stack alignItems="center" sx={{ py: 7 }}>
                  <CircularProgress />
               </Stack>
            )}

            {!loading && !employeesLoading && items.length === 0 && (
               <Box
                  sx={{
                     py: 8,
                     textAlign: 'center',
                     borderRadius: 4,
                     border: `1px solid ${theme.border}`,
                     bgcolor: theme.bgPanel,
                  }}
               >
                  <Typography sx={{ color: theme.text, fontWeight: 850 }}>
                     Поки немає лідів
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, mt: 0.5 }}>
                     Додай першого ліда і почнемо воронку
                  </Typography>
               </Box>
            )}

            {!loading && !employeesLoading && filteredLeads.length > 0 && (
               <Stack spacing={1}>
                  {/* {items.map((item) => (
                     <LeadRow key={item._id || item.id} item={item} />
                  ))} */}
                  {filteredLeads.map((item) => (
                     <LeadRow key={item._id || item.id} item={item}
                        employees={employees} onPatched={handlePatched}
                        currentEmployeeId={currentEmployeeId || ''}
                        onEdit={setEditItem}
                        onDeleted={handleDeleted}
                     />
                  ))}
               </Stack>
            )}
         </Stack>

         <Dialog
            open={Boolean(reportDialog)}
            onClose={() => setReportDialog(null)}
            maxWidth="sm"
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
            <DialogTitle sx={{ fontWeight: 950, pb: 0.5 }}>
               {reportDialog === 'stageProgress' ? 'Звіт по опрацюванню лідів' : 'Звіт по нових лідах'}
            </DialogTitle>

            <DialogContent sx={{ pt: 1.5, pb: 1 }}>
               <Stack spacing={1.4}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                     Звіт формується по поточно відфільтрованому списку: {filteredLeads.length}
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                     <TextField
                        label="Від"
                        type="date"
                        value={reportRange.from}
                        onChange={(event) => setReportRange((prev) => ({ ...prev, from: event.target.value }))}
                        fullWidth
                        sx={fieldSx}
                        InputLabelProps={{ shrink: true }}
                     />
                     <TextField
                        label="До"
                        type="date"
                        value={reportRange.to}
                        onChange={(event) => setReportRange((prev) => ({ ...prev, to: event.target.value }))}
                        fullWidth
                        sx={fieldSx}
                        InputLabelProps={{ shrink: true }}
                     />
                  </Stack>

                  <Typography sx={{ color: theme.textSoft, fontSize: 12 }}>
                     {reportDialog === 'stageProgress'
                        ? 'Рахуємо тільки покращення стадій: ПС, РС, ДС, ПЗС, ЗС, ПЕРС.'
                        : 'Рахуємо нові ліди по даті появи та менеджеру, який додав ліда.'}
                  </Typography>
               </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
               <Button
                  onClick={() => setReportDialog(null)}
                  sx={{ color: theme.textSoft, fontWeight: 800 }}
               >
                  Закрити
               </Button>
               <Button
                  onClick={reportDialog === 'stageProgress' ? downloadStageProgressReport : downloadNewLeadsReport}
                  startIcon={<FileDownloadRoundedIcon />}
                  sx={{
                     borderRadius: 999,
                     px: 2.2,
                     color: '#111',
                     fontWeight: 950,
                     background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                     boxShadow: `0 12px 28px ${theme.glow}`,
                  }}
               >
                  Завантажити Excel
               </Button>
            </DialogActions>
         </Dialog>

         <Dialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            maxWidth="lg"
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
            <DialogTitle sx={{ fontWeight: 950, pb: 1 }}>
               Додати ліда
            </DialogTitle>

            <DialogContent sx={{ pb: 2 }}>
               <LeadForm
                  employees={employees}
                  onCancel={() => setOpenCreate(false)}
                  onCreated={handleCreated}
               />
            </DialogContent>
         </Dialog>

         <Dialog
            open={Boolean(editItem)}
            onClose={() => setEditItem(null)}
            maxWidth="lg"
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
            <DialogTitle sx={{ fontWeight: 950, pb: 1 }}>
               Редагувати ліда
            </DialogTitle>

            <DialogContent sx={{ pb: 2 }}>
               {editItem && (
                  <LeadForm
                     key={editItem._id}
                     item={editItem}
                     employees={employees}
                     onCancel={() => setEditItem(null)}
                     onUpdated={handleUpdated}
                  />
               )}
            </DialogContent>
         </Dialog>
      </Box>
   );
}
