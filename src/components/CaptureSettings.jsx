import React, { useContext, useState, useEffect, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { Grid, TextField, Typography, Paper, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

function CameraSettingsField({
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
            handleDisplay(keys, newValue);
            handleInput(keys, newValue);
          }}
          onChangeCommitted={handlePublish}
          min={min}
          max={max}
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
              handleDisplay(keys, 0.0);
              handleInput(keys, 0.0);
            } else {
              handleDisplay(keys, parseFloat(event.target.value));
              handleInput(keys, parseFloat(event.target.value));
            }
          }}
        />
      </Grid>
    </Grid>
  );
}

function CaptureSettings() {
  const { setCameraConfig, setCameraConfigValue, cameraConfig } =
    useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const getCaptureSettingServiceRef = useRef(null);
  const updateCaptureSettingServiceRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  getCaptureSettingServiceRef.current = new Service({
    ros,
    name: 'shisen_cpp/config/get_capture_setting',
    messageType: 'shisen_cpp/srv/GetCaptureSetting',
  });

  updateCaptureSettingServiceRef.current = new Service({
    ros,
    name: 'shisen_cpp/config/update_capture_setting',
    messageType: 'shisen_cpp/srv/UpdateCaptureSetting',
  });

  const minMaxValue = {
    brightness: { min: 0, max: 255 },
    contrast: { min: 0, max: 255 },
    saturation: { min: 0, max: 255 },
    temperature: { min: 2800, max: 6500 },
    exposure: { min: 0, max: 1500 },
    gain: { min: 0, max: 255 },
  };

  const [cameraConfigDisplay, setCameraConfigDisplay] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    exposure: 0,
    gain: 0,
  });

  const handleFetch = () => {
    if (!ros) return;
    setIsLoading(true);

    const getCaptureSettingRequest = new ServiceRequest({});
    getCaptureSettingServiceRef.current.callService(
      getCaptureSettingRequest,
      (response) => {
        if (response) {
          setCameraConfig({
            brightness: response.brightness,
            contrast: response.contrast,
            saturation: response.saturation,
            temperature: response.temperature,
            exposure: response.exposure,
            gain: response.gain,
          });
        }
      },
      (error) => {
        showLog('Failed to fetch capture setting', error);
        showLog('Failed to fetch capture setting', 'error');
      }
    );

    setIsLoading(false);
  };

  const handleSave = () => {
    if (!ros) return;
    setIsLoading(true);

    const saveCaptureSettingRequest = new ServiceRequest({
      save: true,
      brightness: cameraConfig.brightness,
      contrast: cameraConfig.contrast,
      saturation: cameraConfig.saturation,
      temperature: cameraConfig.temperature,
      exposure: cameraConfig.exposure,
      gain: cameraConfig.gain,
    });

    updateCaptureSettingServiceRef.current.callService(
      saveCaptureSettingRequest,
      (response) => {
        if (response.success) {
          showLog('Successfully saved capture setting', 'success');
        } else {
          showLog('Failed to save capture setting', 'error');
        }
      },
      (error) => {
        showLog('Failed to save capture setting', error);
        showLog('Failed to save capture setting', 'error');
      }
    );

    setIsLoading(false);
  };

  const handleReload = () => {
    handleFetch();
  };

  useEffect(() => {
    handleFetch();
  }, [ros]);

  const handlePublish = () => {
    if (
      cameraConfig.brightness < minMaxValue.brightness.min ||
      cameraConfig.brightness > minMaxValue.brightness.max ||
      cameraConfig.contrast < minMaxValue.contrast.min ||
      cameraConfig.contrast > minMaxValue.contrast.max ||
      cameraConfig.saturation < minMaxValue.saturation.min ||
      cameraConfig.saturation > minMaxValue.saturation.max ||
      cameraConfig.temperature < minMaxValue.temperature.min ||
      cameraConfig.temperature > minMaxValue.temperature.max ||
      cameraConfig.exposure < minMaxValue.exposure.min ||
      cameraConfig.exposure > minMaxValue.exposure.max ||
      cameraConfig.gain < minMaxValue.gain.min ||
      cameraConfig.gain > minMaxValue.gain.max
    ) {
      return;
    }

    const setCaptureSettingRequest = new ServiceRequest({
      save: false,
      brightness: cameraConfig.brightness,
      contrast: cameraConfig.contrast,
      saturation: cameraConfig.saturation,
      temperature: cameraConfig.temperature,
      exposure: cameraConfig.exposure,
      gain: cameraConfig.gain,
    });

    updateCaptureSettingServiceRef.current.callService(
      setCaptureSettingRequest,
      (response) => {
        if (!response.success) {
          showLog('Failed to set capture setting', 'error');
        }
      },
      (error) => {
        showLog('Service call failed', error);
      }
    );
  };

  const changePublishedValue = () => {
    setCameraConfig(cameraConfigDisplay);
  };

  const changeDisplayededValue = (key, val) => {
    setCameraConfigDisplay((prevState) => ({ ...prevState, [key]: val }));
  };

  const changeInputValue = (key, val) => {
    setCameraConfigValue(key, val);
  };

  useEffect(() => {
    handlePublish();
    setCameraConfigDisplay(cameraConfig);
  }, [cameraConfig]);

  return (
    <Item>
      <Grid container direction="row">
        {Object.keys(cameraConfig).map((key) => (
          <CameraSettingsField
            keys={key}
            key={key}
            value={cameraConfigDisplay[key]}
            min={minMaxValue[key].min}
            max={minMaxValue[key].max}
            handleDisplay={changeDisplayededValue}
            handlePublish={changePublishedValue}
            handleInput={changeInputValue}
          />
        ))}
        <Grid container sx={{ justifyContent: 'end', mb: 2 }}>
          <LoadingButton
            onClick={handleSave}
            color="primary"
            variant="contained"
            sx={{ margin: 1, top: 5 }}
            loading={isLoading}
          >
            Save
          </LoadingButton>
          <LoadingButton
            onClick={handleReload}
            color="warning"
            variant="contained"
            sx={{ margin: 1, top: 5 }}
            loading={isLoading}
          >
            Reload
          </LoadingButton>
        </Grid>
      </Grid>
    </Item>
  );
}

export default CaptureSettings;
