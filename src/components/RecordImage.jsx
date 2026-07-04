import React, { useContext, useEffect, useRef, useState } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { Grid, TextField, Typography, Paper, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';

import SwitchActive from './SwitchActive';
import AppContext from '../context/AppContext';
import { useRos } from '../context/RosContext';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

function RecordIntervalField({
  keys,
  value,
  min,
  max,
  handleDisplay,
  handlePublish,
  handleInput,
}) {
  return (
    <Grid
      container
      spacing={1}
      justifyContent="center"
      alignItems="center"
      py={1.5}
    >
      <Grid item xs={4.5}>
        <Typography>{`${keys.toUpperCase()}: (${min} - ${max})`}</Typography>
      </Grid>
      <Grid item xs={4.5} mx={1}>
        <Slider
          value={typeof value === 'number' ? value : 0}
          onChange={(event, newValue) => {
            handleDisplay(newValue);
            handleInput(newValue);
          }}
          onChangeCommitted={handlePublish}
          min={min}
          max={max}
          step={50}
          valueLabelDisplay="auto"
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          error={value < min || value > max}
          value={value}
          type="number"
          helperText={value < min || value > max ? 'Out of range' : ''}
          InputProps={{
            inputProps: {
              style: { textAlign: 'center' },
            },
          }}
          size="small"
          onChange={(event) => {
            if (event.target.value === '') {
              handleDisplay(0.0);
              handleInput(0.0);
            } else {
              handleDisplay(parseFloat(event.target.value));
              handleInput(parseFloat(event.target.value));
            }
          }}
        />
      </Grid>
    </Grid>
  );
}

function RecordImage() {
  const { recordStatus } = useContext(AppContext);
  const { ros } = useRos();
  const recordImageServiceRef = useRef(null);

  const sleep = (time) =>
    new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  const intervalRef = useRef(null);

  const minMaxValue = {
    min: 50,
    max: 1000,
  };

  const [recordInterval, setRecordInterval] = useState(100);
  const [recordIntervalDisplay, setRecordIntervalDisplay] = useState(100);

  // TODO: Create record image service in shisen
  recordImageServiceRef.current = new Service({
    ros,
    name: 'camera/record_image',
    messageType: 'std_srvs/srv/Trigger',
  });

  const emptyRequest = new ServiceRequest({});

  const recordImage = () => {
    if (recordStatus) {
      recordImageServiceRef.current.callService(
        emptyRequest,
        (response) => {
          if (!response.success) {
            console.error('Failed to record image');
          }
        },
        (error) => {
          console.error('Failed to record image', error);
        }
      );
    }
  };

  const changePublishedValue = () => {
    setRecordInterval(recordIntervalDisplay);
  };

  const changeDisplayedValue = (val) => {
    setRecordIntervalDisplay(val);
  };

  const changeInputValue = (val) => {
    setRecordInterval(val);
  };

  useEffect(() => {
    const fetchRecord = async () => {
      recordImage();
      await sleep(recordInterval);
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (recordStatus) {
      intervalRef.current = setInterval(fetchRecord, recordInterval);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [recordStatus, recordInterval]);

  return (
    <Item>
      <SwitchActive name="record" value={recordStatus} type="camera" />
      <RecordIntervalField
        keys="interval"
        value={recordIntervalDisplay}
        min={minMaxValue.min}
        max={minMaxValue.max}
        handleDisplay={changeDisplayedValue}
        handlePublish={changePublishedValue}
        handleInput={changeInputValue}
      />
    </Item>
  );
}

export default RecordImage;
