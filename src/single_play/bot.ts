import Game from '../game';
import { AttackStatus, AuthedWebSocket } from '../types/common';
import { OutgoingCommand } from '../types/outgoing';
import { buildOutgoingMessage } from '../utils';

export default class Bot {
  private botId: number;
  private game: Game;
  private enemyWs: AuthedWebSocket;

  constructor(botId: number, ws: AuthedWebSocket, game: Game) {
    this.botId = botId;
    this.game = game;
    this.enemyWs = ws;
  }

  takeover() {
    setTimeout(() => {
      const result = this.game.handleAttack(this.botId, this.enemyWs.index, null);

      const attackResponse = buildOutgoingMessage(OutgoingCommand.Attack, result);
      console.log(`Responded personally: ${attackResponse}`);
      this.enemyWs.send(attackResponse);

      if (result.status === AttackStatus.Miss) {
        this.game.setCurrentPlayer(this.enemyWs.index);
        const changeTurnResponse = buildOutgoingMessage(OutgoingCommand.ChangeTurn, {
          currentPlayer: this.enemyWs.index,
        });
        console.log(`Responded personally: ${changeTurnResponse}`);
        this.enemyWs.send(changeTurnResponse);
      } else {
        const isEndOfGame = this.game.checkEndOfGame(this.enemyWs.index);

        if (isEndOfGame) {
          const endOfGameResponse = buildOutgoingMessage(OutgoingCommand.Finish, { winPlayer: this.botId });
          console.log(`Responded personally: ${endOfGameResponse}`);
          this.enemyWs.send(endOfGameResponse);
          return;
        }

        this.takeover();
      }
    }, 1500);
  }
}
