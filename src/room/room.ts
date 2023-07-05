import { AuthedWebSocket, Room, User } from '../types/common';

export default class RoomModel implements Room {
  private static index = 0;
  sockets: AuthedWebSocket[] = [];
  roomId: number;
  roomUsers: User[] = [];
  //game = newGame()

  constructor(ws: AuthedWebSocket) {
    this.sockets.push(ws);
    this.roomUsers.push({ name: ws.name, index: ws.index });
    this.roomId = RoomModel.index;
    RoomModel.index++;
    return this;
  }
}
