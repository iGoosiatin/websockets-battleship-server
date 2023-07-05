import RoomModel from './room';
import { AuthedWebSocket, Ship } from '../types/common';

export default class RoomService {
  private rooms: RoomModel[] = [];

  createRoom(ws: AuthedWebSocket) {
    const room = new RoomModel(ws);
    this.rooms.push(room);
    return room;
  }

  addPlayerToRoom(ws: AuthedWebSocket, indexRoom: number) {
    const room = this.rooms.find(({ roomId }) => roomId === indexRoom);
    if (!room) {
      return;
    }

    // Do not enter your own room
    if (room.roomUsers.find((roomUser) => roomUser.index === ws.index)) {
      return;
    }

    room.roomUsers.push({ name: ws.name, index: ws.index });
    room.sockets.push(ws);

    room.createGame();
  }

  addShipsToGame(gameId: number, playerIndex: number, ships: Ship[]) {
    const room = this.rooms.find(({ game }) => game.idGame === gameId);
    if (!room) {
      return;
    }

    room.setPlayerShips(playerIndex, ships);
  }

  getRooms() {
    return this.rooms
      .filter(({ roomUsers }) => roomUsers.length < 2)
      .map(({ roomId, roomUsers }) => ({ roomId, roomUsers }));
  }
}
