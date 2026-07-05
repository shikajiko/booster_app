import React, { useContext, useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid } from '@mui/x-data-grid';
import MuiTypography from '@mui/material/Typography';
import {
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Switch,
  TextField,
  FormControlLabel,
  FormControl,
  MenuItem,
  InputLabel,
  Select
} from '@mui/material';

import SetTorquesButton from '../components/SetTorquesButton';
import SetJointsButton from '../components/SetJointsButton';
import GetActionsButton from '../components/GetActionsButton';
import RunActionButton from '../components/RunActionButton';
import AddDataButton from '../components/AddDataButton';
import ReadJointsButton from '../components/ReadJointsButton';
import ManagePoseButton from '../components/ManagePoseButton';
import SaveActionsButton from '../components/SaveActionsButton';
import BrakeActionButton from '../components/BrakeActionButton';
import CancelActionButton from '../components/CancelActionButton';
import SetInitButton from '../components/SetInitButton';
import SetJointsOnCellEdit from '../components/SetJointsOnCellEdit';
import WalkReadyButton from '../components/WalkReadyButton';
import MirrorActionButton from '../components/MirrorActionButton';
import SearchBar from '../components/SearchBar';
import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';

const actionColumns = [
  {
    field: 'name',
    headerName: 'Name',
    width: 160,
    sortable: false,
  },
  {
    field: 'control_type',
    headerName: 'Control Type',
    width: 90,
    sortable: false,
  },
  {
    field: 'next',
    headerName: 'Next',
    width: 90,
    sortable: false,
  },
  {
    field: 'poses',
    headerName: 'Poses',
    sortable: false,
  },
];

const poseColumns = [
  {
    field: 'name',
    headerName: 'Name',
    width: 140,
    sortable: false,
  },
  {
    field: 'duration',
    headerName: 'Duration',
    width: 100,
    type: 'number',
    sortable: false,
  },
  {
    field: 'delay_before',
    headerName: 'Pause Before',
    width: 100,
    type: 'number',
    sortable: false,
  },
  {
    field: 'joints',
    headerName: 'Joints',
    sortable: false,
  },
];

const jointPoseColumns = [
  {
    field: 'id',
    headerName: 'Id',
    width: 50,
    type: 'number',
    sortable: false,
    editable: false,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 140,
    sortable: false,
  },
  {
    field: 'pose_pos',
    headerName: 'Pose Pos',
    width: 100,
    type: 'number',
    editable: true,
    sortable: false,
  },
];

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

const gripperId = {
  left_gripper: 22,
  right_gripper: 23
}

function ActionManager() {
  const {
    actionsData,
    posesData,
    jointPoseData,
    jointRobotData,
    currentAction,
    currentPose,
    setPosesData,
    setJointPoseData,
    setCurrentAction,
    setCurrentPose,
    updateActionsData,
    updatePosesData,
  } = useContext(AppContext);

  const { showLog } = useContext(LoggerContext);
  const [checked, setChecked] = useState(false);
  const [searchText, setSearchText] = useState('');

  const updateJointPoseData = (newJoints, index) => {
    const newJointPoseData = [
      ...jointPoseData.slice(0, index),
      newJoints,
      ...jointPoseData.slice(index + 1),
    ];
    setJointPoseData(newJointPoseData);

    const newPose = {
      id: currentPose.id,
      name: currentPose.name,
      duration: currentPose.duration,
      delay_before: currentPose.delay_before,
      joints: newJointPoseData,
    };
    updatePosesData(newPose);
  };

  const handleClickedAction = (event) => {
    setCurrentAction(event.row);
    const currentPoses = actionsData[event.row.id].poses;
    setPosesData(currentPoses);
    setJointPoseData([]);
    setChecked(event.row.time_based);
  };

  const handleClickedSwitch = (event) => {
    if (Object.keys(currentAction).length !== 0) {
      setChecked(event.target.checked);
      const newAction = {
        id: currentAction.id,
        name: currentAction.name,
        next: currentAction.next,
        control_type: currentAction.control_type,
        poses: currentAction.poses,
      };
      updateActionsData(newAction);
    } else {
      showLog('Pick an action first!', 'error');
    }
  };

  const handleClickedPose = (event) => {
    setCurrentPose(posesData[event.row.id]);
    setJointPoseData([]);

    const currentPoses = posesData[event.row.id];
    const currentJointPoseData = [];

    Object.keys(jointIdList).forEach((key) => {
      const jointId = jointIdList[key];
      currentJointPoseData.push({
        id: jointId,
        name: key,
        pose_pos: currentPoses.joints[jointId - 1].pose_pos,
      });
    });
    setJointPoseData(currentJointPoseData);
  };

  const setJointRobotToPoseData = () => {
    if (jointRobotData.length !== 0) {
      if (jointPoseData.length === 0) {
        showLog('Pick an action first!', 'error');
        return;
      }

      const newJointPoseData = [];
      for (let i = 0; i < jointRobotData.length; i += 1) {
        newJointPoseData.push({
          id: jointRobotData[i].id,
          name: jointRobotData[i].name,
          pose_pos: jointRobotData[i].pose_pos,
        });
      }
      setJointPoseData(newJointPoseData);

      const newPose = {
        id: currentPose.id,
        name: currentPose.name,
        duration: currentPose.duration,
        delay_before: currentPose.delay_before,
        joints: newJointPoseData,
      };
      updatePosesData(newPose);
    } else {
      showLog('No joint data to set.', 'warning');
    }
  };
  const filteredActions = actionsData.filter((action) => {
    if (!action.name) return false;
    return action.name.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <div style={{ height: 680, width: '100%' }}>
            <SearchBar
              label="Search Action..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Type 'walk' or 'kick'"
            />
            <div style={{ height: 10 }} />
            <DataGrid
              rows={filteredActions}
              columns={actionColumns}
              rowHeight={32}
              disableColumnMenu
              rowsPerPageOptions={[]}
              onRowClick={handleClickedAction}
            />
          </div>
          <div style={{ marginTop: 70 }}>
            <SaveActionsButton />
            <GetActionsButton />
            <AddDataButton typeData="action" />
            {/* <MirrorActionButton />
            <BrakeActionButton />
            <CancelActionButton /> */}
          </div>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <MuiTypography variant="subtitle1">Action</MuiTypography>
              <div style={{ marginBottom: 10 }}>
                <TextField
                  id="action-name"
                  label="Name"
                  variant="outlined"
                  margin="dense"
                  value={currentAction ? currentAction.name : ''}
                  onChange={(event) => {
                    if (!currentAction.id) return;
                    const formattedName = event.target.value.toLowerCase().replace(/ /g, '_');
                    const newAction = {
                      id: currentAction.id,
                      name: currentAction.name,
                      next: currentAction.next,
                      control_type: currentAction.control_type,
                      poses: currentAction.poses,
                    };
                    updateActionsData(newAction);
                  }}
                  style={{ margin: 3, marginTop: 20, width: '60%' }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  id="action-next"
                  label="Next"
                  variant="outlined"
                  margin="dense"
                  value={currentAction ? currentAction.next : ''}
                  onChange={(event) => {
                    if (!currentAction.id) return;
                    const newAction = {
                      id: currentAction.id,
                      name: currentAction.name,
                      next: currentAction.next,
                      control_type: currentAction.control_type,
                      poses: currentAction.poses,
                    };
                    updateActionsData(newAction);
                  }}
                  style={{ margin: 3, marginTop: 20, width: '30%' }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <FormControl
                  margin="dense"
                  style={{ margin: 3, marginTop: 20, width: "30%" }}
                >
                  <InputLabel id="control-type-label">Control Type</InputLabel>
                  <Select
                    labelId='control-type-label'
                    value={currentAction?.control_type || ''}
                    label="Control Type"
                    onChange={(event) => {
                      if (currentAction.id === undefined) return;

                      const newAction = {
                        ...currentAction,
                        control_type: event.target.value
                      };
                      updateActionsData(newAction);
                    }}
                  >
                    <MenuItem value="upper_body">Upper Body</MenuItem>
                    <MenuItem value="full_body">Full Body</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div style={{ height: 360, width: '100%' }}>
                <DataGrid
                  rows={posesData}
                  columns={poseColumns}
                  rowHeight={32}
                  disableColumnMenu
                  rowsPerPageOptions={[]}
                  onRowClick={handleClickedPose}
                />
              </div>
              <div style={{ marginTop: 10, marginBottom: -10 }}>
                <SetJointsButton typeButton="run_pose" />
                <AddDataButton typeData="pose" />
                <ManagePoseButton typeButton="UP" />
                <ManagePoseButton typeButton="DOWN" />
                <ManagePoseButton typeButton="DELETE" />
              </div>
            </CardContent>
          </Card>
          <Card style={{ marginTop: 10 }}>
            <CardContent>
              <MuiTypography variant="subtitle1">Pose</MuiTypography>
              <TextField
                id="pose-name"
                label="Name"
                variant="outlined"
                margin="dense"
                value={currentPose ? currentPose.name : ''}
                onChange={(event) => {
                  if (currentPose.id === undefined) return;
                  const newPose = {
                    id: currentPose.id,
                    name: currentPose.name,
                    duration: currentPose.duration,
                    delay_before: currentPose.delay_before,
                    joints: newJointPoseData,
                  };
                  updatePosesData(newPose);
                }}
                style={{ margin: 3, marginTop: 20, width: '40%' }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                id="pose-duration"
                label="Duration"
                variant="outlined"
                margin="dense"
                type="number"
                value={currentPose ? currentPose.time : 0}
                onChange={(event) => {
                  if (currentPose.id === undefined) return;
                  const newPose = {
                    id: currentPose.id,
                    name: currentPose.name,
                    duration: Number(event.target.value),
                    delay_before: currentPose.delay_before,
                    joints: newJointPoseData
                  };
                  updatePosesData(newPose);
                }}
                style={{ margin: 3, marginTop: 20, width: '25%' }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                id="pose-delay-before"
                label="Pause Before"
                variant="outlined"
                margin="dense"
                type="number"
                value={currentPose ? currentPose.pause : 0}
                onChange={(event) => {
                  if (currentPose.id === undefined) return;
                  const newPose = {
                    id: currentPose.id,
                    name: currentPose.name,
                    duration: currentPose.duration,
                    delay_before: Number(event.target.value),
                    joints: newJointPoseData,
                  };
                  updatePosesData(newPose);
                }}
                style={{ margin: 3, marginTop: 20, width: '25%' }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </CardContent>
          </Card>
          <div style={{ marginTop: 10, marginBottom: -10 }}>
            <RunActionButton />
            {/* <WalkReadyButton /> */}
            {/* <SetInitButton /> */}
          </div>
        </Grid>
        <Grid item xs={12} lg={3}>
          <div style={{ height: 680, width: '100%' }}>
            <DataGrid
              rows={jointPoseData}
              columns={jointPoseColumns}
              rowHeight={25}
              onCellEditCommit={(event) => {
                const index = jointPoseData.findIndex(
                  (joint) => joint.id === event.id
                );
                const newJoints = {
                  id: jointPoseData[index].id,
                  name: jointPoseData[index].name,
                  pose_pos: event.value,
                };
                updateJointPoseData(newJoints, index);
              }}
              disableColumnMenu
              rowsPerPageOptions={[]}
            />
          </div>
          <div style={{ marginTop: 10, float: 'right' }}>
            <SetJointsButton typeButton="to_robot" />
          </div>
        </Grid>
        <Grid item xs={6} lg={3}>
          <div style={{ height: 680, width: '100%' }}>
            <SetJointsOnCellEdit />
          </div>
          <div style={{ marginTop: 10, float: 'left' }}>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Button variant="contained" onClick={setJointRobotToPoseData}>
                  <ArrowBackIcon />
                </Button>
              </Grid>
              <Grid item xs={8}>
                <SetTorquesButton />
              </Grid>
            </Grid>
          </div>
          <div style={{ marginTop: 10, float: 'right' }}>
            <ReadJointsButton />
          </div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ActionManager;
