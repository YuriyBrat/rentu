'use client'
import { Button, ButtonGroup, IconButton, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Box, Checkbox, Rating, Grid } from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';

import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { useState } from 'react';


const page = () => {
   const [formats, setFormats] = useState([]);
   const handleFormatChange = (e, updatedFormats) => {
      setFormats(updatedFormats)
   }


   const [value, setValue] = useState('');
   const [rat, setRat] = useState(null);
   const handleRat = (e, valueRat) => {
      setRat(valueRat)
   }

   return (
      <>

         <Stack spacing={1} direction="row">
            <Button variant="contained" color="success">Type me</Button>
            <Button variant="contained" color="warning" size="small">Small</Button>
            <Button variant="contained" color="info" size="medium">Medium</Button>
            <Button variant="contained" color="primary" size="large">Large</Button>

         </Stack>

         <Stack spacing={1} direction="row">
            <Button variant='contained' color="secondary" startIcon={<SendIcon />} disableElevation>Send</Button>
            <Button variant='contained' color="info" endIcon={<SendIcon />}
               disableRipple
            // onClick={() => alert('Click')}
            >Send</Button>

            <IconButton aria-label='send' color='secondary' size='small' >
               <SendIcon />
            </IconButton>
         </Stack>

         <ButtonGroup>
            <Button variant="contained" color="success">Type me</Button>
            <Button variant="contained" color="warning" size="small">Small</Button>
            <Button variant="contained" color="info" size="medium">Medium</Button>
            <Button variant="contained" color="secondary" size="large">Large</Button>
         </ButtonGroup>

         <ButtonGroup variant='outlined'>
            <Button color="success">Left</Button>
            <Button color="warning" >Center</Button>
            <Button color="info" >Right</Button>
         </ButtonGroup>

         <ButtonGroup variant='text' orientation='vertical' aria-label='alignment label group'>
            <Button >Left</Button>
            <Button  >Center</Button>
            <Button >Right</Button>
         </ButtonGroup>


         <Stack direction='row'>
            <ToggleButtonGroup aria-label="text formatting"
               value={formats}
               onChange={handleFormatChange}
               size='small'
               color='secondary'
            >
               <ToggleButton value='bold'>
                  <FormatBoldIcon />
               </ToggleButton>
               <ToggleButton value='italic'>
                  <FormatItalicIcon />
               </ToggleButton>
               <ToggleButton value='underlined'>
                  <FormatUnderlinedIcon />
               </ToggleButton>
            </ToggleButtonGroup>
         </Stack>


         <Stack spacing={4}>
            <Stack direction='row' spacing={2}>
               <TextField label="Name" variant='outlined' />
               <TextField label="Name" variant='filled' />
               <TextField label="Name" variant='standard' />
            </Stack>
            <Stack direction='row' spacing={2}>
               <TextField label="Form input" required size='small' />
               <TextField label="Name" variant='filled' helperText="Be carefull. Go to run now" />
               <TextField label="Name" variant='standard' />
            </Stack>

            <Stack direction='row' spacing={2}>
               <TextField label="Amount" size='small'
                  slotProps={{
                     input: {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                     },
                  }}
               />
               <TextField label="Weight" size='small'
                  slotProps={{
                     input: {
                        startAdornment: <InputAdornment position="start">kg</InputAdornment>,
                     },
                  }}
               />

               <TextField
                  label="Form Input"
                  size='small'
                  required
                  color="secondary"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  error={!value}
                  helperText={!value ? 'Required' : 'Go to run!'}
               />
            </Stack>
         </Stack>

         <Box>
            <Checkbox
               icon={<BookmarkBorderIcon />}
               checkedIcon={<BookmarkIcon />}
            />
         </Box>

         <Stack spacing={2}>
            <Rating
               value={rat}
               // size='small'
               precision={0.5}
               onChange={handleRat}
            />

         </Stack>
         <Stack spacing={2}>
            <Rating
               value={4}
               onChange={handleRat}
               icon={<FavoriteIcon color='error' />}
               emptyIcon={<FavoriteBorderIcon />}
               readOnly
            />

         </Stack>

         <Grid container rowSpacing={1} columnSpacing={0.5}>
            <Grid item  xs={8}>
               <Box bgcolor='primary.light' p={2}>Item 1</Box>
            </Grid >
            <Grid item  xs={4}>
               <Box bgcolor='primary.light' p={2}>Item 2</Box>
            </Grid>
            <Grid item>
               <Box bgcolor='primary.light' p={2}>Item 3</Box>
            </Grid>
            <Grid item>
               <Box bgcolor='primary.light' p={2}>Item 4</Box>
            </Grid>
         </Grid>

      </>
   )
}

export default page