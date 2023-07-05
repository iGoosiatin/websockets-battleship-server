import { Identification, ShipToAdd } from './common';

export enum IncomingCommand {
  Register = 'reg',
  CreateRoom = 'create_room',
  AddPlayerToRoom = 'add_user_to_room',
  AddShips = 'add_ships',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
}

export interface RegisterData {
  name: string;
  password: string;
}

export interface AddPlayerToRoomData {
  indexRoom: number;
}

export interface GeneralGameData {
  gameId: number;
  indexPlayer: number;
}

export interface AddShipsData extends GeneralGameData {
  ships: ShipToAdd[];
}

export interface AttackData extends GeneralGameData {
  x: number;
  y: number;
}

export interface IncomingRegisterCommand extends Identification {
  type: IncomingCommand.Register;
  data: RegisterData;
}

export interface IncomingCreateRoomCommand extends Identification {
  type: IncomingCommand.CreateRoom;
  data: '';
}

export interface IncomingAddPlayerToRoomCommand extends Identification {
  type: IncomingCommand.AddPlayerToRoom;
  data: AddPlayerToRoomData;
}

export interface IncomingAddShipsCommand extends Identification {
  type: IncomingCommand.AddShips;
  data: AddShipsData;
}

export interface IncomingAttackCommand extends Identification {
  type: IncomingCommand.Attack;
  data: AttackData;
}

export interface IncomingRandomAttackCommand extends Identification {
  type: IncomingCommand.RandomAttack;
  data: GeneralGameData;
}

export type IncomingMessage =
  | IncomingRegisterCommand
  | IncomingCreateRoomCommand
  | IncomingAddPlayerToRoomCommand
  | IncomingAddShipsCommand
  | IncomingAttackCommand
  | IncomingRandomAttackCommand;

export type RawIncomingMessage = Identification & {
  type: IncomingCommand;
  data: string;
};
