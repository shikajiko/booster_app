import React, { useContext, useState, useRef } from 'react';
import { Topic, Message } from 'roslib';

import { LoadingButton } from '@mui/lab';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

function SetInitButton() {
  const { actionsData } = useContext(AppContext);
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

    if (actionsData.length === 0) {
      showLog('Action data is empty!', 'error');
      return;
    }

    setIsLoading(true);

    const rawAction = {};
    const jsonActionsData = actionsData;
    const fixedPoses = [];
    Object.keys(jsonActionsData).forEach((key) => {
      if (jsonActionsData[key].name !== 'init') {
        return;
      }

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

      rawAction.name = jsonActionsData[key].name;
      rawAction.next = jsonActionsData[key].next;
      rawAction.start_delay = jsonActionsData[key].start_delay;
      rawAction.stop_delay = jsonActionsData[key].stop_delay;
      rawAction.time_based = jsonActionsData[key].time_based;
      rawAction.poses = fixedPoses;
    });

    if (Object.keys(rawAction).length === 0) {
      showLog('Action not found!', 'error');
      setIsLoading(false);
      return;
    }

    const json = JSON.stringify(rawAction);

    const runActionMessage = new Message({
      control_type: 1,
      action_name: 'init',
      json,
    });

    runActionTopicRef.current.publish(runActionMessage);

    setIsLoading(false);
  };

  return (
    <LoadingButton
      style={{ margin: 0 }}
      onClick={handlePublish}
      color="secondary"
      variant="contained"
      loading={isLoading}
    >
      SET INIT
    </LoadingButton>
  );
}

export default SetInitButton;
