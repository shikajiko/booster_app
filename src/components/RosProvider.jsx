import React, { useContext, useEffect, useRef } from 'react';
import ROSLIB from 'roslib';

import LoggerContext from '../context/LoggerContext';
import RosContext from '../context/RosContext';

function RosProvider({ children }) {
  const ROS_BRIDGE_API_URL = import.meta.env.VITE_ROS_BRIDGE_API_URL;
  const rosRef = useRef(null);
  const abortController = useRef(new AbortController());
  const { showLog } = useContext(LoggerContext);

  useEffect(() => {
    rosRef.current = new ROSLIB.Ros();

    const connect = () => {
      if (abortController.current.signal.aborted) return;

      rosRef.current.removeAllListeners();

      rosRef.current.connect(ROS_BRIDGE_API_URL);

      rosRef.current.on('connection', () => {
        if (!abortController.current.signal.aborted) {
          showLog('Connected to ROS', 'success');
        }
      });

      rosRef.current.on('error', () => {
        if (!abortController.current.signal.aborted) {
          showLog('Error connecting to ROS', 'error');
        }
      });

      rosRef.current.on('close', () => {
        if (!abortController.current.signal.aborted) {
          showLog('Disconnected from ROS, reconnecting...', 'warning');
          setTimeout(() => {
            if (!rosRef.current.isConnected) {
              connect();
            }
          }, 1000);
        }
      });
    };

    connect();

    return () => {
      if (rosRef.current) {
        if (rosRef.current.isConnected) {
          rosRef.current.removeAllListeners();
          rosRef.current.close();
          abortController.current.abort();
          showLog('ROS connection closed');
        }
      }
    };
  }, []);

  return (
    <RosContext.Provider value={{ ros: rosRef.current }}>
      {children}
    </RosContext.Provider>
  );
}

export default RosProvider;
