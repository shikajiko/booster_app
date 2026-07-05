import React, { useContext, useState, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { LoadingButton } from '@mui/lab';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const jointIdList = {
  head_yaw: 0,
  head_pitch: 1,
  left_shoulder_pitch: 2,
  left_shoulder_roll: 3,
  left_shoulder_yaw: 4,
  left_elbow: 5,
  right_shoulder_pitch: 6,
  right_shoulder_roll: 7,
  right_shoulder_yaw: 8,
  right_elbow_pitch: 9,
  left_hip_pitch: 10,
  left_hip_roll: 11,
  left_hip_yaw: 12,
  left_knee: 13,
  left_ankle_up: 14,
  left_ankle_down: 15,
  right_hip_pitch: 16,
  right_hip_roll: 17,
  right_hip_yaw: 18,
  right_knee: 19,
  right_ankle_up: 20,
  right_ankle_down: 21
};

function GetActionsButton() {
  const { setActionsData } = useContext(AppContext);
  const { ros } = useRos();
  const { showLog } = useContext(LoggerContext);
  const getActionsDataServiceRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleCall = () => {
    if (!ros) return;

    setIsLoading(true);
    getActionsDataServiceRef.current = new Service({
      ros,
      name: '/action/get_actions',
      messageType: 'booster_action_interface/srv/GetActions',
    });

    const getActionsDataRequest = new ServiceRequest({});

    getActionsDataServiceRef.current.callService(
      getActionsDataRequest,
      (response) => {
        const jsonActionsData = JSON.parse(response.json);

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
      },
      (error) => {
        showLog(`Failed to get actions data: ${error}`, 'error');
      }
    );

    setIsLoading(false);
  };

  return (
    <LoadingButton
      style={{ paddingLeft: 24, paddingRight: 24, marginLeft: 8 }}
      onClick={handleCall}
      color="warning"
      variant="contained"
      loading={isLoading}
    >
      Get Actions
    </LoadingButton>
  );
}

export default GetActionsButton;
