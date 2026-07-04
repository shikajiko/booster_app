import React from 'react';
import { NavLink } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Chip } from '@mui/material';
import LoadConfigButton from './LoadConfigButton';

function Header() {
  const robotName = import.meta.env.VITE_ROBOT_NAME || 'Unknown Robot';
  return (
    <AppBar>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ICHIRO App
          <Chip
            label={robotName}
            color={robotName.includes('Simulation') ? 'info' : 'secondary'}
            size="medium"
            sx={{ marginLeft: 2, fontWeight: 'bold' }}
          />
        </Typography>
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
