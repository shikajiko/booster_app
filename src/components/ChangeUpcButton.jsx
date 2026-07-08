import React, { useContext, useState, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';
import { LoadingButton } from '@mui/lab';
import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const UpcValue = {
  ON: true,
  OFF: false,
};

const BtnColor = {
    ON: 'success',
    OFF: 'error',
}

function ChangeUpcButton({ status }) {
  const { ros } = useRos();
  const { showLog } = useContext(LoggerContext);
  const changeUpcStateRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCall = () => {
    if (!ros) return;
    setIsLoading(true);

    changeUpcStateRef.current = new Service({
      ros,
      name: 'client/set_upper_control',
      messageType: 'booster_client_interface/srv/SetUpperControl',
    });

    const payload = UpcValue[status];

    if (payload === undefined) {
      showLog(`Unknown upc status: ${status}`, 'error');
      setIsLoading(false);
      return;
    }

    const request = new ServiceRequest({ enable: payload });

    changeUpcStateRef.current.callService(
      request,
      (response) => {
        if (response?.success) {
          showLog(`Successfully set mode to ${status}`, 'success');
        } else {
          showLog(`Failed to set mode to ${status}`, 'error');
        }
        setIsLoading(false);
      },
      (error) => {
        showLog(`Error setting mode to ${status}`, error);
        setIsLoading(false);
      }
    );
  };

  return (
    <LoadingButton
      onClick={handleCall}
      color={BtnColor[status]}
      variant="contained"
      loading={isLoading}
      sx={{ margin: 1 }}
    >
      {status}
    </LoadingButton>
  );
}

export default ChangeModeButton;