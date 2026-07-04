import React from 'react';
import { GridToolbarContainer } from '@mui/x-data-grid';
import { Switch, Grid, FormControlLabel } from '@mui/material';

function JointGroupToolbar(props) {
  const {
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
  } = props;

  return (
    <GridToolbarContainer>
      <Grid container spacing={2} sx={{ px: 1, py: 0.5 }}>
        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Switch
                checked={isGroupSelected(leftArm)}
                onChange={leftArmChange}
                disabled={!hasRows}
              />
            }
            label="Left Arm"
          />
        </Grid>

        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Switch
                checked={isGroupSelected(rightArm)}
                onChange={rightArmChange}
                disabled={!hasRows}
              />
            }
            label="Right Arm"
          />
        </Grid>

        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Switch
                checked={isGroupSelected(leftGripper)}
                onChange={leftGripperChange}
                disabled={!hasRows}
              />
            }
            label="Left Gripper"
          />
        </Grid>

        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Switch
                checked={isGroupSelected(leftLeg)}
                onChange={leftLegChange}
                disabled={!hasRows}
              />
            }
            label="Left Leg"
          />
        </Grid>

        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Switch
                checked={isGroupSelected(rightLeg)}
                onChange={rightLegChange}
                disabled={!hasRows}
              />
            }
            label="Right Leg"
          />
        </Grid>

        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Switch
                checked={isGroupSelected(rightGripper)}
                onChange={rightGripperChange}
                disabled={!hasRows}
              />
            }
            label="Right Gripper"
          />
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

export default JointGroupToolbar;
