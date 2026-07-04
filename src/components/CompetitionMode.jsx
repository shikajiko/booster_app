import React, { useContext, useEffect, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';

import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

function CompetitionMode() {
  const { competitionModes, setCompetitionModes, setCurrentCompetition } =
    useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const getCurrentModeServiceRef = useRef(null);
  const getAllModeServiceRef = useRef(null);
  const setModeServiceRef = useRef(null);
  const { currentMode, setCurrentMode } = useContext(AppContext);

  getCurrentModeServiceRef.current = new Service({
    ros,
    name: 'competition/get_current_mode',
    messageType: 'competition_interfaces/srv/GetCurrentMode',
  });

  getAllModeServiceRef.current = new Service({
    ros,
    name: 'competition/get_all_mode',
    messageType: 'competition_interfaces/srv/GetAllMode',
  });

  setModeServiceRef.current = new Service({
    ros,
    name: 'competition/set_current_mode',
    messageType: 'competition_interfaces/srv/SetCurrentMode',
  });

  const handleFetch = () => {
    if (!ros) return;

    const getCurrentModeServiceRequest = new ServiceRequest({});
    getCurrentModeServiceRef.current.callService(
      getCurrentModeServiceRequest,
      (response) => {
        if (response.success) {
          setCurrentMode(response.mode);
        } else {
          showLog('Failed to get current mode', 'error');
        }
      },
      (error) => {
        showLog('Failed to get current mode', error);
        showLog('Failed to get current mode', 'error');
      }
    );

    const getAllModeServiceRequest = new ServiceRequest({});
    getAllModeServiceRef.current.callService(
      getAllModeServiceRequest,
      (response) => {
        if (response.success) {
          setCompetitionModes(JSON.parse(response.json));
          setCurrentCompetition(response.competition);
        } else {
          showLog('Failed to get all modes', 'error');
        }
      },
      (error) => {
        showLog('Failed to get all modes', error);
        showLog('Failed to get all modes', 'error');
      }
    );
  };

  const handleRadioChange = (event) => {
    setCurrentMode(event.target.value);

    const setModeServiceRequest = new ServiceRequest({
      mode: event.target.value,
    });

    setModeServiceRef.current.callService(
      setModeServiceRequest,
      (response) => {
        if (response.success) {
          showLog(`Successfully set mode to ${event.target.value}`, 'success');
        } else {
          showLog('Failed to set mode', 'error');
        }
      },
      (error) => {
        showLog('Failed to set mode', error);
        showLog('Failed to set mode', 'error');
      }
    );
  };

  useEffect(() => {
    handleFetch();
  }, [ros]);

  return (
    <Item>
      <FormControl sx={{ mx: 2 }}>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          value={currentMode}
          name="radio-buttons-group"
        >
          {competitionModes.map((mode) => (
            <FormControlLabel
              key={mode}
              value={mode}
              control={<Radio />}
              label={mode.toUpperCase()}
              onChange={handleRadioChange}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Item>
  );
}

export default CompetitionMode;
