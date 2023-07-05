import { WebSocket } from 'ws';

export interface Identification {
  id: number;
}

export type ShipType = 'small' | 'medium' | 'large' | 'huge';

export type AttackStatus = 'miss' | 'killed' | 'shot';

export interface Position {
  x: number;
  y: number;
}

export interface ShipToAdd {
  position: Position;
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface User {
  name: string;
  index: number;
}

export interface AuthedWebSocket extends WebSocket, User {}

export interface Winner {
  name: string;
  wins: number;
}

export interface Room {
  roomId: number;
  roomUsers: User[];
}
