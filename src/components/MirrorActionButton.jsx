import React, { useContext } from 'react';

import Button from '@mui/material/Button';
import FlipIcon from '@mui/icons-material/Flip';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';

const mirrorJointMap = {
  right_shoulder_pitch: 'left_shoulder_pitch',
  left_shoulder_pitch: 'right_shoulder_pitch',
  right_shoulder_roll: 'left_shoulder_roll',
  left_shoulder_roll: 'right_shoulder_roll',
  right_elbow: 'left_elbow',
  left_elbow: 'right_elbow',
  right_hip_yaw: 'left_hip_yaw',
  left_hip_yaw: 'right_hip_yaw',
  right_hip_roll: 'left_hip_roll',
  left_hip_roll: 'right_hip_roll',
  right_hip_pitch: 'left_hip_pitch',
  left_hip_pitch: 'right_hip_pitch',
  right_knee: 'left_knee',
  left_knee: 'right_knee',
  right_ankle_pitch: 'left_ankle_pitch',
  left_ankle_pitch: 'right_ankle_pitch',
  right_ankle_roll: 'left_ankle_roll',
  left_ankle_roll: 'right_ankle_roll',
  right_gripper: 'left_gripper',
  left_gripper: 'right_gripper',
  right_shoulder_yaw: 'left_shoulder_yaw',
  left_shoulder_yaw: 'right_shoulder_yaw',
};

function MirrorActionButton() {
  const {
    actionsData,
    currentAction,
    setActionsData,
  } = useContext(AppContext);

  const { showLog } = useContext(LoggerContext);

  const mirrorJointValue = (jointName, value) => {
    if (jointName === 'neck_pitch') {
      return value;
    }

    return -value;
  };

  const handleMirrorAction = () => {
    if (!currentAction || currentAction.id === undefined) {
      showLog('Pick an action first!', 'error');
      return;
    }

    const mirroredPoses = currentAction.poses.map((pose, poseIndex) => {
      const mirroredJoints = pose.joints.map((joint) => {
        let mirroredName = joint.name;

        if (mirrorJointMap[joint.name]) {
          mirroredName = mirrorJointMap[joint.name];
        }

        const sourceJoint = pose.joints.find(
          (j) => j.name === mirroredName
        );

        const sourceValue = sourceJoint?.pose_pos ?? 0.0;

        return {
          ...joint,
          pose_pos: mirrorJointValue(
            joint.name,
            sourceValue
          ),
        };
      });

      return {
        ...pose,
        id: poseIndex,
        name: `${pose.name}`,
        joints: mirroredJoints,
      };
    });

    const mirroredAction = {
      ...currentAction,
      id: actionsData.length,
      name: `${currentAction.name}_mirror`,
      poses: mirroredPoses,
    };

    setActionsData((prev) => [
      ...prev,
      mirroredAction,
    ]);

    showLog(
      `Mirrored action created: ${mirroredAction.name}`,
      'success'
    );
  };

  return (
    <Button
      style={{ margin: 5 }}
      variant="contained"
      color="secondary"
      startIcon={<FlipIcon />}
      onClick={handleMirrorAction}
    >
      Mirror Action
    </Button>
  );
}

export default MirrorActionButton;
