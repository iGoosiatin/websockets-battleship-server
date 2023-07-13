import { AttackStatus, Identification, Position, Room, Ship, User, Winner } from './common';

export enum OutgoingCommand {
  Register = 'reg',
  UpdateWinners = 'update_winners',
  CreateGame = 'create_game',
  StartGame = 'start_game',
  UpdateRoom = 'update_room',
  Attack = 'attack',
  ChangeTurn = 'turn',
  Finish = 'finish',
}

export interface RegisterData extends User {
  error: boolean;
  errorText: string;
}

export type UpdateWinnersData = Winner[];

export type UpdateRoomData = Room[];

export interface CreateGameData {
  idGame: number;
  idPlayer: number;
}

export interface StartGameData {
  currentPlayerIndex: number;
  ships: Ship[];
}

export interface CurrentPlayerData {
  currentPlayer: number;
}

export interface AttackData extends CurrentPlayerData {
  position: Position;
  status: AttackStatus;
}

export interface FinishData {
  winPlayer: number;
}

export type OutgoingData =
  | RegisterData
  | UpdateWinnersData
  | UpdateRoomData
  | CreateGameData
  | StartGameData
  | CurrentPlayerData
  | AttackData
  | FinishData;

export interface OutgoingMessage extends Identification {
  type: OutgoingCommand;
  data: string;
}
