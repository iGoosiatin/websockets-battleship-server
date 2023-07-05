import { OutgoingCommand, OutgoingData } from '../types/outgoing';

export const buildOutgoingMessage = (type: OutgoingCommand, data: OutgoingData) => {
  return JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0,
  });
};
