import React, { useContext } from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box,
} from '@mui/material';

import AppContext from '../context/AppContext';

function SetFieldType() {
  const { fieldType, setFieldType } = useContext(AppContext);

  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      setFieldType(newValue);
    }
  };

  return (
    <Box>
      <Typography mb={1}>Field Type</Typography>
      <ToggleButtonGroup
        value={fieldType}
        exclusive
        onChange={handleChange}
        size="small"
        fullWidth
      >
        <ToggleButton value="kri">KRI</ToggleButton>
        <ToggleButton value="robocup">RoboCup</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

export default SetFieldType;
