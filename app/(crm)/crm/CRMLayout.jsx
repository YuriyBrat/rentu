'use client';
import { useState } from 'react';
import {
   Box, Stack, Typography, Drawer, List, ListItemButton, ListItemIcon,
   ListItemText, AppBar, Toolbar, Badge, Tooltip, IconButton, Menu,
   MenuItem, Avatar, Switch, Fade
} from '@mui/material';
import Link from 'next/link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import TaskIcon from '@mui/icons-material/Task';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import { useCRMTheme } from './context/CRMThemeContext';

import { useSession, signOut } from 'next-auth/react';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

export default function CRMLayout({ children }) {
   const [open, setOpen] = useState(false);
   const [anchorEl, setAnchorEl] = useState(null);
   const { theme, mode, toggleTheme } = useCRMTheme(); // ✅ контекст

   const { data: session } = useSession();
   const openMenu = Boolean(anchorEl);

   const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
   const handleMenuClose = () => setAnchorEl(null);
   const handleLogout = async () => {
      handleMenuClose();
      await signOut({ callbackUrl: '/' });
   };

   const menuItems = [
      { label: 'Дашборд', path: '/crm', icon: <DashboardIcon /> },
      { label: 'Клієнти', path: '/crm/clients', icon: <PeopleIcon />, badge: 3 },
      { label: 'Угоди', path: '/crm/deals', icon: <AssignmentIcon /> },
      { label: 'Завдання', path: '/crm/tasks', icon: <TaskIcon />, badge: 2 },
      { label: 'Аналітика', path: '/crm/analytics', icon: <BarChartIcon /> },
   ];

   return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.bgDark, color: theme.text, transition: 'all 0.3s ease' }}>
         {/* Drawer */}
         <Drawer
            variant="permanent"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            sx={{
               width: open ? 230 : 72,
               flexShrink: 0,
               '& .MuiDrawer-paper': {
                  width: open ? 230 : 72,
                  transition: 'width 0.45s ease',
                  boxSizing: 'border-box',
                  backgroundColor: theme.bgDark,
                  borderRight: `1px solid ${theme.border}`,
                  color: theme.text,
                  overflowX: 'hidden',
               },
            }}
         >
            <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
               <Typography
                  variant="h6"
                  sx={{
                     fontWeight: 'bold',
                     fontSize: open ? '1.1rem' : '0.9rem',
                     color: theme.accent,
                  }}
               >
                  {open ? 'CRM Агентства' : 'CRM'}
               </Typography>
            </Toolbar>

            <List>
               {menuItems.map((item) => (
                  <Tooltip key={item.path} title={!open ? item.label : ''} placement="right">
                     <ListItemButton
                        component={Link}
                        href={item.path}
                        sx={{
                           px: 2,
                           py: 1,
                           borderLeft: '3px solid transparent',
                           '&:hover': {
                              backgroundColor: theme.hover,
                              borderLeft: `3px solid ${theme.accent}`,
                           },
                        }}
                     >
                        <ListItemIcon sx={{ color: theme.accent, minWidth: 40 }}>
                           {item.badge ? (
                              <Badge
                                 badgeContent={item.badge}
                                 sx={{
                                    '& .MuiBadge-badge': {
                                       backgroundColor: theme.accent,
                                       color: '#fff',
                                    },
                                 }}
                              >
                                 {item.icon}
                              </Badge>
                           ) : (
                              item.icon
                           )}
                        </ListItemIcon>
                        <Fade in={open}><ListItemText primary={item.label} /></Fade>
                     </ListItemButton>
                  </Tooltip>
               ))}
            </List>
         </Drawer>

         {/* Верхня панель */}
         <Box sx={{ flexGrow: 1 }}>
            <AppBar position="sticky"
               sx={{
                  backgroundColor: theme.bgPanel,
                  color: theme.text,
                  borderBottom: `1px solid ${theme.border}`,
               }}>
               <Toolbar>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
                     <IconButton color="inherit" onClick={() => setOpen((o) => !o)}>
                        <MenuOpenIcon />
                     </IconButton>
                     <Typography variant="h6">Панель управління</Typography>
                  </Stack>

                  {/* Перемикач теми */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                     <DarkModeIcon fontSize="small" />
                     <Switch checked={mode === 'light'} onChange={toggleTheme}
                        sx={{ '& .MuiSwitch-thumb': { backgroundColor: theme.accent } }} />
                     <LightModeIcon fontSize="small" />
                  </Stack>

                  <IconButton onClick={handleMenuOpen}>
                     <Avatar sx={{ bgcolor: theme.accent }}>
                        {session?.user?.name?.[0]?.toUpperCase() || 'Ю'}
                     </Avatar>
                  </IconButton>

                  <Menu
                     anchorEl={anchorEl}
                     open={openMenu}
                     onClose={handleMenuClose}
                     PaperProps={{
                        sx: {
                           bgcolor: theme.bgPanel,
                           color: theme.text,
                           border: `1px solid ${theme.border}`,
                           mt: 1.5,
                        },
                     }}
                  >
                     <MenuItem disabled>
                        <PersonIcon sx={{ mr: 1, color: theme.accent }} />
                        {session?.user?.name || 'Користувач'}
                     </MenuItem>
                     <MenuItem onClick={handleLogout}>
                        <LogoutIcon sx={{ mr: 1, color: theme.accent }} /> Вийти
                     </MenuItem>
                  </Menu>
               </Toolbar>
            </AppBar>

            <Box component="main" sx={{ p: 3, bgcolor: theme.bgPanel }}>
               {children}
            </Box>
         </Box>
      </Box>
   );
}
