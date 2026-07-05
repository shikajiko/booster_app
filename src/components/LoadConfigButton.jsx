import React, { useState, useRef, useContext } from 'react';
import { Service, ServiceRequest } from 'roslib';

import LoadingButton from '@mui/lab/LoadingButton';

import AppContext from '../context/AppContext';

import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const jointIdList = {
  HeadYaw: 0,
  HeadPitch: 1,
  LeftShoulderPitch: 2,
  LeftShoulderRoll: 3,
  LeftShoulderYaw: 4,
  LeftElbow: 5,
  RightShoulderPitch: 6,
  RightShoulderRoll: 7,
  RightShoulderYaw: 8,
  RightElbowPitch: 9,
  LeftHipPitch: 10,
  LeftHipRoll: 11,
  LeftHipYaw: 12,
  LeftKnee: 13,
  LeftAnkleUp: 14,
  LeftAnkleDown: 15,
  RightHipPitch: 16,
  RightHipRoll: 17,
  RightHipYaw: 18,
  RightKnee: 19,
  RightAnkleUp: 20,
  RightAnkleDown: 21,
};

function LoadConfigButton() {
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const [isLoading, setIsLoading] = useState(false);

  const loadConfigServiceRef = useRef({});
  const services = {
    akushon: {
      name: 'akushon/config/get_actions',
      messageType: 'akushon_interfaces/srv/GetActions',
    },
    aruku: {
      name: 'aruku/config/get_config',
      messageType: 'aruku_interfaces/srv/GetConfig',
    },
    ninshiki: {
      name: 'ninshiki_cpp/config/get_color_setting',
      messageType: 'ninshiki_interfaces/srv/GetColorSettings',
    },
    shisen: {
      name: 'shisen_cpp/config/get_capture_setting',
      messageType: 'shisen_interfaces/srv/GetCaptureSettings',
    },
  };

  Object.entries(services).forEach(([key, { name, messageType }]) => {
    loadConfigServiceRef.current[key] = new Service({
      ros,
      name,
      messageType,
    });
  });

  const emptyRequest = new ServiceRequest({});

  // Load config values into AppContext
  const { setCameraConfig } = useContext(AppContext);
  const { setColorCalibration } = useContext(AppContext);
  const { setKinematic, setWalking } = useContext(AppContext);
  const { setActionsData } = useContext(AppContext);
  // const { setCameraOffset } = useContext(AppContext);

  const handleLoadConfig = async () => {
    if (!ros) return;
    setIsLoading(true);

    const failedServiceCall = [];
    const configData = {};

    const callLoadConfigService = Object.keys(services).map(
      (key) =>
        new Promise((resolve) => {
          loadConfigServiceRef.current[key].callService(
            emptyRequest,
            (response) => {
              if (!response) {
                failedServiceCall.push(key);
              }
              configData[key] = response;
              resolve();
            },
            (error) => {
              failedServiceCall.push(key);
              showLog(`Failed to load config from ${key}`, error);
              resolve();
            }
          );
        })
    );

    await Promise.all(callLoadConfigService).then(() => {
      // Update AppContext with the loaded config data
      if (configData.shisen) {
        setCameraConfig(configData.shisen);
      }

      if (configData.ninshiki) {
        setColorCalibration(JSON.parse(configData.ninshiki.json_color));
      }

      if (configData.akushon) {
        const jsonActionsData = JSON.parse(configData.akushon.json);
        let idCounter = -1;
        const rawActions = [];
        Object.keys(jsonActionsData).forEach((key) => {
          idCounter += 1;
          const fixedPoses = [];
          const rawPoses = jsonActionsData[key].poses;
          for (let i = 0; i < rawPoses.length; i += 1) {
            const jointsData = [];
            Object.keys(jointIdList).forEach((index) => {
              const jointId = jointIdList[index];
              jointsData.push({
                id: jointId,
                name: index,
                pose_pos: rawPoses[i].joints[index],
              });
            });
            fixedPoses.push({
              id: i,
              name: rawPoses[i].name,
              speed: rawPoses[i].speed,
              pause: rawPoses[i].pause,
              time: rawPoses[i].time,
              joints: jointsData,
            });
          }
          rawActions.push({
            id: idCounter,
            name: jsonActionsData[key].name,
            start_delay: jsonActionsData[key].start_delay,
            stop_delay: jsonActionsData[key].stop_delay,
            time_based: jsonActionsData[key].time_based,
            next: jsonActionsData[key].next,
            poses: fixedPoses,
          });
        });
        setActionsData(rawActions);
      }

      if (configData.aruku) {
        const newKinematic = JSON.parse(configData.aruku.json_kinematic);
        const newWalking = JSON.parse(configData.aruku.json_walking);

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
      }
    });

    if (failedServiceCall.length === 0) {
      showLog('Successfully loaded all config', 'success');
    } else {
      showLog(
        `Failed to load config from: ${failedServiceCall.join(', ')}`,
        'error'
      );
    }

    setIsLoading(false);
    console.log('Finished loading config');
  };

  return (
    <LoadingButton
      onClick={handleLoadConfig}
      color="success"
      variant="contained"
      sx={{ margin: 1 }}
      loading={isLoading}
    >
      Load Configs
    </LoadingButton>
  );
}

export default LoadConfigButton;
