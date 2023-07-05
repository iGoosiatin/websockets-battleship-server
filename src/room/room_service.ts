import RoomModel from './room';
import { AuthedWebSocket, Position, Ship } from '../types/common';

export default class RoomService {
  private rooms: RoomModel[] = [];

  createRoom(ws: AuthedWebSocket) {
    const existingRoom = this.getRoomByUserId(ws.index);
    if (existingRoom) {
      return null;
    }

    const room = new RoomModel(ws);
    this.rooms.push(room);
    return room;
  }

  addPlayerToRoom(ws: AuthedWebSocket, indexRoom: number) {
    const room = this.getRoomByRoomId(indexRoom);
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
    const room = this.getRoomByGameId(gameId);
    if (!room) {
      return;
    }

    room.setPlayerShips(playerIndex, ships);
  }

  handleAttack(gameId: number, playerId: number, target: Position | null) {
    const room = this.getRoomByGameId(gameId);
    if (!room) {
      return;
    }

    return room.handleAttack(playerId, target);
  }

  getRooms() {
    return this.rooms
      .filter(({ roomUsers }) => roomUsers.length < 2)
      .map(({ roomId, roomUsers }) => ({ roomId, roomUsers }));
  }

  private getRoomByRoomId(id: number) {
    const room = this.rooms.find(({ roomId }) => roomId === id);
    return room || null;
  }

  private getRoomByGameId(id: number) {
    const room = this.rooms.find(({ game }) => game.idGame === id);
    return room || null;
  }

  private getRoomByUserId(id: number) {
    const room = this.rooms.find(({ roomUsers }) => roomUsers.find((roomUser) => roomUser.index === id));
    return room || null;
  }
}
