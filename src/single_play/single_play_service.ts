import { SHIP_LAYOUTS } from './shipLayouts';
import { CreateGameData, OutgoingCommand, StartGameData } from '../types/outgoing';
import { buildOutgoingMessage, getRandom } from '../utils';
import { AuthedWebSocket, Position, Ship } from '../types/common';
import SinglePlayGame from './single_play_game';

const getRandomZeroToNine = getRandom.bind(null, 0, 9);

export default class SinglePlayService {
  private static BOT_ID = -1;
  private shipLayouts = SHIP_LAYOUTS;
  private singlePlayGames: SinglePlayGame[] = [];

  startGame(ws: AuthedWebSocket) {
    const singlePlayGame = new SinglePlayGame(ws, SinglePlayService.BOT_ID);
    this.singlePlayGames.push(singlePlayGame);
    const gameDetails: CreateGameData = {
      idGame: singlePlayGame.game.idGame,
      idPlayer: ws.index,
    };
    const createGameResponse = buildOutgoingMessage(OutgoingCommand.CreateGame, gameDetails);
    console.log(`Responded personally: ${createGameResponse}`);
    ws.send(createGameResponse);
  }

  getGameById(id: number) {
    return this.singlePlayGames.find(({ game: { idGame } }) => idGame === id)?.game || null;
  }

  getSinglePlay(id: number) {
    return this.singlePlayGames.find(({ game: { idGame } }) => idGame === id) as SinglePlayGame;
  }

  addPlayerShips(gameId: number, playerId: number, ships: Ship[]) {
    const { game, ws } = this.getSinglePlay(gameId);

    game.ships.set(playerId, ships);
    game.ships.set(SinglePlayService.BOT_ID, this.getBotShipLayout());

    game.setCurrentPlayer(playerId);

    game.startGame();

    const gameDetails: StartGameData = {
      currentPlayerIndex: playerId,
      ships,
    };

    const startGameResponse = buildOutgoingMessage(OutgoingCommand.StartGame, gameDetails);
    console.log(`Responded personally: ${startGameResponse}`);
    ws.send(startGameResponse);
  }

  handlePlayerAttack(gameId: number, target: Position | null) {
    const singlePlay = this.getSinglePlay(gameId);

    singlePlay.handleAttack(target, SinglePlayService.BOT_ID);
  }

  private getBotShipLayout() {
    return this.shipLayouts[getRandomZeroToNine()] as Ship[];
  }
}
