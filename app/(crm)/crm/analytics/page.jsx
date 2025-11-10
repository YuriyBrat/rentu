'use client';
import { useState } from 'react';
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
import { motion } from 'framer-motion';

// 🔹 мок-дані
const dealsByMonth = [
   { month: 'Січ', deals: 14 },
   { month: 'Лют', deals: 18 },
   { month: 'Бер', deals: 22 },
   { month: 'Квіт', deals: 30 },
   { month: 'Трав', deals: 25 },
   { month: 'Черв', deals: 28 },
];

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

   const accentColors = [theme.accent, theme.accentLight, '#9999ff'];

   return (
      <Box sx={{ p: 3 }}>
         <Typography variant="h5" fontWeight={700} mb={3} color={theme.text}>
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
                     borderColor: theme.border,
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
            {[
               { title: 'Клієнти', value: 327, diff: '+12%' },
               { title: 'Угоди', value: 95, diff: '+8%' },
               { title: 'Продажі, грн', value: '1.23 млн', diff: '+15%' },
               { title: 'Середній чек', value: '12 950 грн', diff: '-3%' },
            ].map((item, idx) => (
               <Grid item xs={12} sm={6} md={3} key={idx}>
                  <motion.div
                     whileHover={{ scale: 1.03 }}
                     transition={{ type: 'spring', stiffness: 250 }}
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
                        <Typography
                           variant="h5"
                           fontWeight={700}
                           color={theme.accent}
                           mb={0.5}
                        >
                           {item.value}
                        </Typography>
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
         </Grid>

         {/* Графіки */}
         <Grid container spacing={3}>
            {/* Лінійний графік */}
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
                     <LineChart data={dealsByMonth}>
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

            {/* Стовпчиковий */}
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

            {/* Кільцева діаграма */}
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
                              <Cell key={`cell-${index}`} fill={accentColors[index % accentColors.length]} />
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
