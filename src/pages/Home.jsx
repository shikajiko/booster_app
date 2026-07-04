import React, { useContext } from 'react';

import { Box, Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

import AppContext from '../context/AppContext';

function Home() {
  const WEB_VIDEO_API_URL = import.meta.env.VITE_WEB_VIDEO_API_URL;
  const { currentCompetition, imageQuality } = useContext(AppContext);

  return (
    <Box>
      <Grid container spacing={2} paddingX={4}>
        <Grid item lg={5}>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
