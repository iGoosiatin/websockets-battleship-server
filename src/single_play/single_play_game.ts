import Game from '../game';
import { AttackStatus, AuthedWebSocket, Position } from '../types/common';
import { OutgoingCommand } from '../types/outgoing';
import { buildOutgoingMessage } from '../utils';

export default class SinglePlayGame {
  ws: AuthedWebSocket;
  game: Game;
  isAttackInProcess = false;
  isEndOfGame = false;

  constructor(ws: AuthedWebSocket) {
    this.ws = ws;
    this.game = new Game();
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

    const result = this.game.handleAttack(this.ws.index, botId, target);
    this.isEndOfGame = this.game.checkEndOfGame(botId);

    const attackResponse = buildOutgoingMessage(OutgoingCommand.Attack, result);
    console.log(`Responded personally: ${attackResponse}`);
    this.ws.send(attackResponse);

    if (result.status === AttackStatus.Miss) {
      this.game.setCurrentPlayer(botId);
      const changeTurnResponse = buildOutgoingMessage(OutgoingCommand.ChangeTurn, { currentPlayer: botId });
      console.log(`Responded personally: ${changeTurnResponse}`);
      this.ws.send(changeTurnResponse);
      // TODO: bot action here
    }

    if (this.isEndOfGame) {
      const endOfGameResponse = buildOutgoingMessage(OutgoingCommand.Finish, { winPlayer: this.ws.index });
      console.log(`Responded personally: ${endOfGameResponse}`);
      this.ws.send(endOfGameResponse);
    }

    this.isAttackInProcess = false;
  }
}
