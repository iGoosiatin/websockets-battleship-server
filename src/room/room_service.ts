import RoomModel from './room';
import { AuthedWebSocket, Position, Ship } from '../types/common';
import SinglePlayService from '../single_play/single_play_service';

export default class RoomService {
  private rooms: RoomModel[] = [];
  private singlePlayService: SinglePlayService;

  constructor(singlePlayService: SinglePlayService) {
    this.singlePlayService = singlePlayService;
  }

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
    const roomToEnter = this.getRoomByRoomId(indexRoom);
    if (!roomToEnter) {
      console.log('Skipped room entering: room not found');
      return;
    }

    const potentialPlayersRoom = this.getRoomByUserId(ws.index);

    if (potentialPlayersRoom) {
      // Do not enter your own room
      if (potentialPlayersRoom.roomId === indexRoom) {
        console.log('Skipped room entering: player cannot enter his own room');
        return;
      }
      // Close own room
      this.closeRoom(potentialPlayersRoom.roomId);
    }

    roomToEnter.roomUsers.push({ name: ws.name, index: ws.index });
    roomToEnter.sockets.push(ws);

    roomToEnter.createGame();
  }

  addShipsToGame(gameId: number, playerIndex: number, ships: Ship[]) {
    const room = this.getRoomByGameId(gameId);
    if (!room) {
      const game = this.singlePlayService.getGameById(gameId);
      if (!game) {
        console.log('Skipped ships adding: no room/game found');
        return;
      }
      this.singlePlayService.addPlayerShips(gameId, playerIndex, ships);
      return;
    }

    room.setPlayerShips(playerIndex, ships);
  }

  handleAttack(gameId: number, playerId: number, target: Position | null) {
    const room = this.getRoomByGameId(gameId);
    if (!room) {
      const game = this.singlePlayService.getGameById(gameId);
      if (!game) {
        console.log('Skipped attack: no room/game found');
        return;
      }
      this.singlePlayService.handlePlayerAttack(gameId, target);
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

  handleDisconnectedUser(id: number) {
    let shouldUpdateRooms = false;
    let shouldUpdateWinners = false;
    const room = this.getRoomByUserId(id);

    if (!room) {
      return { shouldUpdateRooms, shouldUpdateWinners };
    }

    shouldUpdateRooms = true;
    if (!room.game) {
      return { shouldUpdateRooms, shouldUpdateWinners };
    }

    shouldUpdateWinners = true;
    const winner = room.forceEndGame(id);
    this.closeRoom(room.roomId);
    return { shouldUpdateRooms, shouldUpdateWinners, winner };
  }
}
