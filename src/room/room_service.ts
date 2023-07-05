import RoomModel from './room';
import { AuthedWebSocket } from '../types/common';

export default class RoomService {
  private rooms: RoomModel[] = [];

  createRoom(ws: AuthedWebSocket) {
    const room = new RoomModel(ws);
    this.rooms.push(room);
    return room;
  }

  addPlayerToRoom(ws: AuthedWebSocket, indexRoom: number) {
    const room = this.rooms.find(({ roomId }) => roomId === indexRoom);
    if (room) {
      room.roomUsers.push({ name: ws.name, index: ws.index });
      room.sockets.push(ws);

      room.createGame();
    }
    return null;
  }

  getRooms() {
    return this.rooms
      .filter(({ roomUsers }) => roomUsers.length < 2)
      .map(({ roomId, roomUsers }) => ({ roomId, roomUsers }));
  }
}
