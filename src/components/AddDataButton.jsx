import React, { useContext } from 'react';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';

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

function AddDataButton(props) {
  const {
    actionsData,
    posesData,
    setActionsData,
    currentPose,
    updatePosesData,
  } = useContext(AppContext);
  const { typeData } = props;

  const { showLog } = useContext(LoggerContext);

  const handleClick = () => {
    if (typeData === 'action') {
      if (actionsData.length === 0) {
        showLog('Action data is empty!', 'error');
        return;
      }

      const newJointPose = [];
      Object.keys(jointIdList).forEach((index) => {
        const jointId = jointIdList[index];
        newJointPose.push({
          id: jointId,
          name: index,
          pose_pos: 0,
        });
      });

      const newPose = {
        id: 0,
        name: 'New Pose',
        speed: 0,
        time: 1,
        pause: 0,
        joints: newJointPose,
      };

      const newAction = {
        id: actionsData.length,
        name: 'new_action',
        next: '',
        start_delay: 0,
        stop_delay: 0,
        poses: [newPose],
        time_based: true,
      };

      setActionsData((prevActionsData) => [...prevActionsData, newAction]);

      showLog('New action added', 'info');
    } else if (typeData === 'pose') {
      if (posesData.length === 0) {
        showLog('Pick an action first!', 'error');
        return;
      }

      if (Object.keys(currentPose).length === 0) {
        showLog('Pick a pose first!', 'error');
        return;
      }

      const newPose = {
        id: posesData.length,
        name: 'New Pose',
        speed: 0,
        time: 1,
        pause: 0,
        joints: currentPose.joints,
      };

      updatePosesData(newPose);

      showLog('New pose added', 'info');
    } else {
      showLog(`Unknown type data: ${typeData}`);
    }
  };

  return (
    <Button
      style={{ margin: 5 }}
      variant="contained"
      color="info"
      startIcon={<AddIcon />}
      onClick={handleClick}
    >
      Add {typeData}
    </Button>
  );
}

export default AddDataButton;
