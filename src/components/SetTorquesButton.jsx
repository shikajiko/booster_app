import React, { useState, useContext, useEffect, useRef } from 'react';
import { Topic, Message } from 'roslib';

import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import WbIncandescentRoundedIcon from '@mui/icons-material/WbIncandescentRounded';
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

function SetTorquesButton() {
  const { jointSelected, setJointRobotData, jointRobotData } =
    useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const setTorquesTopicRef = useRef(null);

  let newJointRobotData = jointRobotData;
  const [isTorquesEnabled, setIsTorquesEnabled] = useState(true);
  const [isTorquesChanged, setIsTorquesChanged] = useState(false);
  const [onTorquesClicked, setOnTorquesClicked] = useState(false);
  const [offTorquesClicked, setOffTorquesClicked] = useState(false);

  setTorquesTopicRef.current = new Topic({
    ros,
    name: 'joint/set_torques',
    messageType: 'booster_joint_interface/msg/SetTorques',
  });

  const handlePublish = () => {
    if (!ros) return;

    const id = jointSelected;
    const torque_enable = isTorquesEnabled;
    setOffTorquesClicked(false);
    setOnTorquesClicked(false);
    if (id) {
      if (id.length === 0) {
        showLog('No joint selected!', 'warning');
        return;
      }

      for (let i = 0; i < id.length; i += 1) {
        const index = jointRobotData.findIndex((joint) => joint.id === id[i]);
        const newJoint = {
          id: jointRobotData[index].id,
          name: jointRobotData[index].name,
          pose_pos: jointRobotData[index].pose_pos,
          status: torque_enable ? 'ON' : 'OFF',
        };
        newJointRobotData = [
          ...newJointRobotData.slice(0, index),
          newJoint,
          ...newJointRobotData.slice(index + 1),
        ];
      }
      setJointRobotData(newJointRobotData);
    }

    const setTorquesMessage = new Message({
      ids: id,
      torque_enable,
    });

    setTorquesTopicRef.current.publish(setTorquesMessage);
  };

  useEffect(() => {
    handlePublish();
    setIsTorquesChanged(false);
  }, [isTorquesChanged]);

  const handleOnTorquesClicked = () => {
    setIsTorquesEnabled(true);
    setOnTorquesClicked(true);
    setIsTorquesChanged(true);
  };

  const handleOffTorquesClicked = () => {
    setIsTorquesEnabled(false);
    setOffTorquesClicked(true);
    setIsTorquesChanged(true);
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <LoadingButton
          onClick={handleOnTorquesClicked}
          color="primary"
          variant="contained"
          startIcon={<WbIncandescentRoundedIcon />}
          loading={onTorquesClicked}
        >
          ON
        </LoadingButton>
      </Grid>
      <Grid item xs={6}>
        <LoadingButton
          onClick={handleOffTorquesClicked}
          color="info"
          variant="contained"
          startIcon={<WbIncandescentOutlinedIcon />}
          loading={offTorquesClicked}
        >
          OFF
        </LoadingButton>
      </Grid>
    </Grid>
  );
}

export default SetTorquesButton;
