import React, { useContext } from 'react';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import SwitchActive from './SwitchActive';
import NumberField from './NumberField';
import AppContext from '../context/AppContext';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function WalkSetBalance() {
  const { walking, kinematic } = useContext(AppContext);

  const pidEnableKeys = Object.keys(walking.pid).filter(
    (key) => typeof walking.pid[key] === 'boolean',
  );
  const pidPitchKeys = Object.keys(walking.pid).filter(
    (key) => typeof walking.pid[key] !== 'boolean' && /pitch/i.test(key),
  );
  const pidRollKeys = Object.keys(walking.pid).filter(
    (key) => typeof walking.pid[key] !== 'boolean' && /roll/i.test(key),
  );
  const pidOtherKeys = Object.keys(walking.pid).filter(
    (key) => typeof walking.pid[key] !== 'boolean' && !/pitch|roll/i.test(key),
  );

  return (
    <>
      <Typography variant="h6" sx={{ textAlign: 'left', m: 1, fontWeight: 'bold' }}>
        Balance Settings
      </Typography>
      <Grid container spacing={1.5} alignItems="flex-start">
        <Grid item xs={12} md={4}>
          <Item>
            {pidEnableKeys.map((key) => (
              <SwitchActive
                key={key}
                name={key}
                label="PID_ENABLE"
                value={walking.pid[key]}
                type="pid"
              />
            ))}

            {Object.keys(kinematic.balance_pause)
              .filter((key) => typeof kinematic.balance_pause[key] === 'boolean')
              .map((key) => (
                <SwitchActive
                  key={key}
                  name={key}
                  label="BALANCE_BY_PAUSE"
                  value={kinematic.balance_pause[key]}
                  type="kinematic"
                />
              ))}

            {Object.keys(kinematic.balance_pause)
              .filter((key) => typeof kinematic.balance_pause[key] !== 'boolean')
              .map((key) => (
                <NumberField
                  key={key}
                  name="balance_pause"
                  keys={key}
                  value={kinematic.balance_pause[key]}
                  type="kinematic"
                />
              ))}
          </Item>
        </Grid>

        <Grid item xs={12} md={4}>
          <Item>
            {[...pidPitchKeys, ...pidOtherKeys].map((key) => (
              <NumberField
              key={key}
              name="pid"
              keys={key}
              value={walking.pid[key]}
              type="walking"
              />
            ))}
          </Item>
        </Grid>

        <Grid item xs={12} md={4}>
          <Item>
            {pidRollKeys.map((key) => (
              <NumberField
                key={key}
                name="pid"
                keys={key}
                value={walking.pid[key]}
                type="walking"
              />
            ))}
          </Item>
        </Grid>
      </Grid>
    </>
  );
}

export default WalkSetBalance;
