import React, { useContext, useState, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { LoadingButton } from '@mui/lab';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const jointIdList = {
  right_shoulder_pitch: 1,
  left_shoulder_pitch: 2,
  right_shoulder_roll: 3,
  left_shoulder_roll: 4,
  right_elbow: 5,
  left_elbow: 6,
  right_hip_yaw: 7,
  left_hip_yaw: 8,
  right_hip_roll: 9,
  left_hip_roll: 10,
  right_hip_pitch: 11,
  left_hip_pitch: 12,
  right_knee: 13,
  left_knee: 14,
  right_ankle_pitch: 15,
  left_ankle_pitch: 16,
  right_ankle_roll: 17,
  left_ankle_roll: 18,
  neck_yaw: 19,
  neck_pitch: 20,
  right_gripper: 21,
  left_gripper: 22,
  right_shoulder_yaw: 23,
  left_shoulder_yaw: 24,
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
      name: 'akushon/config/get_actions',
      messageType: 'akushon_interfaces/srv/GetActions',
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
