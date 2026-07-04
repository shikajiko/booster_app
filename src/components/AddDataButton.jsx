import React, { useContext } from 'react';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';

const jointIdList = {
  head_yaw: 0,
  head_pitch: 1,
  left_shoulder_pitch: 2,
  left_shoulder_roll: 3,
  left_shoulder_yaw: 4,
  left_elbow: 5,
  right_shoulder_pitch: 6,
  right_shoulder_roll: 7,
  right_shoulder_yaw: 8,
  right_elbow_pitch: 9,
  left_hip_pitch: 10,
  left_hip_roll: 11,
  left_hip_yaw: 12,
  left_knee: 13,
  left_ankle_up: 14,
  left_ankle_down: 15,
  right_hip_pitch: 16,
  right_hip_roll: 17,
  right_hip_yaw: 18,
  right_knee: 19,
  right_ankle_up: 20,
  right_ankle_down: 21
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
        duration: 0,
        delay_before: 0,
        joints: newJointPose,
      };

      const newAction = {
        id: actionsData.length,
        name: 'new_action',
        next: '',
        control_type: 'upper_body'
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
        id: 0,
        name: 'New Pose',
        duration: 0,
        delay_before: 0,
        joints: newJointPose
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
