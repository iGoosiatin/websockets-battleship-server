import RoomModel from './room';
import { AuthedWebSocket, Position, Ship } from '../types/common';

export default class RoomService {
  private rooms: RoomModel[] = [];

  createRoom(ws: AuthedWebSocket) {
    const existingRoom = this.getRoomByUserId(ws.index);
    if (existingRoom) {
      console.log('Skipped room creation: player cannot create more than 1 room');
      return null;
    }

    const room = new RoomModel(ws);
    this.rooms.push(room);
    return room;
  }

  addPlayerToRoom(ws: AuthedWebSocket, indexRoom: number) {
    const room = this.getRoomByRoomId(indexRoom);
    if (!room) {
      console.log('Skipped room entering: room not found');
      return;
    }

    // Do not enter your own room
    if (this.getRoomByUserId(ws.index)) {
      console.log('Skipped room entering: player cannot enter his own room');
      return;
    }

    room.roomUsers.push({ name: ws.name, index: ws.index });
    room.sockets.push(ws);

    room.createGame();
  }

  addShipsToGame(gameId: number, playerIndex: number, ships: Ship[]) {
    const room = this.getRoomByGameId(gameId);
    if (!room) {
      console.log('Skipped skips adding: no room/game found');
      return;
    }

    room.setPlayerShips(playerIndex, ships);
  }

  handleAttack(gameId: number, playerId: number, target: Position | null) {
    const room = this.getRoomByGameId(gameId);
    if (!room) {
      console.log('Skipped attack: no room/game found');
      return;
    }

    const isEndOfGame = room.handleAttack(playerId, target);

    if (isEndOfGame) {
      this.closeRoom(room.roomId);
    }

    return isEndOfGame;
  }

  getRooms() {
    return this.rooms
      .filter(({ roomUsers }) => roomUsers.length < 2)
      .map(({ roomId, roomUsers }) => ({ roomId, roomUsers }));
  }

  private closeRoom(id: number) {
    this.rooms = this.rooms.filter(({ roomId }) => roomId !== id);
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
