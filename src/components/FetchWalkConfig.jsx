import { useContext, useEffect, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';

import AppContext from '../context/AppContext';
import { useRos } from '../context/RosContext';
import LoggerContext from '../context/LoggerContext';

function FetchWalkConfig() {
  const { fetched, setFetched, setKinematic, setWalking } =
    useContext(AppContext);
  const { ros } = useRos();
  const { showLog } = useContext(LoggerContext);
  const getWalkConfigServiceRef = useRef(null);

  getWalkConfigServiceRef.current = new Service({
    ros,
    name: 'aruku/config/get_config',
    messageType: 'aruku_interfaces/srv/GetConfig',
  });

  const handleFetch = () => {
    if (!ros) return;

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

          setFetched(true);
        }
      },
      (error) => {
        showLog('Failed to fetch walk config', error);
      }
    );
  };

  useEffect(() => {
    if (ros && !fetched) {
      handleFetch();
    }
  }, [ros, fetched]);

  return null;
}

export default FetchWalkConfig;
