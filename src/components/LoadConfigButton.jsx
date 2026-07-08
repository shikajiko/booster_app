import React, { useState, useRef, useContext } from 'react';
import { Service, ServiceRequest, Topic } from 'roslib';
import LoadingButton from '@mui/lab/LoadingButton';

import AppContext from '../context/AppContext';

import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const jointIdList = {
  HeadYaw: 0,
  HeadPitch: 1,
  LeftShoulderPitch: 2,
  LeftShoulderRoll: 3,
  LeftElbowPitch: 4,
  LeftElbowYaw: 5,
  RightShoulderPitch: 6,
  RightShoulderRoll: 7,
  RightElbowPitch: 8,
  RightElbowYaw: 9,
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
  LeftGripper: 22,
  RightGripper: 23,
};

function LoadConfigButton() {
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const [isLoading, setIsLoading] = useState(false);

  const loadConfigServiceRef = useRef({});

  const services = {
    action: {
      name: '/action/get_actions',
      messageType: 'booster_action_interface/srv/GetActions',
    }
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
  const { setActionsData} = useContext(AppContext);
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
      if (configData.action) {
        const jsonActionsData = JSON.parse(configData.action.json);
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
              duration: rawPoses[i].duration,
              delay_before: rawPoses[i].delay_before,
              joints: jointsData,
            });
          }
          rawActions.push({
            id: idCounter,
            name: jsonActionsData[key].name,
            control_type: jsonActionsData[key].control_type,
            next: jsonActionsData[key].next,
            poses: fixedPoses,
          });
        });
        setActionsData(rawActions);
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
