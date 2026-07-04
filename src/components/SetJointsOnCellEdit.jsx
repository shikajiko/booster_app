import React, { useContext, useEffect, useRef, useState } from 'react';
import { Topic, Message } from 'roslib';

import { DataGrid } from '@mui/x-data-grid';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';
import JointGroupToolbar from './JointGroupToolbar';

const jointRobotColumns = [
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
    headerName: 'Robot Pos',
    width: 100,
    type: 'number',
    editable: true,
    sortable: false,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 140,
    sortable: false,
  },
];

function SetJointsOnCellEdit() {
  const { setJointRobotData, jointRobotData, setJointSelected } =
    useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const setJointsTopicRef = useRef(null);
  const [jointUpdated, setJointUpdated] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const leftArm = [2, 4, 6];
  const rightArm = [1, 3, 5];
  const leftLeg = [8, 10, 12, 14, 16, 18];
  const rightLeg = [7, 9, 11, 13, 15, 17];
  const leftGripper = [20];
  const rightGripper = [21];

  const rowIdSet = new Set(jointRobotData.map((r) => r.id));
  const hasRows = jointRobotData.length > 0;

  setJointsTopicRef.current = new Topic({
    ros,
    name: 'joint/set_joints',
    messageType: 'tachimawari_interfaces/msg/SetJoints',
  });

  const updateJointRobotData = (newJoints, index) => {
    const newJointRobotData = [
      ...jointRobotData.slice(0, index),
      newJoints,
      ...jointRobotData.slice(index + 1),
    ];
    setJointRobotData(newJointRobotData);
    setJointUpdated(true);
  };

  const handlePublish = () => {
    if (!ros) return;

    const joints = jointRobotData.map((joint) => ({
      id: joint.id,
      position: joint.pose_pos,
    }));

    const setJointsMessage = new Message({
      control_type: 3,
      joints,
    });

    setJointsTopicRef.current.publish(setJointsMessage);
  };

  const handleProcessRowUpdateError = (error) => {
    showLog(`Error updating row: ${error}`, 'error');
  };

  useEffect(() => {
    if (jointUpdated) {
      handlePublish();
      setJointUpdated(false);
    }
  }, [jointRobotData, jointUpdated]);

  useEffect(() => {
    setSelectedRows((prevSelected) => {
      const nextSelected = prevSelected.filter((id) => rowIdSet.has(id));
      return nextSelected;
    });
  }, [jointRobotData]);

  useEffect(() => {
    setJointSelected(selectedRows);
  }, [selectedRows, setJointSelected]);

  const isGroupSelected = (group) => {
    const existingGroup = group.filter((id) => rowIdSet.has(id));
    if (existingGroup.length === 0) return false;
    return existingGroup.every((id) => selectedRows.includes(id));
  };

  const setGroupSelected = (group, checked) => {
    const existingGroup = group.filter((id) => rowIdSet.has(id));
    setSelectedRows((prevSelected) => {
      if (checked) {
        return Array.from(new Set([...prevSelected, ...existingGroup]));
      }
      return prevSelected.filter((id) => !existingGroup.includes(id));
    });
  };

  const leftArmChange = (event) =>
    setGroupSelected(leftArm, event.target.checked);
  const rightArmChange = (event) =>
    setGroupSelected(rightArm, event.target.checked);
  const leftLegChange = (event) =>
    setGroupSelected(leftLeg, event.target.checked);
  const rightLegChange = (event) =>
    setGroupSelected(rightLeg, event.target.checked);
  const leftGripperChange = (event) =>
    setGroupSelected(leftGripper, event.target.checked);
  const rightGripperChange = (event) =>
    setGroupSelected(rightGripper, event.target.checked);

  return (
    <DataGrid
      rows={jointRobotData}
      columns={jointRobotColumns}
      rowHeight={25}
      slots={{
        toolbar: JointGroupToolbar,
      }}
      slotProps={{
        toolbar: {
          hasRows,
          leftArm,
          rightArm,
          leftLeg,
          rightLeg,
          leftGripper,
          rightGripper,
          isGroupSelected,
          leftArmChange,
          rightArmChange,
          leftLegChange,
          rightLegChange,
          leftGripperChange,
          rightGripperChange,
        },
      }}
      processRowUpdate={(newRow, oldRow) => {
        const index = jointRobotData.findIndex(
          (joint) => joint.id === oldRow.id
        );
        const updatedRow = {
          ...oldRow,
          pose_pos: newRow.pose_pos,
        };
        updateJointRobotData(updatedRow, index);
        return updatedRow;
      }}
      onProcessRowUpdateError={handleProcessRowUpdateError}
      disableColumnMenu
      onRowSelectionModelChange={(newSelection) => {
        const validSelection = newSelection.filter((id) => rowIdSet.has(id));
        setSelectedRows(validSelection);
      }}
      rowSelectionModel={selectedRows}
      checkboxSelection
      rowsPerPageOptions={[]}
    />
  );
}

export default SetJointsOnCellEdit;
