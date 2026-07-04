import React, { useState, useRef } from 'react';
import { Topic, Message } from 'roslib';

import LoadingButton from '@mui/lab/LoadingButton';

import { useRos } from '../context/RosContext';

function CancelActionButton() {
  const { ros } = useRos();
  const [isLoading, setIsLoading] = useState(false);
  const cancelActionTopicRef = useRef(null);

  cancelActionTopicRef.current = new Topic({
    ros,
    name: 'action/cancel_action',
    messageType: 'std_msgs/msg/Empty',
  });

  const cancelActionMessage = new Message({});

  const handleClick = () => {
    setIsLoading(true);
    cancelActionTopicRef.current.publish(cancelActionMessage);
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
      Cancel Action
    </LoadingButton>
  );
}

export default CancelActionButton;
