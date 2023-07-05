import { WebSocket } from 'ws';

export interface Identification {
  id: number;
}

export enum ShipType {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  huge = 'huge',
}

export enum AttackStatus {
  Miss = 'miss',
  Killed = 'killed',
  Shot = 'shot',
}

export interface Position {
  x: number;
  y: number;
}

export interface Ship {
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
