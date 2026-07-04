import React, { useContext, useEffect, useRef } from 'react';
import { Topic, Message } from 'roslib';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

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

function WalkSetConfig() {
  const { walking, kinematic, fetched } = useContext(AppContext);
  const { ros } = useRos();
  const setWalkConfigTopicRef = useRef(null);

  setWalkConfigTopicRef.current = new Topic({
    ros,
    name: 'aruku/config/set_config',
    messageType: 'aruku_interfaces/msg/SetConfig',
  });

  const handlePublish = () => {
    if (!ros) return;

    const setConfigServiceMessage = new Message({
      json_kinematic: JSON.stringify(kinematic),
      json_walking: JSON.stringify(walking),
    });

    setWalkConfigTopicRef.current.publish(setConfigServiceMessage);
  };

  useEffect(() => {
    if (fetched) {
      handlePublish();
    }
  }, [walking, kinematic]);

  return (
    <Grid container spacing={1.5} alignItems="flex-start">
      <Grid item xs={12} md={6} style={{ marginTop: 8 }}>
        <Item>
          {Object.keys(kinematic.ratio)
            .slice(0, 12)
            .map((key) => {
              if (key.includes('period')) return null;
              return (
                <NumberField
                  key={key}
                  name="ratio"
                  keys={key}
                  value={kinematic.ratio[key]}
                  type="kinematic"
                />
              );
            })}
        </Item>
      </Grid>
      <Grid item xs={12} md={6} style={{ marginTop: 8 }}>
        <Item>
          {Object.keys(kinematic.offset).map((key) => (
            <NumberField
              key={key}
              name="offset"
              keys={key}
              value={kinematic.offset[key]}
              type="kinematic"
            />
          ))}
          {Object.keys(walking.odometry).map((key) => (
            <NumberField
              key={key}
              name="odometry"
              keys={key}
              value={walking.odometry[key]}
              type="walking"
            />
          ))}
        </Item>
      </Grid>
    </Grid>
  );
}

export default WalkSetConfig;
