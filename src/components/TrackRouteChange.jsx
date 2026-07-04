import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Topic, Message } from 'roslib';

import { useRos } from '../context/RosContext';

function TrackRouteChange() {
  const { ros } = useRos();
  const competitionTrackRouteTopicRef = useRef(null);
  const [currentLoc, setCurrentLoc] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (!ros) return;

    setCurrentLoc(location.pathname);
    if (!competitionTrackRouteTopicRef.current) {
      competitionTrackRouteTopicRef.current = new Topic({
        ros,
        name: 'competition/app_status',
        messageType: 'competition_interfaces/msg/AppStatus',
      });
    }

    let actionManagerStatus = false;
    let walkSettingStatus = false;

    switch (location.pathname) {
      case '/action_manager':
        actionManagerStatus = true;
        break;
      case '/walk_settings':
      case '/init_settings':
        walkSettingStatus = true;
        break;
      default:
        break;
    }

    const appStatusMessage = new Message({
      action_manager_status: actionManagerStatus,
      walk_setting_status: walkSettingStatus,
    });

    competitionTrackRouteTopicRef.current.publish(appStatusMessage);
  }, [location, ros]);

  useEffect(() => {
    if (ros && location.pathname !== currentLoc) {
      ros.removeAllListeners();
    }
  }, [location]);

  return null;
}

export default TrackRouteChange;
