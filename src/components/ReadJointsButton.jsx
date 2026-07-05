import React, { useState, useContext, useEffect, useRef } from 'react';
import { Topic } from 'roslib';

import { LoadingButton } from '@mui/lab';

import LoggerContext from '../context/LoggerContext';
import AppContext from '../context/AppContext';
import { useRos } from '../context/RosContext';

const jointIdList = {
  0: "HeadYaw",
  1: "HeadPitch",
  2: "LeftShoulderPitch",
  3: "LeftShoulderRoll",
  4: "LeftShoulderYaw",
  5: "LeftElbow",
  6: "RightShoulderPitch",
  7: "RightShoulderRoll",
  8: "RightShoulderYaw",
  9: "RightElbowPitch",
  10: "LeftHipPitch",
  11: "LeftHipRoll",
  12: "LeftHipYaw",
  13: "LeftKnee",
  14: "LeftAnkleUp",
  15: "LeftAnkleDown",
  16: "RightHipPitch",
  17: "RightHipRoll",
  18: "RightHipYaw",
  19: "RightKnee",
  20: "RightAnkleUp",
  21: "RightAnkleDown",
};

const gripperId = {
  22: "left_gripper",
  23: "right_gripper",
}

function ReadJointsButton() {
  const { setJointRobotData } = useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const readJointsTopicRef = useRef(null);

  const [currentJoints, setCurrentJoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const unsubscribe = () => {
    readJointsTopicRef.current.unsubscribe();
    readJointsTopicRef.current.removeAllListeners();
    setIsSubscribed(false);
  };

  useEffect(() => {
    if (ros) {
      readJointsTopicRef.current = new Topic({
        ros,
        name: '/joint/current_joints',
        messageType: 'booster_joint_interface/msg/SetJoints',
      });
    }

    return () => {
      if (readJointsTopicRef.current) {
        readJointsTopicRef.current.unsubscribe();
      }
    };
  }, [ros]);

  const handleCall = () => {
    if (!ros || !readJointsTopicRef.current || isSubscribed) return;
    
    setIsLoading(true);

    readJointsTopicRef.current.subscribe(
      (message) => {
        setCurrentJoints(message.joints);
        unsubscribe();
      },
      (error) => {
        showLog('Error reading joints', 'error');
        showLog('Error reading joints:', error);
        unsubscribe();
      }
    );

    setIsSubscribed(true);
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentJoints.length === 0) {
      showLog('No joints data!', 'error');
      return;
    }

    const newJointRobotData = [];
    for (let i = 0; i < currentJoints.length; i += 1) {
      console.log("length: " + currentJoints.length);
      newJointRobotData.push({
        id: parseInt(currentJoints[i].id, 10),
        name: jointIdList[i],
        pose_pos: parseFloat(currentJoints[i].position),
        status: true,
      });
    }

    const sortedJointRobotData = newJointRobotData
      .slice()
      .sort((a, b) => a.id - b.id);

    setJointRobotData(sortedJointRobotData);
  }, [currentJoints]);

  return (
    <LoadingButton
      onClick={handleCall}
      color="warning"
      variant="contained"
      loading={isLoading}
    >
      Read Joints
    </LoadingButton>
  );
}

export default ReadJointsButton;
