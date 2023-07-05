import { IncomingCommand, IncomingMessage } from '../types/incoming';
import UserService from '../user/user_service';
import { OutgoingCommand } from '../types/outgoing';
import { WebSocket } from 'ws';
import RoomService from '../room/room_service';
import { AuthedWebSocket } from '../types/common';
import { buildOutgoingMessage } from '../utils';

export default class GameController {
  private broadcast: (message: string) => void;
  private userService = new UserService();
  private roomService = new RoomService();

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
        ws.send(registrationResponse);

        const rooms = this.roomService.getRooms();
        const roomsResponse = buildOutgoingMessage(OutgoingCommand.UpdateRoom, rooms);
        ws.send(roomsResponse);

        const winners = this.userService.getWinners();
        const winnersResponse = buildOutgoingMessage(OutgoingCommand.UpdateWinners, winners);
        this.broadcast(winnersResponse);
        break;
      }
      case IncomingCommand.CreateRoom: {
        this.roomService.createRoom(ws as AuthedWebSocket);

        const rooms = this.roomService.getRooms();
        const roomsResponse = buildOutgoingMessage(OutgoingCommand.UpdateRoom, rooms);
        this.broadcast(roomsResponse);
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
        break;
      }
      case IncomingCommand.AddShips: {
        const {
          data: { gameId, indexPlayer, ships },
        } = message;

        this.roomService.addShipsToGame(gameId, indexPlayer, ships);
        break;
      }
      default: {
        console.log('Unknown command received');
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
