import React, { useState, useContext, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { LoadingButton } from '@mui/lab';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

function SaveButton() {
  const { kinematic, walking } = useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const saveConfigServiceRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  saveConfigServiceRef.current = new Service({
    ros,
    name: 'aruku/config/save_config',
    messageType: 'aruku_interfaces/srv/SaveConfig',
  });

  const handleSave = () => {
    if (!ros) return;
    setIsLoading(true);

    const saveConfigServiceRequest = new ServiceRequest({
      json_kinematic: JSON.stringify(kinematic),
      json_walking: JSON.stringify(walking),
    });

    saveConfigServiceRef.current.callService(
      saveConfigServiceRequest,
      (response) => {
        if (response.status) {
          showLog('Successfully saved data', 'success');
        }
      },
      (error) => {
        showLog('Failed to save data:', error);
        showLog('Failed to save data', 'error');
      }
    );

    setIsLoading(false);
  };

  return (
    <LoadingButton
      onClick={handleSave}
      color="primary"
      variant="contained"
      sx={{ margin: 1, top: 5 }}
      loading={isLoading}
    >
      Save
    </LoadingButton>
  );
}

export default SaveButton;
