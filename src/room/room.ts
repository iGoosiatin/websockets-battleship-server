import Game from '../game';
import { AttackStatus, AuthedWebSocket, Position, Room, Ship, User } from '../types/common';
import { CreateGameData, OutgoingCommand, StartGameData } from '../types/outgoing';
import { buildOutgoingMessage } from '../utils';

export default class RoomModel implements Room {
  private static index = 0;
  sockets: AuthedWebSocket[] = [];
  roomId: number;
  endOfGame = false;
  attackInProcess = false;
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
        idPlayer: ws.index,
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
    if (this.attackInProcess || this.endOfGame) {
      return false;
    }
    const currentPlayerId = this.game.getCurrentPlayer();

    if (currentPlayerId !== playerId) {
      return false;
    }

    this.attackInProcess = true;
    const enemyId = this.getOtherPlayer(playerId);
    const result = this.game.handleAttack(playerId, enemyId, target);
    this.endOfGame = this.game.checkEndOfGame(enemyId);

    this.sockets.forEach((ws) => {
      const createGameResponse = buildOutgoingMessage(OutgoingCommand.Attack, result);
      ws.send(createGameResponse);

      if (result.status === AttackStatus.Miss) {
        this.game.setCurrentPlayer(enemyId);
        const changeTurnResponse = buildOutgoingMessage(OutgoingCommand.ChangeTurn, { currentPlayer: enemyId });
        ws.send(changeTurnResponse);
      }

      if (this.endOfGame) {
        const endOfGameResponse = buildOutgoingMessage(OutgoingCommand.Finish, { winPlayer: playerId });
        ws.send(endOfGameResponse);
      }
    });
    this.attackInProcess = false;
    return this.endOfGame;
  }

  private getOtherPlayer(currentPlayerId: number) {
    return this.roomUsers.find(({ index }) => index !== currentPlayerId)?.index as number;
  }
}
