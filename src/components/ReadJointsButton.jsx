import React, { useState, useContext, useEffect, useRef } from 'react';
import { Topic } from 'roslib';

import { LoadingButton } from '@mui/lab';

import LoggerContext from '../context/LoggerContext';
import AppContext from '../context/AppContext';
import { useRos } from '../context/RosContext';

const jointIdList = {
  0: "head_yaw",
  1: "head_pitch",
  2: "left_shoulder_pitch",
  3: "left_shoulder_roll",
  4: "left_shoulder_yaw",
  5: "left_elbow",
  6: "right_shoulder_pitch",
  7: "right_shoulder_roll",
  8: "right_shoulder_yaw",
  9: "right_elbow_pitch",
  10: "left_hip_pitch",
  11: "left_hip_roll",
  12: "left_hip_yaw",
  13: "left_knee",
  14: "left_ankle_up",
  15: "left_ankle_down",
  16: "right_hip_pitch",
  17: "right_hip_roll",
  18: "right_hip_yaw",
  19: "right_knee",
  20: "right_ankle_up",
  21: "right_ankle_down",
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
