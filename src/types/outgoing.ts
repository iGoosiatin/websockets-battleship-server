import { AttackStatus, Identification, Position, User } from './common';

export enum OutgoingCommand {
  Register = 'reg',
  UpdateWinners = 'update_winners',
  CreateGame = 'create_game',
  UpdateRoom = 'update_room',
  Attack = 'attack',
  ChangeTurn = 'turn',
  Finish = 'finish',
}

export interface RegisterData extends User {
  error: boolean;
  errorText: string;
}

export interface UpdateWinnersData {
  name: string;
  wins: number;
}

export interface CreateGameData {
  idGame: number;
  idPlayer: number;
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
  | CreateGameData
  | CurrentPlayerData
  | AttackData
  | FinishData;

export interface OutgoingMessage extends Identification {
  type: OutgoingCommand;
  data: string;
}
