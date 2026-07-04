import React, { useContext, useEffect, useRef } from 'react';
import { Topic, Message } from 'roslib';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

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

function InitSetConfig() {
  const { kinematic, walking, fetched } = useContext(AppContext);
  const { ros } = useRos();
  const setInitConfigTopicRef = useRef(null);

  setInitConfigTopicRef.current = new Topic({
    ros,
    name: 'aruku/config/set_config',
    messageType: 'aruku_interfaces/msg/SetConfig',
  });

  const handlePublish = () => {
    if (!ros) return;
    const setInitConfigMessage = new Message({
      json_kinematic: JSON.stringify(kinematic),
      json_walking: JSON.stringify(walking),
    });

    setInitConfigTopicRef.current.publish(setInitConfigMessage);
  };

  useEffect(() => {
    if (fetched) {
      handlePublish();
    }
  }, [walking]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Item>
          <Typography variant="h6" component="div" sx={{ padding: 1 }}>
            Left Joints
          </Typography>
          {Object.keys(walking.init_angles).length < 18
            ? Object.keys(walking.init_angles)
                .slice(0, 9)
                .map((key) => (
                  <NumberField
                    key={key}
                    name="init_angles"
                    keys={key}
                    value={walking.init_angles[key]}
                    type="walking"
                  />
                ))
            : Object.keys(walking.init_angles)
                .slice(0, 11)
                .map((key) => (
                  <NumberField
                    name="init_angles"
                    key={key}
                    keys={key}
                    value={walking.init_angles[key]}
                    type="walking"
                  />
                ))}
        </Item>
      </Grid>
      <Grid item xs={12} md={6}>
        <Item>
          <Typography variant="h6" component="div" sx={{ padding: 1 }}>
            Right Joints
          </Typography>
          {Object.keys(walking.init_angles).length < 18
            ? Object.keys(walking.init_angles)
                .slice(9, 18)
                .map((key) => (
                  <NumberField
                    name="init_angles"
                    keys={key}
                    key={key}
                    value={walking.init_angles[key]}
                    type="walking"
                  />
                ))
            : Object.keys(walking.init_angles)
                .slice(11, 22)
                .map((key) => (
                  <NumberField
                    name="init_angles"
                    keys={key}
                    key={key}
                    value={walking.init_angles[key]}
                    type="walking"
                  />
                ))}
        </Item>
      </Grid>
    </Grid>
  );
}

export default InitSetConfig;
