import Game from '../game';
import { AuthedWebSocket, Room, User } from '../types/common';
import { OutgoingCommand } from '../types/outgoing';
import { buildOutgoingMessage } from '../utils';

export default class RoomModel implements Room {
  private static index = 0;
  sockets: AuthedWebSocket[] = [];
  roomId: number;
  roomUsers: User[] = [];
  game: Game;

  constructor(ws: AuthedWebSocket) {
    this.sockets.push(ws);
    this.roomUsers.push({ name: ws.name, index: ws.index });
    this.roomId = RoomModel.index;
    RoomModel.index++;
    return this;
  }

  createGame() {
    this.game = new Game();
    this.sockets.forEach((ws) => {
      const gameDetails = {
        idGame: this.game.idGame,
        idPlayer: this.roomUsers.find(({ index }) => index !== ws.index)?.index as number,
      };
      const createGameResponse = buildOutgoingMessage(OutgoingCommand.CreateGame, gameDetails);
      ws.send(createGameResponse);
    });
  }
}
