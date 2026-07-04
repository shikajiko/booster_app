import React, { useState, useRef } from 'react';
import { Topic, Message } from 'roslib';

import LoadingButton from '@mui/lab/LoadingButton';

import { useRos } from '../context/RosContext';

function BrakeActionButton() {
  const { ros } = useRos();
  const [isLoading, setIsLoading] = useState(false);
  const brakeActionTopicRef = useRef(null);

  brakeActionTopicRef.current = new Topic({
    ros,
    name: 'action/brake_action',
    messageType: 'std_msgs/msg/Empty',
  });

  const brakeActionMessage = new Message({});

  const handleClick = () => {
    setIsLoading(true);
    brakeActionTopicRef.current.publish(brakeActionMessage);
    setIsLoading(false);
  };

  return (
    <LoadingButton
      onClick={handleClick}
      style={{
        margin: 5,
        paddingLeft: 16,
        paddingRight: 16,
      }}
      color="error"
      variant="contained"
      sx={{ margin: 2 }}
      loading={isLoading}
    >
      Brake Action
    </LoadingButton>
  );
}

export default BrakeActionButton;
