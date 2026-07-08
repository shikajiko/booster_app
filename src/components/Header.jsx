import React from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Chip } from '@mui/material';
import LoadConfigButton from './LoadConfigButton';
import RobotModeDisplay from './RobotModeDisplay';

function Header() {
  const robotName = import.meta.env.VITE_ROBOT_NAME || 'Unknown Robot';
  return (
    <AppBar>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            ICHIRO App
          </Typography>
          <Chip
            label={robotName}
            color={robotName.includes('Simulation') ? 'info' : 'secondary'}
            size="medium"
            sx={{ marginLeft: 2, fontWeight: 'bold' }}
          />
          <Box sx={{ marginLeft: 2 }}>
            <RobotModeDisplay />
          </Box>
        </Box>
        <LoadConfigButton />
        <Button
          component={NavLink}
          to="/"
          style={({ isActive }) => ({
            fontWeight: isActive ? 900 : 'normal',
          })}
          color="inherit"
        >
          Home Page
        </Button>
        <Button
          component={NavLink}
          to="/action_manager"
          style={({ isActive }) => ({
            fontWeight: isActive ? 900 : 'normal',
          })}
          color="inherit"
        >
          Action Manager
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;