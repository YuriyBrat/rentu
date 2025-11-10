'use client';
import { useState, useEffect } from 'react';
import {
   Box,
   Grid,
   Paper,
   Stack,
   Typography,
   MenuItem,
   Select,
   FormControl,
   InputLabel,
} from '@mui/material';
import { useCRMTheme } from '../context/CRMThemeContext';
import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   BarChart,
   Bar,
   PieChart,
   Pie,
   Cell,
   Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// 🔹 Мок-дані для різних періодів
const mockData = {
   week: {
      stats: [
         { title: 'Клієнти', value: 42, diff: '+4%' },
         { title: 'Угоди', value: 12, diff: '+2%' },
         { title: 'Продажі, грн', value: 183000, diff: '+6%' },
         { title: 'Середній чек', value: 15250, diff: '-1%' },
      ],
      dealsByMonth: [
         { month: 'Пн', deals: 2 },
         { month: 'Вт', deals: 3 },
         { month: 'Ср', deals: 4 },
         { month: 'Чт', deals: 1 },
         { month: 'Пт', deals: 2 },
         { month: 'Сб', deals: 0 },
         { month: 'Нд', deals: 0 },
      ],
   },
   month: {
      stats: [
         { title: 'Клієнти', value: 327, diff: '+12%' },
         { title: 'Угоди', value: 95, diff: '+8%' },
         { title: 'Продажі, грн', value: 1230000, diff: '+15%' },
         { title: 'Середній чек', value: 12950, diff: '-3%' },
      ],
      dealsByMonth: [
         { month: 'Січ', deals: 14 },
         { month: 'Лют', deals: 18 },
         { month: 'Бер', deals: 22 },
         { month: 'Квіт', deals: 30 },
         { month: 'Трав', deals: 25 },
         { month: 'Черв', deals: 28 },
      ],
   },
   year: {
      stats: [
         { title: 'Клієнти', value: 1850, diff: '+24%' },
         { title: 'Угоди', value: 1120, diff: '+18%' },
         { title: 'Продажі, грн', value: 15600000, diff: '+22%' },
         { title: 'Середній чек', value: 13900, diff: '+4%' },
      ],
      dealsByMonth: [
         { month: 'Січ', deals: 60 },
         { month: 'Лют', deals: 72 },
         { month: 'Бер', deals: 95 },
         { month: 'Квіт', deals: 110 },
         { month: 'Трав', deals: 90 },
         { month: 'Черв', deals: 100 },
      ],
   },
};

const salesByAgent = [
   { agent: 'Іван', value: 120000 },
   { agent: 'Оксана', value: 95000 },
   { agent: 'Андрій', value: 78000 },
   { agent: 'Марія', value: 65000 },
];

const dealTypes = [
   { name: 'Продаж', value: 55 },
   { name: 'Оренда', value: 30 },
   { name: 'Новобудови', value: 15 },
];

export default function AnalyticsPage() {
   const { theme } = useCRMTheme();
   const [period, setPeriod] = useState('month');
   const [data, setData] = useState(mockData[period]);
   const accentColors = [theme.accent, theme.accentLight, '#9999ff'];

   useEffect(() => {
      // Анімаційна зміна даних при перемиканні фільтра
      const timeout = setTimeout(() => setData(mockData[period]), 300);
      return () => clearTimeout(timeout);
   }, [period]);

   // 🔹 Лічильник, який плавно “підраховує” значення
   const AnimatedNumber = ({ value }) => {
      const [display, setDisplay] = useState(0);
      useEffect(() => {
         let start = 0;
         const step = Math.ceil(value / 40);
         const interval = setInterval(() => {
            start += step;
            if (start >= value) {
               setDisplay(value);
               clearInterval(interval);
            } else setDisplay(start);
         }, 25);
         return () => clearInterval(interval);
      }, [value]);
      return (
         <Typography variant="h5" fontWeight={700} color={theme.accent} mb={0.5}>
            {value > 9999 ? display.toLocaleString('uk-UA') : display}
         </Typography>
      );
   };

   return (
      <Box sx={{ p: 3 }}>
         <Typography variant="h5" fontWeight={700} mb={3}>
            Аналітика продажів
         </Typography>

         {/* Фільтри */}
         <Stack direction="row" justifyContent="flex-end" mb={3}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
               <InputLabel sx={{ color: theme.text }}>Період</InputLabel>
               <Select
                  value={period}
                  label="Період"
                  onChange={(e) => setPeriod(e.target.value)}
                  sx={{
                     bgcolor: theme.bgPanel,
                     color: theme.text,
                     '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.border,
                     },
                  }}
               >
                  <MenuItem value="week">Тиждень</MenuItem>
                  <MenuItem value="month">Місяць</MenuItem>
                  <MenuItem value="year">Рік</MenuItem>
               </Select>
            </FormControl>
         </Stack>

         {/* Показники */}
         <Grid container spacing={2} mb={3}>
            <AnimatePresence>
               {data.stats.map((item, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                     <motion.div
                        key={period + idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                     >
                        <Paper
                           sx={{
                              p: 2,
                              border: `1px solid ${theme.border}`,
                              bgcolor: theme.bgPanel,
                              textAlign: 'center',
                              borderRadius: 3,
                           }}
                        >
                           <Typography variant="body2" color={theme.text} mb={1}>
                              {item.title}
                           </Typography>
                           <AnimatedNumber value={item.value} />
                           <Typography
                              variant="body2"
                              sx={{
                                 color: item.diff.startsWith('+') ? '#4caf50' : '#f44336',
                              }}
                           >
                              {item.diff}
                           </Typography>
                        </Paper>
                     </motion.div>
                  </Grid>
               ))}
            </AnimatePresence>
         </Grid>

         {/* Графіки */}
         <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
               <Paper
                  sx={{
                     p: 2,
                     border: `1px solid ${theme.border}`,
                     bgcolor: theme.bgPanel,
                     height: 320,
                     borderRadius: 3,
                  }}
               >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                     Угоди по місяцях
                  </Typography>
                  <ResponsiveContainer width="100%" height="85%">
                     <LineChart data={data.dealsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                        <XAxis dataKey="month" stroke={theme.text} />
                        <YAxis stroke={theme.text} />
                        <Tooltip
                           contentStyle={{
                              background: theme.bgDark,
                              border: `1px solid ${theme.border}`,
                              color: theme.text,
                           }}
                        />
                        <Line
                           type="monotone"
                           dataKey="deals"
                           stroke={theme.accent}
                           strokeWidth={3}
                           dot={{ r: 4 }}
                        />
                     </LineChart>
                  </ResponsiveContainer>
               </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
               <Paper
                  sx={{
                     p: 2,
                     border: `1px solid ${theme.border}`,
                     bgcolor: theme.bgPanel,
                     height: 320,
                     borderRadius: 3,
                  }}
               >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                     Продажі по агентах
                  </Typography>
                  <ResponsiveContainer width="100%" height="85%">
                     <BarChart data={salesByAgent}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                        <XAxis dataKey="agent" stroke={theme.text} />
                        <YAxis stroke={theme.text} />
                        <Tooltip
                           contentStyle={{
                              background: theme.bgDark,
                              border: `1px solid ${theme.border}`,
                              color: theme.text,
                           }}
                        />
                        <Bar dataKey="value" fill={theme.accent} radius={5} />
                     </BarChart>
                  </ResponsiveContainer>
               </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
               <Paper
                  sx={{
                     p: 2,
                     border: `1px solid ${theme.border}`,
                     bgcolor: theme.bgPanel,
                     height: 320,
                     borderRadius: 3,
                  }}
               >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                     Типи угод
                  </Typography>
                  <ResponsiveContainer width="100%" height="85%">
                     <PieChart>
                        <Pie
                           data={dealTypes}
                           dataKey="value"
                           nameKey="name"
                           cx="50%"
                           cy="50%"
                           outerRadius={90}
                           innerRadius={50}
                           label
                        >
                           {dealTypes.map((entry, index) => (
                              <Cell
                                 key={`cell-${index}`}
                                 fill={accentColors[index % accentColors.length]}
                              />
                           ))}
                        </Pie>
                        <Legend />
                        <Tooltip
                           contentStyle={{
                              background: theme.bgDark,
                              border: `1px solid ${theme.border}`,
                              color: theme.text,
                           }}
                        />
                     </PieChart>
                  </ResponsiveContainer>
               </Paper>
            </Grid>
         </Grid>
      </Box>
   );
}
