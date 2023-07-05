import { IncomingCommand, IncomingMessage } from '../types/incoming';
import UserService from '../user/user_service';
import { OutgoingCommand, OutgoingData } from '../types/outgoing';
import { WebSocket } from 'ws';
import RoomService from '../room/room_service';
import { AuthedWebSocket } from '../types/common';

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
        const registrationResponse = this.buildOutgoingMessage(OutgoingCommand.Register, result);
        ws.send(registrationResponse);

        const rooms = this.roomService.getRooms();
        const roomsResponse = this.buildOutgoingMessage(OutgoingCommand.UpdateRoom, rooms);
        ws.send(roomsResponse);

        const winners = this.userService.getWinners();
        const winnersResponse = this.buildOutgoingMessage(OutgoingCommand.UpdateWinners, winners);
        this.broadcast(winnersResponse);
        break;
      }
      case IncomingCommand.CreateRoom: {
        const room = this.roomService.createRoom(ws as AuthedWebSocket);
        // Create game here;

        const rooms = this.roomService.getRooms();
        const roomsResponse = this.buildOutgoingMessage(OutgoingCommand.UpdateRoom, rooms);
        this.broadcast(roomsResponse);
        break;
      }

      case IncomingCommand.AddPlayerToRoom: {
        const {
          data: { indexRoom },
        } = message;

        const room = this.roomService.addPlayerToRoom(ws as AuthedWebSocket, indexRoom);

        if (!room) {
          break;
        }
        // invite to game

        const rooms = this.roomService.getRooms();
        const roomsResponse = this.buildOutgoingMessage(OutgoingCommand.UpdateRoom, rooms);
        this.broadcast(roomsResponse);
        break;
      }
      default: {
        console.log('Unknown command received');
        return null;
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

  private buildOutgoingMessage(type: OutgoingCommand, data: OutgoingData) {
    return JSON.stringify({
      type,
      data: JSON.stringify(data),
      id: 0,
    });
  }
}
