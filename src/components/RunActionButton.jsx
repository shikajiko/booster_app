import React, { useContext, useState, useRef } from 'react';
import { Topic, Message } from 'roslib';

import { LoadingButton } from '@mui/lab';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

function RunActionButton() {
  const { currentAction, actionsData } = useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const runActionTopicRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  runActionTopicRef.current = new Topic({
    ros,
    name: 'action/run_action',
    messageType: 'akushon_interfaces/msg/RunAction',
  });

  const handlePublish = () => {
    if (!ros) return;

    if (Object.keys(currentAction).length === 0) {
      showLog('No action selected.', 'warning');
      return;
    }

    setIsLoading(true);
    const fixedPoses = [];
    const rawPoses = [];

    let currentActionTemp = currentAction;
    while (currentActionTemp.next !== '') {
      rawPoses.push(currentActionTemp.poses);
      let i;
      for (i = 0; i < actionsData.length; i += 1) {
        if (actionsData[i].name === currentActionTemp.next) {
          currentActionTemp = actionsData[i];
          break;
        }
      }

      if (i === actionsData.length) {
        showLog(`Next action [${currentActionTemp.next}] not found!`, 'error');
        setIsLoading(false);
        return;
      }
    }

    rawPoses.push(currentActionTemp.poses);

    for (let i = 0; i < rawPoses.length; i += 1) {
      const rawPose = rawPoses[i];
      for (let j = 0; j < rawPose.length; j += 1) {
        const jointsData = {};
        for (let k = 0; k < rawPose[j].joints.length; k += 1) {
          jointsData[rawPose[j].joints[k].name] = rawPose[j].joints[k].pose_pos;
        }
        fixedPoses.push({
          name: rawPose[j].name,
          pause: rawPose[j].pause,
          speed: rawPose[j].speed,
          time: rawPose[j].time,
          joints: jointsData,
        });
      }
    }

    const rawAction = {
      name: currentAction.name,
      next: currentAction.next,
      start_delay: currentAction.start_delay,
      stop_delay: currentAction.stop_delay,
      time_based: currentAction.time_based,
      poses: fixedPoses,
    };

    const json = JSON.stringify(rawAction);

    const runActionMessage = new Message({
      control_type: 1,
      action_name: currentAction.name,
      json,
    });

    runActionTopicRef.current.publish(runActionMessage);

    setIsLoading(false);
  };

  return (
    <LoadingButton
      onClick={handlePublish}
      color="primary"
      variant="contained"
      loading={isLoading}
    >
      Play Action
    </LoadingButton>
  );
}

export default RunActionButton;
