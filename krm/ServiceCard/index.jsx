'use client';

import { Box, Typography, Button, Stack, useTheme, Card } from '@mui/material';
import { Assignment, Campaign, Gavel } from '@mui/icons-material';
import React from 'react';

const iconMap = {
   marketing: <Campaign sx={{ fontSize: 32, color: 'primary.main' }} />,
   legal: <Gavel sx={{ fontSize: 32, color: 'primary.main' }} />,
   default: <Assignment sx={{ fontSize: 32, color: 'primary.main' }} />,
};

const ServiceCard = ({ title, description, type = 'default', onClick }) => {
   const theme = useTheme();

   return (
      <Card
         sx={{
            height: '100%',
            minHeight: 220,
            p: 2,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
         }}
      >
         <Stack spacing={1}>
            <Box>{iconMap[type] || iconMap.default}</Box>

            <Typography variant="h6" fontWeight={600} color="common.white">
               {title}
            </Typography>

            <Typography variant="body2" sx={{ color: theme.palette.grey[400], flexGrow: 1 }}>
               {description}
            </Typography>
         </Stack>

         <Button
            variant="outlined"
            fullWidth
            size="small"
            onClick={onClick}
            sx={{ mt: 2, borderRadius: 2 }}
         >
            Детальніше
         </Button>
      </Card>
   );
};

export default ServiceCard;
