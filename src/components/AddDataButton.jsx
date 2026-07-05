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
  right_ankle_down: 21,
};

function AddDataButton(props) {
  const {
    actionsData,
    posesData,
    setActionsData,
    updatePosesData,
  } = useContext(AppContext);
  const { typeData } = props;
  const { showLog } = useContext(LoggerContext);

  const buildEmptyJoints = () => {
    const joints = [];
    Object.keys(jointIdList).forEach((name) => {
      joints.push({
        id: jointIdList[name],
        name,
        pose_pos: 0,
      });
    });
    return joints;
  };

  const handleClick = () => {
    if (typeData === 'action') {
      const newAction = {
        id: actionsData.length,
        name: 'new_action',
        next: '',
        control_type: 'upper_body',
        poses: [],
      };
      setActionsData((prevActionsData) => [...prevActionsData, newAction]);
      showLog('New action added', 'info');
    } else if (typeData === 'pose') {
      if (posesData.length === 0 && Object.keys(actionsData).length === 0) {
        showLog('Pick an action first!', 'error');
        return;
      }
      const newPose = {
        id: posesData.length,
        name: 'New Pose',
        duration: 0,
        delay_before: 0,
        joints: buildEmptyJoints(),
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