import React, { useContext } from 'react';
import Decimal from 'decimal.js';

import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import AppContext from '../context/AppContext';
import InfoTooltip from './InfoTooltip';

const ItemTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  padding: theme.spacing(1),
  fontSize: '0.75rem',
}));

function safeNumber(decimal) {
  return decimal.toDecimalPlaces(3).toNumber();
}

function NumberField(props) {
  const { name, keys, value, type } = props;
  const {
    setMainValue,
    setWalkingValue,
    setKinematicValue,
    setCameraOffsetValue,
    setMCLConfigValue,
  } = useContext(AppContext);

  function setValue(val) {
    let value_change;

    if (type === 'main') {
      value_change = val * 10;
      setMainValue(
        keys,
        safeNumber(new Decimal(value).add(value_change))
      );

    } else if (type === 'walking') {
      switch (name) {
        case 'balance':
          value_change = val / 10;
          break;
        case 'pid':
          value_change = val;
          break;
        default:
          value_change = val;
          break;
      }

      setWalkingValue(
        name,
        keys,
        safeNumber(new Decimal(value).add(value_change))
      );

    } else if (type === 'camera') {
      switch (name) {
        case 'position':
          value_change = val / 10;
          break;
        default:
          value_change = val;
          break;
      }

      setCameraOffsetValue(
        keys,
        safeNumber(new Decimal(value).add(value_change))
      );
    } else if (type === 'mcl') {
      if (keys.includes('distance') || keys.includes('particle')) {
        value_change = val * 100;
      } else if (keys.includes('ratio') || keys.includes('sigma') || keys.includes('threshold')) {
        value_change = val / 10;
      } else {
        value_change = val;
      }

      setMCLConfigValue(
        name,
        keys,
        safeNumber(new Decimal(value).add(value_change))
      );
    } else {
      switch (name) {
        case 'offset':
          switch (keys) {
            case 'x_offset':
            case 'y_offset':
            case 'z_offset':
              value_change = val * 10;
              break;
            default:
              value_change = val;
              break;
          }
          break;

        case 'ratio':
          switch (keys) {
            case 'foot_height':
            case 'period_time':
              value_change = val * 10;
              break;
            default:
              value_change = val / 10;
              break;
          }
          break;

        default:
          value_change = val;
          break;
      }

      setKinematicValue(
        name,
        keys,
        safeNumber(new Decimal(value).add(value_change))
      );
    }
  }

  function changeValue(val) {
    const safeVal = safeNumber(new Decimal(val));

    if (type === 'main') {
      setMainValue(keys, safeVal);
    } else if (type === 'walking') {
      setWalkingValue(name, keys, safeVal);
    } else if (type === 'camera') {
      setCameraOffsetValue(keys, safeVal);
    } else if (type === 'mcl') {
      setMCLConfigValue(name, keys, safeVal);
    } else {
      setKinematicValue(name, keys, safeVal);
    }
  }

  return (
    <Grid container spacing={1} justifyContent="center" alignItems="center" padding={0.5}>
      <Grid item xs={6}>
        <ItemTitle style={{ display: 'flex', alignItems: 'center' }}>
          {keys.toUpperCase()}
          <InfoTooltip paramName={keys} />
        </ItemTitle>
      </Grid>

      <Grid item xs={1}>
        <IconButton onClick={() => setValue(-1)}>
          <KeyboardDoubleArrowLeftIcon />
        </IconButton>
      </Grid>

      <Grid item xs={1}>
        <IconButton onClick={() => setValue(-0.1)}>
          <KeyboardArrowLeft />
        </IconButton>
      </Grid>

      <Grid item xs={2}>
        <TextField
          value={value}
          margin="dense"
          type="number"
          InputProps={{
            inputProps: {
              style: { textAlign: 'center' },
            },
          }}
          onChangeCapture={(event) => {
            if (event.target.value === '') {
              changeValue(0.0);
            } else {
              changeValue(event.target.value);
            }
          }}
        />
      </Grid>

      <Grid item xs={1}>
        <IconButton onClick={() => setValue(0.1)}>
          <KeyboardArrowRight />
        </IconButton>
      </Grid>

      <Grid item xs={1}>
        <IconButton onClick={() => setValue(1)}>
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default NumberField;