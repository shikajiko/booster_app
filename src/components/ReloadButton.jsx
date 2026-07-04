import React, { useState, useContext, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { LoadingButton } from '@mui/lab';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

function ReloadButton() {
  const { setKinematic, setWalking } = useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const getWalkConfigServiceRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  getWalkConfigServiceRef.current = new Service({
    ros,
    name: 'aruku/config/get_config',
    messageType: 'aruku_interfaces/srv/GetConfig',
  });

  const handleReload = () => {
    if (!ros) return;
    setIsLoading(true);

    const getWalkConfigServiceRequest = new ServiceRequest({});

    getWalkConfigServiceRef.current.callService(
      getWalkConfigServiceRequest,
      (response) => {
        if (response) {
          const newKinematic = JSON.parse(response.json_kinematic);
          const newWalking = JSON.parse(response.json_walking);

          setKinematic((prevKinematic) => {
            const updatedKinematic = {};

            Object.keys(prevKinematic).forEach((name) => {
              updatedKinematic[name] = {
                ...prevKinematic[name],
                ...newKinematic[name],
              };
            });

            return updatedKinematic;
          });

          setWalking((prevWalking) => {
            const updatedWalking = {};

            Object.keys(prevWalking).forEach((name) => {
              updatedWalking[name] = {
                ...prevWalking[name],
                ...newWalking[name],
              };
            });

            return updatedWalking;
          });

          showLog('Successfully loaded data', 'success');
        }
      },
      (error) => {
        showLog('Failed to load data:', error);
        showLog('Failed to load data', 'error');
      }
    );

    setIsLoading(false);
  };

  return (
    <LoadingButton
      onClick={handleReload}
      color="warning"
      variant="contained"
      sx={{ margin: 1, top: 5 }}
      loading={isLoading}
    >
      Reload
    </LoadingButton>
  );
}

export default ReloadButton;
