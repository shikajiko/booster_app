import React, { useContext, useState, useRef } from 'react';
import { Topic, Message } from 'roslib';
import { Grid, Box, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import AppContext from '../context/AppContext';
import { useRos } from '../context/RosContext';

function SetRobotPosition() {
  const { robotPose } = useContext(AppContext);
  const { ros } = useRos();
  const robotPoseTopicRef = useRef(null);
  const robotFusedPoseTopicRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [poseValue, setPoseValue] = useState({
    x: robotPose.x,
    y: robotPose.y,
  });

  robotPoseTopicRef.current = new Topic({
    ros,
    name: '/walking/set_odometry',
    messageType: 'aruku_interfaces/msg/Point2',
  });

  robotFusedPoseTopicRef.current = new Topic({
    ros,
    name: '/localization/fused_pose',
    messageType: 'aruku_interfaces/msg/Point2',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setPoseValue((prev) => ({
      ...prev,
      [id === 'robot-pose-x' ? 'x' : 'y']: parseFloat(value) || 0,
    }));
  };

  const handlePublish = () => {
    if (!ros) return;
    setIsLoading(true);

    const robotPoseMessage = new Message({
      x: poseValue.x,
      y: poseValue.y,
    });

    robotPoseTopicRef.current.publish(robotPoseMessage);
    robotFusedPoseTopicRef.current.publish(robotPoseMessage);

    setIsLoading(false);
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          fullWidth
          id="robot-pose-x"
          label="X (cm)"
          value={poseValue.x}
          onChange={handleChange}
          variant="outlined"
          margin="dense"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          fullWidth
          id="robot-pose-y"
          label="Y (cm)"
          value={poseValue.y}
          onChange={handleChange}
          variant="outlined"
          margin="dense"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={6}>
        <Box
          display="flex"
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
        >
          <LoadingButton
            onClick={handlePublish}
            color="primary"
            variant="contained"
            loading={isLoading}
            sx={{ minWidth: '100px', height: '40px', marginRight: '16px' }}
          >
            Set
          </LoadingButton>
        </Box>
      </Grid>
    </Grid>
  );
}

export default SetRobotPosition;
