import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { Service, ServiceRequest } from 'roslib';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import LoadingButton from '@mui/lab/LoadingButton';

import NumberField from './NumberField';
import SwitchActive from './SwitchActive';
import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

function isHiddenField(key) {
  return key.toLowerCase().includes('debug');
}

function SectionFields({ section, data }) {
  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        if (isHiddenField(key)) return null;

        if (typeof value === 'boolean') {
          return (
            <SwitchActive
              key={key}
              type="mcl"
              name={section}
              keys={key}
              label={key.toUpperCase()}
              value={value}
            />
          );
        }

        return (
          <NumberField
            key={key}
            type="mcl"
            name={section}
            keys={key}
            value={value}
          />
        );
      })}
    </>
  );
}

function MCLConfig() {
  const { mclConfig, setMCLConfig } = useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();

  const getMCLConfigServiceRef = useRef(null);
  const setMCLConfigServiceRef = useRef(null);
  const saveMCLConfigServiceRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isServiceReady, setIsServiceReady] = useState(false);

  getMCLConfigServiceRef.current = new Service({
    ros, name: 'basho/config/get_config', messageType: 'basho_interfaces/srv/GetConfig',
  });
  setMCLConfigServiceRef.current = new Service({
    ros, name: 'basho/config/set_config', messageType: 'basho_interfaces/srv/SetConfig',
  });
  saveMCLConfigServiceRef.current = new Service({
    ros, name: 'basho/config/save_config', messageType: 'basho_interfaces/srv/SaveConfig',
  });

  const handleFetch = (reload = false) => {
    if (!ros) return;
    setIsLoading(true);

    getMCLConfigServiceRef.current.callService(
      new ServiceRequest({}),
      (response) => {
        setMCLConfig(JSON.parse(response.json));
        if (reload) {
          showLog('MCL configuration fetched successfully', 'success');
        }
      },
      (error) => {
        showLog(`Failed to fetch MCL configuration: ${error.message}`, 'error');
      },
    );
    setIsLoading(false);
  };

  const handlePublish = () => {
    if (!ros) return;

    setMCLConfigServiceRef.current.callService(
      new ServiceRequest({ json: JSON.stringify(mclConfig) }),
      (response) => {
        if (!response.status) showLog('Failed to set MCL configuration', 'error');
      },
      (error) => {
        showLog(`Failed to set MCL configuration: ${error.message}`, 'error');
      },
    );
  };

  const handleSave = () => {
    if (!ros) return;
    setIsLoading(true);

    saveMCLConfigServiceRef.current.callService(
      new ServiceRequest({ json: JSON.stringify(mclConfig) }),
      (response) => {
        if (!response.status) {
          showLog('Failed to save MCL configuration', 'error');
        } else {
          showLog('MCL configuration saved successfully', 'success');
        }
      },
      (error) => {
        showLog(`Failed to save MCL configuration: ${error.message}`, 'error');
      },
    );
    setIsLoading(false);
  };

  const handleReload = () => {
    handleFetch(true);
  };

  useEffect(() => {
    if (ros) {
      setIsServiceReady(true);
    } else {
      setIsServiceReady(false);
    }
  }, [ros]);

  useEffect(() => {
    if (isServiceReady) {
      handleFetch();
    }
  }, [isServiceReady, ros]);

  useEffect(() => {
    if (isServiceReady) {
      handlePublish();
    }
  }, [mclConfig]);

  return (
    <Grid container direction="column" spacing={2}>
      {Object.entries(mclConfig).map(([section, fields]) => (
        <Grid item key={section}>
          <Item>
            <Typography variant="subtitle1" fontWeight="bold" textAlign="left" mb={1}>
              {section.toUpperCase()}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <SectionFields section={section} data={fields} />
          </Item>
        </Grid>
      ))}

      <Grid item container justifyContent="flex-end" spacing={1}>
        <Grid item>
          <LoadingButton
            onClick={handleSave}
            color="primary"
            variant="contained"
            loading={isLoading}
            disabled={!ros}
          >
            Save
          </LoadingButton>
        </Grid>
        <Grid item>
          <LoadingButton
            onClick={handleReload}
            color="warning"
            variant="contained"
            loading={isLoading}
            disabled={!ros}
          >
            Reload
          </LoadingButton>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default MCLConfig;
