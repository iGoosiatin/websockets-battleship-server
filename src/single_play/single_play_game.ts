import Game from '../game';
import { AttackStatus, AuthedWebSocket, Position } from '../types/common';
import { OutgoingCommand } from '../types/outgoing';
import { buildOutgoingMessage } from '../utils';
import Bot from './bot';

export default class SinglePlayGame {
  ws: AuthedWebSocket;
  game: Game;
  isAttackInProcess = false;
  isEndOfGame = false;
  private bot: Bot;

  constructor(ws: AuthedWebSocket, botId: number) {
    this.ws = ws;
    this.game = new Game();
    this.bot = new Bot(botId, ws, this.game);
  }

  handleAttack(target: Position | null, botId: number) {
    if (this.isAttackInProcess || this.isEndOfGame) {
      console.log('Skipped attack: other attack in process or end of game');
      return false;
    }
    const currentPlayerId = this.game.getCurrentPlayer();

    if (currentPlayerId !== this.ws.index) {
      console.log('Skipped attack: not players turn');
      return false;
    }

    this.isAttackInProcess = true;

    const { extraShots, ...result } = this.game.handleAttack(this.ws.index, botId, target);
    this.isEndOfGame = this.game.checkEndOfGame(botId);

    const attackResponse = buildOutgoingMessage(OutgoingCommand.Attack, result);
    console.log(`Responded personally: ${attackResponse}`);
    this.ws.send(attackResponse);

    extraShots.forEach((shot) => {
      const extraShotResponse = buildOutgoingMessage(OutgoingCommand.Attack, {
        currentPlayer: this.ws.index,
        status: AttackStatus.Miss,
        position: shot,
      });
      console.log(`Responded personally ${extraShotResponse}`);
      this.ws.send(extraShotResponse);
    });

    if (result.status === AttackStatus.Miss) {
      this.game.setCurrentPlayer(botId);
      const changeTurnResponse = buildOutgoingMessage(OutgoingCommand.ChangeTurn, { currentPlayer: botId });
      console.log(`Responded personally: ${changeTurnResponse}`);
      this.ws.send(changeTurnResponse);
      this.bot.takeover();
    }

    if (this.isEndOfGame) {
      const endOfGameResponse = buildOutgoingMessage(OutgoingCommand.Finish, { winPlayer: this.ws.index });
      console.log(`Responded personally: ${endOfGameResponse}`);
      this.ws.send(endOfGameResponse);
    }

    this.isAttackInProcess = false;
  }
}
