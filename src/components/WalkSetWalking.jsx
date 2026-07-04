import React, { useContext, useEffect, useRef } from 'react';
import { Message, Topic } from 'roslib';

import NumberField from './NumberField';
import SwitchActive from './SwitchActive';
import AppContext from '../context/AppContext';
import { useRos } from '../context/RosContext';

function WalkSetWalking() {
  const { main } = useContext(AppContext);
  const { ros } = useRos();
  const setWalkingTopicRef = useRef(null);
  const resetPitch = useRef(null);

  const toggleMain = () => {
    ['x', 'y', 'a'].forEach((prop) => {
      main[prop] *= main.start;
    });
  };

  setWalkingTopicRef.current = new Topic({
    ros,
    name: 'walking/set_walking',
    messageType: 'aruku_interfaces/msg/SetWalking',
  });

  resetPitch.current = new Topic({
    ros,
    name: 'measurement/reset_pitch',
    messageType: 'std_msgs/Empty',
  });

  const handleSetWalking = () => {
    if (!ros) return;
    toggleMain();

    const setWalkingMessage = new Message({
      run: main.start,
      x_move: main.x,
      y_move: main.y,
      a_move: main.a,
      aim_on: main.aim,
    });

    setWalkingTopicRef.current.publish(setWalkingMessage);
  };

  useEffect(() => {
    handleSetWalking();
  }, [main]);

  useEffect(() => {
    if (!ros) return;
    resetPitch.current.publish(new Message({}));
  }, [main.start]);

  return (
    <div>
      {Object.keys(main).map((name) => {
        if (typeof main[name] === 'boolean') {
          return (
            <SwitchActive
              key={name}
              name={name}
              value={main[name]}
              type="main"
            />
          );
        }
        return (
          <NumberField
            key={name}
            keys={name}
            value={main[name] * main.start}
            type="main"
          />
        );
      })}
    </div>
  );
}

export default WalkSetWalking;
