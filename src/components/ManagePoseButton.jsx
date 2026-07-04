import React, { useContext } from 'react';

import Button from '@mui/material/Button';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';

function ManagePoseButton(props) {
  const { currentPose, posesData, setPosesData, updatePosesData } =
    useContext(AppContext);
  const { showLog } = useContext(LoggerContext);

  const { typeButton } = props;

  const handleClick = () => {
    if (currentPose.length === 0) {
      showLog('Please pick a pose first.', 'error');

      return;
    }

    const index = posesData.findIndex((pose) => pose.id === currentPose.id);
    if (typeButton === 'UP') {
      if (index === 0) {
        return;
      }

      const newPosesData = [
        ...posesData.slice(0, index - 1),
        posesData[index],
        posesData[index - 1],
        ...posesData.slice(index + 1),
      ];

      newPosesData[index].id = index;
      newPosesData[index - 1].id = index - 1;

      setPosesData(newPosesData);
    } else if (typeButton === 'DOWN') {
      if (index === posesData.length - 1) {
        return;
      }

      const newPosesData = [
        ...posesData.slice(0, index),
        posesData[index + 1],
        posesData[index],
        ...posesData.slice(index + 2),
      ];

      newPosesData[index].id = index;
      newPosesData[index + 1].id = index + 1;

      setPosesData(newPosesData);
    } else if (typeButton === 'DELETE') {
      if (currentPose.length === 0) {
        showLog('Pick a pose first!', 'error');
        return;
      }
      updatePosesData(posesData[index], 'delete');
    } else {
      showLog(`Unknown type button: ${typeButton}`);
    }
  };

  let startIcon = null;
  if (typeButton === 'UP') {
    startIcon = <ArrowUpwardIcon />;
  } else if (typeButton === 'DOWN') {
    startIcon = <ArrowDownwardIcon />;
  } else {
    startIcon = <DeleteIcon />;
  }

  return (
    <Button
      variant="contained"
      color={typeButton === 'DELETE' ? 'error' : 'info'}
      style={{ margin: 5 }}
      className="button"
      onClick={handleClick}
      startIcon={startIcon}
    >
      {typeButton}
    </Button>
  );
}

export default ManagePoseButton;
