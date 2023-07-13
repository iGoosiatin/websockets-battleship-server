import { OutgoingCommand, OutgoingData } from '../types/outgoing';

export const buildOutgoingMessage = (type: OutgoingCommand, data: OutgoingData) => {
  return JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0,
  });
};

export const getRandom = (rangeStart: number, rangeEnd: number) => {
  if (rangeStart >= rangeEnd) {
    throw new Error('Range start cannot be equal or greater that end');
  }
  return Math.floor(Math.random() * (rangeEnd - rangeStart + 1) + rangeStart);
};
