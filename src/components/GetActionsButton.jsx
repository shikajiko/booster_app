import React, { useContext, useState, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { LoadingButton } from '@mui/lab';

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
  LeftGripper: 22,
  RightGripper: 23,
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
        const jsonActionsData = JSON.parse(response.json_data);

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
