import { AttackData, IncomingCommand, IncomingMessage } from '../types/incoming';
import UserService from '../user/user_service';
import { OutgoingCommand } from '../types/outgoing';
import { WebSocket } from 'ws';
import RoomService from '../room/room_service';
import { AuthedWebSocket, Position } from '../types/common';
import { buildOutgoingMessage } from '../utils';
import SinglePlayService from '../single_play/single_play_service';

export default class GameController {
  private broadcast: (message: string) => void;
  private userService = new UserService();
  private singlePlayService = new SinglePlayService();
  private roomService = new RoomService(this.singlePlayService);

  constructor(broadcast: (message: string) => void) {
    this.broadcast = broadcast;
  }

  processIncomingMessage(ws: WebSocket, rawMessage: string) {
    console.log(`Received: ${rawMessage}`);
    const message = this.parseRawIncomingMessage(rawMessage);

    if (!message) {
      return null;
    }

    switch (message.type) {
      case IncomingCommand.Register: {
        const {
          data: { name, password },
        } = message;
        const result = this.userService.register(name, password, ws);
        const registrationResponse = buildOutgoingMessage(OutgoingCommand.Register, result);
        console.log(`Responded personally: ${registrationResponse}`);
        ws.send(registrationResponse);

        const rooms = this.roomService.getRooms();
        const roomsResponse = buildOutgoingMessage(OutgoingCommand.UpdateRoom, rooms);
        console.log(`Responded personally: ${roomsResponse}`);
        ws.send(roomsResponse);

        const winners = this.userService.getWinners();
        const winnersResponse = buildOutgoingMessage(OutgoingCommand.UpdateWinners, winners);
        console.log(`Broadcasted: ${winnersResponse}`);
        this.broadcast(winnersResponse);
        break;
      }
      case IncomingCommand.CreateRoom: {
        const room = this.roomService.createRoom(ws as AuthedWebSocket);

        if (room) {
          const rooms = this.roomService.getRooms();
          const roomsResponse = buildOutgoingMessage(OutgoingCommand.UpdateRoom, rooms);
          console.log(`Broadcasted: ${roomsResponse}`);
          this.broadcast(roomsResponse);
        }
        break;
      }

      case IncomingCommand.AddPlayerToRoom: {
        const {
          data: { indexRoom },
        } = message;

        this.roomService.addPlayerToRoom(ws as AuthedWebSocket, indexRoom);

        const rooms = this.roomService.getRooms();
        const roomsResponse = buildOutgoingMessage(OutgoingCommand.UpdateRoom, rooms);
        this.broadcast(roomsResponse);
        console.log(`Broadcasted: ${roomsResponse}`);
        break;
      }
      case IncomingCommand.AddShips: {
        const {
          data: { gameId, indexPlayer, ships },
        } = message;

        this.roomService.addShipsToGame(gameId, indexPlayer, ships);
        break;
      }
      case IncomingCommand.Attack:
      case IncomingCommand.RandomAttack: {
        const { data } = message;
        const { gameId, indexPlayer } = data;

        const { x, y } = data as AttackData;

        const target: Position | null = x !== undefined && y !== undefined ? { x, y } : null;

        const isEndOfGame = this.roomService.handleAttack(gameId, indexPlayer, target);

        if (isEndOfGame) {
          this.userService.processWinner(indexPlayer);
          const winners = this.userService.getWinners();
          const winnersResponse = buildOutgoingMessage(OutgoingCommand.UpdateWinners, winners);
          console.log(`Broadcasted: ${winnersResponse}`);
          this.broadcast(winnersResponse);
        }
        break;
      }
      case IncomingCommand.SinglePlay: {
        this.singlePlayService.startGame(ws as AuthedWebSocket);
        break;
      }
      default: {
        console.log('Unknown command received');
      }
    }
  }

  handleDisconnectedSocket(ws: WebSocket) {
    const { index, name } = ws as AuthedWebSocket;
    if (index === undefined) {
      console.log('Received: unknown user disconnect');
    } else {
      console.log(`Received: user ${name} disconnect`);
      const { shouldUpdateRooms, shouldUpdateWinners, winner } = this.roomService.handleDisconnectedUser(index);

      if (shouldUpdateRooms) {
        const rooms = this.roomService.getRooms();
        const roomsResponse = buildOutgoingMessage(OutgoingCommand.UpdateRoom, rooms);
        this.broadcast(roomsResponse);
        console.log(`Broadcasted: ${roomsResponse}`);
      }

      if (shouldUpdateWinners) {
        winner !== undefined && this.userService.processWinner(winner);
        const winners = this.userService.getWinners();
        const winnersResponse = buildOutgoingMessage(OutgoingCommand.UpdateWinners, winners);
        console.log(`Broadcasted: ${winnersResponse}`);
        this.broadcast(winnersResponse);
      }
    }
  }

  private parseRawIncomingMessage(stringifiedMessage: string) {
    try {
      const { data: rawData, ...restMessage } = JSON.parse(stringifiedMessage);
      const data = rawData === '' ? rawData : JSON.parse(rawData);
      return {
        ...restMessage,
        data,
      } as IncomingMessage;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
