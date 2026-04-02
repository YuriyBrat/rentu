'use client';

import { useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Chip,
   Collapse,
   Divider,
} from '@mui/material';

const stageColors = {
   lead: { bg: 'rgba(255,255,255,0.08)', color: '#fff', label: 'Лід' },
   hot: { bg: 'rgba(250,204,21,0.2)', color: '#fde68a', label: 'Гарячий' },
   ps: { bg: 'rgba(59,130,246,0.2)', color: '#93c5fd', label: 'ПС' },
   rs: { bg: 'rgba(45,212,191,0.2)', color: '#5eead4', label: 'РС' },
   ds: { bg: 'rgba(251,146,60,0.2)', color: '#fdba74', label: 'ДС' },
   zs: { bg: 'rgba(34,197,94,0.2)', color: '#86efac', label: 'ЗС' },
   pers: { bg: 'rgba(139,92,246,0.2)', color: '#c4b5fd', label: 'ПЕРС' },
};

const noteColors = {
   positive: '#22c55e',
   negative: '#ef4444',
   info: '#facc15',
   important: '#3b82f6',
};

export default function LeadRow({ item }) {
   const [open, setOpen] = useState(false);

   const stage = stageColors[item.stage] || stageColors.lead;
   const lastNote = item.notes?.[item.notes.length - 1];

   return (
      <Box
         sx={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            p: 1.2,
            bgcolor: 'rgba(255,255,255,0.03)',
            cursor: 'pointer',
         }}
         onClick={() => setOpen((p) => !p)}
      >
         <Stack direction="row" spacing={1} alignItems="center">
            {/* NAME */}
            <Box sx={{ minWidth: 180 }}>
               <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                  {item.name}
               </Typography>
               <Typography sx={{ color: '#aaa', fontSize: 12 }}>
                  {item.phones[0]}
               </Typography>
            </Box>

            {/* STAGE */}
            <Chip
               label={stage.label}
               sx={{
                  bgcolor: stage.bg,
                  color: stage.color,
                  fontWeight: 900,
               }}
            />

            {/* REQUEST */}
            <Typography sx={{ color: '#ddd', flex: 1 }}>
               {item.requestSummary}
            </Typography>

            {/* SOURCE */}
            <Typography sx={{ color: '#aaa', fontSize: 12 }}>
               {item.sourceChannel}
            </Typography>

            {/* ASSIGNEE */}
            <Typography sx={{ color: '#aaa', fontSize: 12 }}>
               {item.assignee}
            </Typography>

            {/* LAST CONTACT */}
            <Typography sx={{ color: '#aaa', fontSize: 12 }}>
               {item.lastContactAt}
            </Typography>

            {/* NOTE */}
            {lastNote && (
               <Typography
                  sx={{
                     color: noteColors[lastNote.type],
                     fontSize: 12,
                     maxWidth: 160,
                  }}
                  noWrap
               >
                  {lastNote.text}
               </Typography>
            )}
         </Stack>

         {/* EXPAND */}
         <Collapse in={open}>
            <Divider sx={{ my: 1 }} />

            <Stack spacing={1}>
               <Typography sx={{ color: '#fff', fontWeight: 700 }}>
                  Джерело: {item.sourceObject}
               </Typography>

               <Typography sx={{ color: '#aaa' }}>
                  Хто вніс: {item.createdBy}
               </Typography>

               <Typography sx={{ color: '#aaa' }}>
                  Дата створення: {item.createdAt}
               </Typography>

               {/* NOTES */}
               <Stack spacing={0.5}>
                  {item.notes.map((note, i) => (
                     <Box
                        key={i}
                        sx={{
                           p: 1,
                           borderRadius: 2,
                           bgcolor: 'rgba(255,255,255,0.04)',
                           border: `1px solid ${noteColors[note.type]}33`,
                        }}
                     >
                        <Typography sx={{ color: noteColors[note.type] }}>
                           {note.text}
                        </Typography>
                        <Typography sx={{ color: '#777', fontSize: 11 }}>
                           {note.createdAt}
                        </Typography>
                     </Box>
                  ))}
               </Stack>
            </Stack>
         </Collapse>
      </Box>
   );
}