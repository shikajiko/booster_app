import React, { useContext, useEffect, useRef } from 'react';
import { Topic } from 'roslib';
import { Chip, Stack } from '@mui/material';
import LoggerContext from '../context/LoggerContext';
import AppContext from '../context/AppContext';
import { useRos } from '../context/RosContext';

const RobotMode = {
  0: 'DAMP',
  1: 'PREP',
  2: 'WALK',
  3: 'CUSTOM',
};

const modeColor = {
  DAMP: 'default',   // grey
  PREP: 'success',   // green
  WALK: 'warning',   // yellow
  CUSTOM: 'error',   // red
};

const intToUpperControl = (ctrl) => (ctrl === 3 ? 'ON' : 'OFF');

const upcColor = {
  ON: 'success',
  OFF: 'error',
};

function RobotModeDisplay() {
  const { robotMode, setRobotMode, upcState, setUpcState } = useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const loadRobotModeTopicRef = useRef(null);

  useEffect(() => {
    if (!ros) return undefined;

    loadRobotModeTopicRef.current = new Topic({
      ros,
      name: '/robot_states',
      messageType: 'booster_interface/msg/RobotStates',
    });

    const handleMessage = (message) => {
      setRobotMode((prev) => (prev === message.current_mode ? prev : message.current_mode));
      setUpcState((prev) =>
        prev === message.current_body_control ? prev : message.current_body_control
      );
    };

    loadRobotModeTopicRef.current.subscribe(handleMessage);

    return () => {
      if (loadRobotModeTopicRef.current) {
        loadRobotModeTopicRef.current.unsubscribe(handleMessage);
      }
    };
  }, [ros, setRobotMode, setUpcState]);

  const displayMode = RobotMode[robotMode] ?? 'UNKNOWN';
  const displayUpc = intToUpperControl(upcState);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        label={`Mode: ${displayMode}`}
        color={modeColor[displayMode] ?? 'default'}
        size="medium"
        sx={{ fontWeight: 'bold' }}
      />
      <Chip
        label={`UPC: ${displayUpc}`}
        color={upcColor[displayUpc] ?? 'default'}
        size="medium"
        sx={{ fontWeight: 'bold' }}
      />
    </Stack>
  );
}

export default RobotModeDisplay;