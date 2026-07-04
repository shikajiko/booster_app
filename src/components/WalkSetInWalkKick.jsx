import React, { useContext, useRef, useState } from 'react';
import { Topic, Message } from 'roslib';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import NumberField from './NumberField';
import AppContext from '../context/AppContext';
import { useRos } from '../context/RosContext';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const ParamTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  padding: theme.spacing(1),
  fontSize: '0.75rem',
}));

function WalkSetInWalkKick() {
  const { kinematic } = useContext(AppContext);
  const { ros } = useRos();
  const walkKickTopicRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  walkKickTopicRef.current = new Topic({
    ros,
    name: '/walking/walk_kick',
    messageType: 'std_msgs/msg/Int8',
  });

  const publishKick = (data) => {
    if (!ros) return;
    setIsLoading(true);
    walkKickTopicRef.current.publish(new Message({ data }));
    setIsLoading(false);
  };

  return (
    <Grid container spacing={1.5} alignItems="flex-start">
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ textAlign: 'left', m: 1, fontWeight: 'bold' }}>
          In-Walk Kick
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <Item>
          <Box sx={{ p: 1 }}>
            <Grid
              container
              spacing={1}
              justifyContent="center"
              alignItems="center"
              padding={0.5}
              sx={{ mb: 0.5 }}
            >
              <Grid item xs={6}>
                <ParamTitle>TRIGGER KICK</ParamTitle>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" gap={1} justifyContent="flex-end" sx={{ width: '100%' }}>
                  <LoadingButton
                    onClick={() => publishKick(0)}
                    color="primary"
                    variant="contained"
                    loading={isLoading}
                    sx={{ flex: 1, minWidth: 80 }}
                  >
                    Left
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => publishKick(2)}
                    color="primary"
                    variant="contained"
                    loading={isLoading}
                    sx={{ flex: 1, minWidth: 80 }}
                  >
                    Left Center
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => publishKick(3)}
                    color="primary"
                    variant="contained"
                    loading={isLoading}
                    sx={{ flex: 1, minWidth: 80 }}
                  >
                    Right Center
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => publishKick(1)}
                    color="primary"
                    variant="contained"
                    loading={isLoading}
                    sx={{ flex: 1, minWidth: 80 }}
                  >
                    Right
                  </LoadingButton>
                </Box>
              </Grid>
            </Grid>

            {['x_amplitude', 'y_amplitude', 'z_amplitude'].map((key) => (
              <NumberField
                key={key}
                name="in_walk_kick"
                keys={key}
                value={kinematic.in_walk_kick[key]}
                type="kinematic"
              />
            ))}
          </Box>
        </Item>
      </Grid>

      <Grid item xs={12} md={4}>
        <Item>
          {['start_ratio', 'return_ratio', 'period_scale'].map((key) => (
            <NumberField
              key={key}
              name="in_walk_kick"
              keys={key}
              value={kinematic.in_walk_kick[key]}
              type="kinematic"
            />
          ))}
        </Item>
      </Grid>

      <Grid item xs={12} md={4} />
    </Grid>
  );
}

export default WalkSetInWalkKick;
