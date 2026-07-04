import { useEffect, useRef, useState, useContext } from 'react';
import { Topic } from 'roslib';

import DecodeBase64 from '../../utils/DecodeBase64';
import LoggerContext from '../context/LoggerContext';

const ImageSubscriber = ({
  ros,
  topicName,
  messageType,
  throttleRate = 100,
  idElement,
}) => {
  const { showLog } = useContext(LoggerContext);
  const topicRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const ctxRef = useRef(canvasRef.current.getContext('2d'));
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribe = () => {
    if (!isSubscribed && topicRef.current) {
      topicRef.current.subscribe(async (message) => {
        const { width, height, encoding, data } = message;

        if (encoding !== 'bgr8') {
          showLog(`Unsupported encoding: ${encoding}`);
          return;
        }

        const buffer = DecodeBase64(data);
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        const imageData = ctxRef.current.createImageData(width, height);

        let j = 0;
        for (let i = 0; i < buffer.length; i += 3) {
          imageData.data[j] = buffer[i + 2];
          imageData.data[j + 1] = buffer[i + 1];
          imageData.data[j + 2] = buffer[i];
          imageData.data[j + 3] = 255;
          j += 4;
        }

        const bitmap = await createImageBitmap(imageData);
        ctxRef.current.drawImage(bitmap, 0, 0);
        document.getElementById(idElement).src = canvasRef.current.toDataURL();
      });

      setIsSubscribed(true);
    }
  };

  const unsubscribe = () => {
    topicRef.current?.unsubscribe();
    topicRef.current?.removeAllListeners();
    setIsSubscribed(false);
  };

  useEffect(() => {
    if (ros) {
      topicRef.current = new Topic({
        ros,
        name: topicName,
        messageType,
        throttle_rate: throttleRate,
      });
    }

    return () => {
      unsubscribe();
    };
  }, [ros]);

  return { subscribe, unsubscribe, isSubscribed };
};

export default ImageSubscriber;
