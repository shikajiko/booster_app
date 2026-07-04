import React, { useContext, useRef, useState } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { LoadingButton } from '@mui/lab';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

function SaveActionsButton() {
  const { actionsData } = useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const saveActionsServiceRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  saveActionsServiceRef.current = new Service({
    ros,
    name: 'akushon/config/save_actions',
    messageType: 'akushon_interfaces/srv/SaveActions',
  });

  const handleCall = () => {
    if (!ros) return;

    if (actionsData.length === 0) {
      showLog('Action data is empty!', 'error');
      return;
    }
    setIsLoading(true);
    const jsonActionsData = actionsData;
    const rawActions = {};
    Object.keys(jsonActionsData).forEach((key) => {
      const fixedPoses = [];
      const rawPoses = jsonActionsData[key].poses;
      for (let i = 0; i < rawPoses.length; i += 1) {
        const jointsData = {};
        for (let j = 0; j < rawPoses[i].joints.length; j += 1) {
          jointsData[rawPoses[i].joints[j].name] =
            rawPoses[i].joints[j].pose_pos;
        }
        fixedPoses.push({
          name: rawPoses[i].name,
          pause: parseFloat(rawPoses[i].pause),
          speed: parseFloat(rawPoses[i].speed),
          time: parseFloat(rawPoses[i].time),
          joints: jointsData,
        });
      }
      const action = {
        name: jsonActionsData[key].name,
        next: jsonActionsData[key].next,
        start_delay: jsonActionsData[key].start_delay,
        stop_delay: jsonActionsData[key].stop_delay,
        time_based: jsonActionsData[key].time_based,
        poses: fixedPoses,
      };
      rawActions[jsonActionsData[key].name.toLowerCase()] = action;
    });
    const json = JSON.stringify(rawActions);

    const saveActionsServiceRequest = new ServiceRequest({
      json,
    });

    saveActionsServiceRef.current.callService(
      saveActionsServiceRequest,
      (response) => {
        if (response.status) {
          showLog('Successfully saved actions data', 'success');
        } else {
          showLog('Failed to save data!', 'error');
        }
      },
      (error) => {
        showLog(`Failed to save data: ${error}`, 'error');
      }
    );

    setIsLoading(false);
  };

  return (
    <LoadingButton
      onClick={handleCall}
      style={{
        margin: 5,
        paddingLeft: 16,
        paddingRight: 16,
      }}
      color="success"
      variant="contained"
      loading={isLoading}
    >
      Save
    </LoadingButton>
  );
}

export default SaveActionsButton;
