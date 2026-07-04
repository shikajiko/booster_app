import { createContext, useContext } from 'react';

const RosContext = createContext();

export const useRos = () => useContext(RosContext);

export default RosContext;
