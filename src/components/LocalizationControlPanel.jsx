import React from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Grid, Typography, Divider } from '@mui/material';

import CameraOffset from './CameraOffset';
import SetFieldType from './SetFieldType';
import MCLConfig from './MCLConfig';
import SetRobotPosition from './SetRobotPosition';

function LocalizationControlPanel({ showControlPanel, setShowControlPanel }) {
  const WEB_VIDEO_API_URL = import.meta.env.VITE_WEB_VIDEO_API_URL;
  const handlePanelToggle = (event, isExpanded) => {
    setShowControlPanel(isExpanded);
  };

  return (
    <Grid
      item
      xs={12}
      md={12}
      lg={showControlPanel ? 5 : 3}
      sx={{ transition: 'all 0.3s' }}
    >
      <Accordion
        expanded={showControlPanel}
        onChange={handlePanelToggle}
        elevation={3}
        sx={{ borderRadius: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Controls Panel
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Divider sx={{ mb: 2 }} />
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Field Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SetFieldType />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Processed Picture</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <img
                src={`${WEB_VIDEO_API_URL}/stream?topic=/camera/processed_image&quality=50`}
                alt="processed vision"
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>MCL Config</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <MCLConfig />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Camera Offset</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CameraOffset />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Robot Position</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SetRobotPosition />
            </AccordionDetails>
          </Accordion>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}

export default LocalizationControlPanel;
