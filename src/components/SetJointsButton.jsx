import React, { useContext, useState, useRef } from 'react';
import { Topic, Message } from 'roslib';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LoadingButton from '@mui/lab/LoadingButton';
import PropTypes from 'prop-types';

import AppContext from '../context/AppContext';
import { useRos } from '../context/RosContext';

function SetJointsButton(props) {
  const { setJointRobotData, jointPoseData } = useContext(AppContext);
  const { typeButton } = props;
  const { ros } = useRos();
  const setJointsTopicRef = useRef(null);
  const runActionTopicRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  setJointsTopicRef.current = new Topic({
    ros,
    name: 'joint/set_joints',
    messageType: 'tachimawari_interfaces/msg/SetJoints',
  });

  runActionTopicRef.current = new Topic({
    ros,
    name: 'action/run_action',
    messageType: 'akushon_interfaces/msg/RunAction',
  });

  const handlePublish = () => {
    if (!ros) return;

    setIsLoading(true);
    // const joints = [];

    if (typeButton === 'to_robot') {
      const newJointRobotData = [];
      for (let i = 0; i < jointPoseData.length; i += 1) {
        newJointRobotData.push({
          id: jointPoseData[i].id,
          name: jointPoseData[i].name,
          pose_pos: jointPoseData[i].pose_pos,
          status: 'ON',
        });
      }
      setJointRobotData(newJointRobotData);
    }

    // play step with time (mock motion)
    const joints = jointPoseData.reduce((acc, joint) => {
      acc[joint.name] = joint.pose_pos;
      return acc;
    }, {});

    const fixedPose = {
      name: 'step',
      pause: 0.0,
      speed: 0.0,
      time: 1.0,
      joints,
    };

    const rawAction = {
      name: 'run_step',
      next: '',
      start_delay: 0.0,
      stop_delay: 0.0,
      time_based: true,
      poses: [fixedPose],
    };

    const json = JSON.stringify(rawAction);

    const runActionMessage = new Message({
      control_type: 1,
      action_name: 'run_step',
      json,
    });

    runActionTopicRef.current.publish(runActionMessage);

    setIsLoading(false);
  };

  return (
    <LoadingButton
      sx={{ mx: 0.5 }}
      onClick={handlePublish}
      variant="contained"
      loading={isLoading}
    >
      {typeButton === 'to_robot' ? <ArrowForwardIcon /> : <PlayArrowIcon />}
    </LoadingButton>
  );
}

SetJointsButton.propTypes = {
  typeButton: PropTypes.string.isRequired,
};

export default SetJointsButton;
