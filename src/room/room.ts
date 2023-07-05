import Game from '../game';
import { AuthedWebSocket, Position, Room, Ship, User } from '../types/common';
import { CreateGameData, OutgoingCommand, StartGameData } from '../types/outgoing';
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
      const gameDetails: CreateGameData = {
        idGame: this.game.idGame,
        idPlayer: this.getOtherPlayer(ws.index),
      };
      const createGameResponse = buildOutgoingMessage(OutgoingCommand.CreateGame, gameDetails);
      ws.send(createGameResponse);
    });
  }

  setPlayerShips(playerIndex: number, ships: Ship[]) {
    if (this.game.ships.size === 0) {
      this.game.setCurrentPlayer(playerIndex);
    }

    this.game.ships.set(playerIndex, ships);

    if (this.game.ships.size === 2) {
      this.game.createBattlefieldMatrix();
      const currentPlayerIndex = this.game.getCurrentPlayer();

      this.sockets.forEach((ws) => {
        const gameDetails: StartGameData = {
          currentPlayerIndex,
          ships: this.game.ships.get(ws.index) as Ship[],
        };
        const createGameResponse = buildOutgoingMessage(OutgoingCommand.StartGame, gameDetails);
        ws.send(createGameResponse);
      });
    }
  }

  handleAttack(playerId: number, target: Position | null): boolean {
    const enemyId = this.getOtherPlayer(playerId);
    const result = this.game.handleAttack(playerId, enemyId, target);
    const isEndOfGame = this.game.checkEndOfGame(enemyId);

    this.sockets.forEach((ws) => {
      const createGameResponse = buildOutgoingMessage(OutgoingCommand.Attack, result);
      ws.send(createGameResponse);

      if (isEndOfGame) {
        const endOfGameResponse = buildOutgoingMessage(OutgoingCommand.Finish, { winPlayer: playerId });
        ws.send(endOfGameResponse);
      }
    });

    return isEndOfGame;
  }

  private getOtherPlayer(currentPlayerId: number) {
    return this.roomUsers.find(({ index }) => index !== currentPlayerId)?.index as number;
  }
}
