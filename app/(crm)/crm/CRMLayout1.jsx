'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import useCurrentUser from '@/utils/useCurrentUser';

import {
   Box,
   Stack,
   Typography,
   Drawer,
   List,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   AppBar,
   Toolbar,
   Badge,
   Tooltip,
   IconButton,
   Menu,
   MenuItem,
   Avatar,
   Switch,
   Fade,
   Divider,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import TaskIcon from '@mui/icons-material/Task';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

import { useCRMTheme } from './context/CRMThemeContext';

export default function CRMLayout({ children }) {
   const pathname = usePathname();

   const [open, setOpen] = useState(false);
   const [anchorEl, setAnchorEl] = useState(null);

   const { theme, mode, toggleTheme } = useCRMTheme();
   const { data: session } = useSession();

   const { user } = useCurrentUser();

   const openMenu = Boolean(anchorEl);
   const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
   const handleMenuClose = () => setAnchorEl(null);

   const handleLogout = async () => {
      handleMenuClose();
      await signOut({ callbackUrl: '/' });
   };

   // ✅ Пункт "Об'єкти" додано
   const menuItems = [
      // { label: 'Дашборд', path: '/crm', icon: <DashboardIcon /> },
      { label: "Об'єкти", path: '/crm/objects', icon: <HomeWorkIcon /> },
      // { label: 'Клієнти', path: '/crm/clients', icon: <PeopleIcon />, badge: 3 },
      { label: 'Ліди', path: '/crm/leads3', icon: <PersonSearchRoundedIcon />, badge: 15 },
      // { label: 'Угоди', path: '/crm/deals', icon: <AssignmentIcon /> },
      { label: 'Оренда', path: '/crm/rent', icon: <HomeWorkRoundedIcon /> },
      // { label: 'Завдання', path: '/crm/tasks', icon: <TaskIcon />, badge: 2 },
      { label: 'Персонал', path: '/crm/employees', icon: <GroupsRoundedIcon /> },
      // { label: 'Аналітика', path: '/crm/analytics', icon: <BarChartIcon /> },
   ];

   // Фолбеки (якщо в темі чогось не буде)
   const BG_DARK = theme?.bgDark || '#0f0f17';
   const BG_PANEL = theme?.bgPanel || '#151521';
   const BORDER = theme?.border || '#26263a';
   const TEXT = theme?.text || '#e6e6f0';
   const ACCENT = theme?.accent || '#8b5cf6';
   const HOVER = theme?.hover || 'rgba(139,92,246,0.12)';

   const TEXT_SOFT = theme?.textSoft || 'rgba(230,230,240,0.68)';
   const GLOW = theme?.glow || 'rgba(139,92,246,0.45)';
   const MAIN_GRADIENT =
      theme?.mainGradient ||
      'linear-gradient(180deg, rgba(21,21,33,0.92), rgba(21,21,33,0.78))';

   const isLuxury = mode === 'luxury';
   const isLight = mode === 'light';

   // ✅ Active визначення (і для /crm/clients/123 теж активний)
   const isActive = (path) => {
      if (path === '/crm') return pathname === '/crm';
      return pathname === path || pathname?.startsWith(path + '/');
   };

   return (
      <Box
         sx={{
            display: 'flex',
            minHeight: '100vh',
            color: TEXT,
            background: `
          radial-gradient(circle at 18% 18%, ${ACCENT}20, transparent 45%),
          radial-gradient(circle at 82% 75%, ${ACCENT}12, transparent 42%),
          ${BG_DARK}
        `,
            transition: 'all 0.25s ease',
         }}
      >
         {/* Drawer */}
         <Drawer
            variant="permanent"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            sx={{
               width: open ? 240 : 76,
               flexShrink: 0,
               '& .MuiDrawer-paper': {
                  width: open ? 240 : 76,
                  transition: 'width 0.35s ease',
                  boxSizing: 'border-box',
                  background: `linear-gradient(180deg, ${BG_DARK}, ${BG_PANEL})`,
                  borderRight: `1px solid ${BORDER}`,
                  color: TEXT_SOFT,
                  overflowX: 'hidden',
               },
            }}
         >
            <Toolbar
               sx={{
                  justifyContent: 'center',
                  height: 64,        // ✅ фіксована висота
                  minHeight: 64,     // ✅ щоб MUI не міняв
                  py: 0,
                  px: 1.5,
               }}
            >
               <Typography
                  variant="h6"
                  sx={{
                     fontWeight: 900,
                     letterSpacing: 0.2,
                     color: ACCENT,
                     textShadow: `0 0 14px ${GLOW}`,
                     userSelect: 'none',

                     // ✅ ключове:
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',

                     // ✅ щоб не було “скачка” від зміни fontSize:
                     fontSize: '0.7rem',
                     width: '100%',
                     textAlign: 'center',
                  }}
               >
                  {open ? 'CRM Karamax' : 'CRM'}
               </Typography>
            </Toolbar>

            <Divider sx={{ borderColor: BORDER, opacity: 0.6 }} />

            <List sx={{ pt: 1 }}>
               {menuItems.map((item) => {
                  const active = isActive(item.path);

                  return (
                     <Tooltip key={item.path} title={!open ? item.label : ''} placement="right">
                        <ListItemButton
                           component={Link}
                           href={item.path}
                           sx={{
                              mx: 1,
                              my: 0.6,
                              px: 2,
                              py: 1.05,
                              borderRadius: 2,
                              border: `1px solid ${active ? ACCENT + '40' : 'transparent'}`,
                              position: 'relative',
                              overflow: 'hidden',
                              // backgroundColor: active ? 'rgba(139,92,246,0.10)' : 'transparent',
                              backgroundColor: active ? HOVER : 'transparent',
                              boxShadow: active
                                 ? `0 0 0 1px ${ACCENT}22, 0 12px 28px ${isLight ? 'rgba(124,58,237,0.10)' : 'rgba(0,0,0,0.35)'}`
                                 : 'none',
                              // ліва смужка як у Linear
                              '&::before': {
                                 content: '""',
                                 position: 'absolute',
                                 left: 0,
                                 top: 10,
                                 bottom: 10,
                                 width: 3,
                                 borderRadius: 10,
                                 background: active
                                    ? `linear-gradient(180deg, ${ACCENT}, ${ACCENT}30)`
                                    : 'transparent',
                                 boxShadow: active ? `0 0 14px ${GLOW}` : 'none',
                                 opacity: active ? 1 : 0,
                                 transition: 'opacity 0.2s ease',
                              },

                              '&:hover': {
                                 backgroundColor: HOVER,
                                 borderColor: `${ACCENT}33`,
                                 boxShadow: `0 0 0 1px ${ACCENT}22, 0 10px 25px ${isLight ? 'rgba(124,58,237,0.10)' : 'rgba(0,0,0,0.30)'}`,
                              },

                              '&:hover::before': {
                                 opacity: 1,
                                 background: `linear-gradient(180deg, ${ACCENT}, rgba(139,92,246,0.15))`,
                                 boxShadow: `0 0 14px ${ACCENT}55`,
                              },
                           }}
                        >
                           <ListItemIcon sx={{ color: ACCENT, minWidth: 40 }}>
                              {item.badge ? (
                                 <Badge
                                    badgeContent={item.badge}
                                    sx={{
                                       '& .MuiBadge-badge': {
                                          backgroundColor: ACCENT,
                                          color: '#fff',
                                          boxShadow: `0 0 14px ${ACCENT}55`,
                                       },
                                    }}
                                 >
                                    {item.icon}
                                 </Badge>
                              ) : (
                                 item.icon
                              )}
                           </ListItemIcon>

                           <Fade in={open}>
                              <ListItemText
                                 primary={item.label}
                                 primaryTypographyProps={{
                                    sx: {
                                       fontWeight: active ? 800 : 650,
                                       color: TEXT,
                                       fontSize: 14,
                                    },
                                 }}
                              />
                           </Fade>
                        </ListItemButton>
                     </Tooltip>
                  );
               })}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ px: 2, pb: 2, opacity: open ? 1 : 0, transition: 'opacity 0.2s ease' }}>
               <Typography sx={{ fontSize: 12, color: 'rgba(230,230,240,0.6)' }}>
                  Karamax • внутрішня панель
               </Typography>
            </Box>
         </Drawer>

         {/* Content */}
         <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Верхня панель */}
            <AppBar
               position="sticky"
               elevation={0}
               sx={{
                  // background: `linear-gradient(90deg, rgba(21,21,33,0.85), rgba(15,15,23,0.65))`,
                  // background: BG_PANEL,
                  background: isLight
                     ? 'linear-gradient(90deg, rgba(255,255,255,0.88), rgba(246,244,251,0.76))'
                     : isLuxury
                        ? 'linear-gradient(90deg, rgba(23,18,15,0.92), rgba(14,11,9,0.78))'
                        : 'linear-gradient(90deg, rgba(21,21,33,0.85), rgba(15,15,23,0.65))',
                  backdropFilter: 'blur(12px)',
                  borderBottom: `1px solid ${BORDER}`,
                  color: TEXT,
               }}
            >
               <Toolbar sx={{ gap: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
                     <IconButton
                        color="inherit"
                        onClick={() => setOpen((o) => !o)}
                        sx={{
                           borderRadius: 2,
                           border: `1px solid rgba(255,255,255,0.06)`,
                           background: 'rgba(255,255,255,0.03)',
                           '&:hover': { background: 'rgba(139,92,246,0.10)' },
                        }}
                     >
                        <MenuOpenIcon />
                     </IconButton>

                     <Box>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                           Панель управління
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(230,230,240,0.65)' }}>
                           CRM агентства нерухомості
                        </Typography>
                     </Box>
                  </Stack>

                  {/* Перемикач теми */}
                  {/* <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 0.5 }}>
                     <DarkModeIcon fontSize="small" />
                     <Switch
                        checked={mode === 'light'}
                        onChange={toggleTheme}
                        sx={{
                           '& .MuiSwitch-thumb': { backgroundColor: ACCENT },
                           '& .MuiSwitch-track': { backgroundColor: 'rgba(139,92,246,0.25)' },
                        }}
                     />
                     <LightModeIcon fontSize="small" />
                  </Stack> */}
                  <IconButton
                     onClick={toggleTheme}
                     sx={{
                        borderRadius: 2,
                        border: `1px solid ${BORDER}`,
                        background: HOVER,
                        px: 1.5
                     }}
                  >
                     {mode === 'dark' && <DarkModeIcon />}
                     {mode === 'light' && <LightModeIcon />}
                     {mode === 'luxury' && <Typography sx={{ fontSize: 14 }}>💎</Typography>}
                  </IconButton>


                  {/* User */}
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0.4 }}>
                     <Avatar
                        sx={{
                           bgcolor: ACCENT,
                           color: '#0b0b12',
                           fontWeight: 900,
                           boxShadow: `0 0 14px ${GLOW}`,
                        }}
                     >
                        {session?.user?.name?.[0]?.toUpperCase() || 'Ю'}
                     </Avatar>
                  </IconButton>

                  <Menu
                     anchorEl={anchorEl}
                     open={openMenu}
                     onClose={handleMenuClose}
                     PaperProps={{
                        sx: {
                           bgcolor: BG_PANEL,
                           color: TEXT,
                           border: `1px solid ${BORDER}`,
                           mt: 1.5,
                           borderRadius: 3,
                           boxShadow: '0 20px 45px rgba(0,0,0,0.55)',
                           minWidth: 220,
                        },
                     }}
                  >
                     <MenuItem disabled>
                        <PersonIcon sx={{ mr: 1, color: ACCENT }} />
                        {/* {session?.user?.name || 'Користувач'} */}
                        <Stack spacing={0}>
                           <Typography sx={{ color: ACCENT, fontWeight: 600 }}>
                              {user?.name || 'Користувач'}
                           </Typography>

                           <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                              {user?.position || '—'} · {user?.role || ''}
                           </Typography>
                           {user?.isFallbackAdmin && (
                              <Chip label="ENV" size="small" color="warning" />
                           )}
                        </Stack>
                     </MenuItem>

                     <MenuItem onClick={handleLogout}>
                        <LogoutIcon sx={{ mr: 1, color: ACCENT }} /> Вийти
                     </MenuItem>
                  </Menu>
               </Toolbar>
            </AppBar>

            {/* Main */}
            <Box
               component="main"
               sx={{
                  p: 3,
                  m: 2,
                  borderRadius: 3,
                  // background: `linear-gradient(180deg, rgba(21,21,33,0.92), rgba(21,21,33,0.78))`,
                  background: MAIN_GRADIENT,
                  border: `1px solid ${BORDER}`,
                  boxShadow: isLight
                     ? '0 18px 40px rgba(124,58,237,0.08)'
                     : isLuxury
                        ? '0 22px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.06)'
                        : '0 18px 45px rgba(0,0,0,0.45)',
                  minHeight: 'calc(100vh - 88px)',
               }}
            >
               {children}
            </Box>
         </Box>
      </Box>
   );
}