import React, { useContext, useState, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';
import { LoadingButton } from '@mui/lab';
import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const RobotModeValue = {
  PREP: 1,
  WALK: 2,
  CUSTOM: 3,
};

const BtnColor = {
    PREP: 'success',
    WALK: 'warning',
    CUSTOM: 'error'
}

function ChangeModeButton({ type, sx }) {
  const { ros } = useRos();
  const { showLog } = useContext(LoggerContext);
  const changeRobotModeServiceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCall = () => {
    if (!ros) return;
    setIsLoading(true);

    changeRobotModeServiceRef.current = new Service({
      ros,
      name: 'client/set_mode',
      messageType: 'booster_client_interface/srv/SetMode',
    });

    const payload = RobotModeValue[type];

    if (payload === undefined) {
      showLog(`Unknown robot mode type: ${type}`, 'error');
      setIsLoading(false);
      return;
    }

    const request = new ServiceRequest({ mode: payload });

    changeRobotModeServiceRef.current.callService(
      request,
      (response) => {
        if (response?.success) {
          showLog(`Successfully set mode to ${type}`, 'success');
        } else {
          showLog(`Failed to set mode to ${type}`, 'error');
        }
        setIsLoading(false);
      },
      (error) => {
        showLog(`Error setting mode to ${type}`, error);
        setIsLoading(false);
      }
    );
  };

  return (
    <LoadingButton
      onClick={handleCall}
      color="primary"
      variant="contained"
      loading={isLoading}
      sx={{ margin: 0.5, ...sx }}
    >
      {type}
    </LoadingButton>
  );
}

export default ChangeModeButton;