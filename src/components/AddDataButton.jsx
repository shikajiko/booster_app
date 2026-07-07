import React, { useContext } from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';

const jointIdList = {
  HeadYaw: 0,
  HeadPitch: 1,
  LeftShoulderPitch: 2,
  LeftShoulderRoll: 3,
  LeftElbowPitch: 4,
  LeftElbowYaw: 5,
  RightShoulderPitch: 6,
  RightShoulderRoll: 7,
  RightElbowPitch: 8,
  RightElbowYaw: 9,
  LeftHipPitch: 10,
  LeftHipRoll: 11,
  LeftHipYaw: 12,
  LeftKnee: 13,
  LeftAnkleUp: 14,
  LeftAnkleDown: 15,
  RightHipPitch: 16,
  RightHipRoll: 17,
  RightHipYaw: 18,
  RightKnee: 19,
  RightAnkleUp: 20,
  RightAnkleDown: 21,
  LeftGripper: 22,
  RightGripper: 23,
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
        duration: 1,
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