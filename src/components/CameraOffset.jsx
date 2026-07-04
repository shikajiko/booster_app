import React, { useContext, useState, useEffect } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';

import NumberField from './NumberField';
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

const ItemTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  padding: theme.spacing(1),
  fontSize: '0.75rem',
}));

function CameraOffset() {
  const { setCameraOffset, cameraOffset } = useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();

  const [isLoading, setIsLoading] = useState(false);
  const [isServiceReady, setIsServiceReady] = useState(false);

  const getCameraOffsetService = new Service({
    ros,
    name: '/camera/get_camera_offset',
    serviceType: 'gyakuenki_interfaces/srv/GetCameraOffset',
  });

  const updateCameraOffsetService = new Service({
    ros,
    name: '/camera/update_camera_offset',
    serviceType: 'gyakuenki_interfaces/srv/UpdateCameraOffset',
  });

  const getCameraOffsetRequest = new ServiceRequest({});

  const handleFetch = (reload = false) => {
    if (!ros) return;
    setIsLoading(true);

    getCameraOffsetService.callService(
      getCameraOffsetRequest,
      (response) => {
        if (response) {
          const newCameraOffset = {
            x: response.position_x,
            y: response.position_y,
            z: response.position_z,
            roll: response.roll,
            pitch: response.pitch,
            yaw: response.yaw,
          };
          setCameraOffset(newCameraOffset);

          if (response.status && reload) {
            showLog('Successfully load camera offset', 'success');
          }
        }
      },
      (error) => {
        showLog('Error fetching camera offset:', error);
        showLog('Failed to fetch camera offset', 'error');
      }
    );
    setIsLoading(false);
  };

  const handlePublish = (save = false) => {
    setIsLoading(true);
    const request = new ServiceRequest({
      save,
      position_x: cameraOffset.x,
      position_y: cameraOffset.y,
      position_z: cameraOffset.z,
      roll: cameraOffset.roll,
      pitch: cameraOffset.pitch,
      yaw: cameraOffset.yaw,
    });
    updateCameraOffsetService.callService(
      request,
      (response) => {
        if (save) {
          if (response.status) {
            showLog('Successfully saved camera offset', 'success');
          } else {
            showLog('Failed to save camera offset', 'error');
          }
        }
      },
      (error) => {
        showLog('Error update camera offset:', error);
        showLog('Failed to update camera offset', 'error');
      }
    );
    setIsLoading(false);
  };

  const handleReload = () => {
    handleFetch(true);
  };

  useEffect(() => {
    if (getCameraOffsetService && updateCameraOffsetService) {
      setIsServiceReady(true);
    }
  }, [getCameraOffsetService, updateCameraOffsetService]);

  useEffect(() => {
    if (isServiceReady) {
      handleFetch();
    }
  }, [isServiceReady, ros]);

  useEffect(() => {
    if (isServiceReady) {
      handlePublish();
    }
  }, [cameraOffset]);

  return (
    <Item elevation={0} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* POSITION */}
        <Grid item xs={12}>
          <ItemTitle variant="subtitle2">Position</ItemTitle>
          {['x', 'y', 'z'].map((key) => (
            <NumberField
              key={key}
              name="position"
              keys={key}
              value={cameraOffset[key]}
              type="camera"
            />
          ))}
        </Grid>

        {/* ORIENTATION */}
        <Grid item xs={12}>
          <ItemTitle variant="subtitle2">Orientation</ItemTitle>
          {['roll', 'pitch', 'yaw'].map((key) => (
            <NumberField
              key={key}
              name="rotation"
              keys={key}
              value={cameraOffset[key]}
              type="camera"
            />
          ))}
        </Grid>
      </Grid>

      {/* BUTTONS */}
      <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
        <LoadingButton
          onClick={() => handlePublish(true)}
          color="primary"
          variant="contained"
          sx={{ m: 1 }}
          loading={isLoading}
        >
          Save
        </LoadingButton>
        <LoadingButton
          onClick={handleReload}
          color="warning"
          variant="contained"
          sx={{ m: 1 }}
          loading={isLoading}
        >
          Reload
        </LoadingButton>
      </Grid>
    </Item>
  );
}

export default CameraOffset;
