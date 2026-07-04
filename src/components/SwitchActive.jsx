import React, { useContext } from 'react';

import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import AppContext from '../context/AppContext';

const ItemTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  padding: theme.spacing(1),
  fontSize: '0.75rem',
}));

const ItemValue = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
}));

function SwitchState({ name, keys, label, value, type }) {
  const {
    setMainValue, setWalkingValue, setKinematicValue, setDetectionToggle, setRecordStatus, setMCLConfigValue,
  } = useContext(AppContext);

  const handleChange = (event) => {
    switch (type) {
      case 'main':
        setMainValue(name, event.target.checked);
        break;
      case 'walking':
      case 'pid':
        setWalkingValue('pid', name, event.target.checked);
        break;
      case 'kinematic':
        setKinematicValue('balance_pause', name, event.target.checked);
        break;
      case 'soccer':
        setDetectionToggle(event.target.checked);
        break;
      case 'camera':
        setRecordStatus(event.target.checked);
        break;
      case 'mcl':
        setMCLConfigValue(name, keys, event.target.checked);
        break;
      default:
        break;
    }
  };

  return (
    <Grid
      container
      spacing={1}
      alignItems="center"
      padding={0.5}
    >
      <Grid item xs={6}>
        <ItemTitle>
          {label || name.toUpperCase()}
        </ItemTitle>
      </Grid>
      <Grid item xs={6}>
        <Grid container alignItems="center">
          <Grid
            item
            xs={4}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <ItemValue>OFF</ItemValue>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Switch onChange={handleChange} checked={value} sx={{ m: 0 }} />
          </Grid>
          <Grid
            item
            xs={4}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <ItemValue>ON</ItemValue>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default SwitchState;
