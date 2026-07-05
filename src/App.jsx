import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Box from '@mui/material/Box';

import ActionManager from './pages/ActionManager';
import AppContext from './context/AppContext';
import LoggerProvider from './components/LoggerProvider';
import RosProvider from './components/RosProvider';
import Home from './pages/Home';
import TrackRouteChange from './components/TrackRouteChange';
import DisableArrowScroll from './components/DisableArrowScroll';

function App() {
  const [fetched, setFetched] = useState(false);
  // Action Manager
  const [actionsData, setActionsData] = useState([]);
  const [posesData, setPosesData] = useState([]);
  const [jointPoseData, setJointPoseData] = useState([]);
  const [jointRobotData, setJointRobotData] = useState([]);
  const [jointSelected, setJointSelected] = useState([]);
  const [currentAction, setCurrentAction] = useState({});
  const [currentPose, setCurrentPose] = useState({});

  const updateActionsData = (newAction) => {
    setCurrentAction(newAction);
    const newActionsData = [
      ...actionsData.slice(0, newAction.id),
      newAction,
      ...actionsData.slice(newAction.id + 1),
    ];
    setActionsData(newActionsData);
  };

  const updatePosesData = (newPose, typeData) => {
    setCurrentPose(newPose);
    let newPosesData = [];
    if (typeData === 'delete') {
      newPosesData = [
        ...posesData.slice(0, newPose.id),
        ...posesData.slice(newPose.id + 1),
      ];
      for (let i = newPose.id; i < newPosesData.length; i += 1) {
        newPosesData[i].id = i;
      }
    } else {
      newPosesData = [
        ...posesData.slice(0, newPose.id),
        newPose,
        ...posesData.slice(newPose.id + 1),
      ];
    }
    setPosesData(newPosesData);

    const newAction = {
      id: currentAction.id,
      name: currentAction.name,
      next: currentAction.next,
      control_type: currentAction.control_type,
      poses: newPosesData,
    };
    updateActionsData(newAction);
  };

  return (
    <AppContext.Provider
      value={{
        fetched,
        actionsData,
        posesData,
        jointPoseData,
        jointRobotData,
        jointSelected,
        currentAction,
        currentPose,
        setFetched,
        setActionsData,
        setPosesData,
        setJointPoseData,
        setJointRobotData,
        setJointSelected,
        setCurrentAction,
        setCurrentPose,
        updateActionsData,
        updatePosesData
    }}
    >
      <DisableArrowScroll />
      <LoggerProvider>
        <RosProvider>
          <div className="root">
            <Router>
              <TrackRouteChange />
              <Header />
              <Box sx={{ marginTop: 10, marginBottom: 5 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/action_manager" element={<ActionManager />} />
                </Routes>
              </Box>
            </Router>
          </div>
        </RosProvider>
      </LoggerProvider>
    </AppContext.Provider>
  );
}

export default App;
