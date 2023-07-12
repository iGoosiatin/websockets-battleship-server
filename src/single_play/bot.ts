import Game from '../game';
import { AttackStatus, AuthedWebSocket, Position } from '../types/common';
import { OutgoingCommand } from '../types/outgoing';
import { buildOutgoingMessage, getRandom } from '../utils';

const getRandomZeroToNine = getRandom.bind(null, 0, 9);

export default class Bot {
  private botId: number;
  private game: Game;
  private enemyWs: AuthedWebSocket;
  private recordedShots: Position[] = [];

  constructor(botId: number, ws: AuthedWebSocket, game: Game) {
    this.botId = botId;
    this.game = game;
    this.enemyWs = ws;
  }

  takeover() {
    setTimeout(() => {
      const target = this.generateTarget();

      const { extraShots, ...result } = this.game.handleAttack(this.botId, this.enemyWs.index, target);

      const attackResponse = buildOutgoingMessage(OutgoingCommand.Attack, result);
      console.log(`Responded personally: ${attackResponse}`);
      this.enemyWs.send(attackResponse);

      extraShots.forEach((shot) => {
        this.recordedShots.push(shot);
        const extraShotResponse = buildOutgoingMessage(OutgoingCommand.Attack, {
          currentPlayer: this.botId,
          status: AttackStatus.Miss,
          position: shot,
        });
        console.log(`Responded personally: ${extraShotResponse}`);
        this.enemyWs.send(extraShotResponse);
      });

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

  generateTarget(): Position {
    const possibleTarget = { x: getRandomZeroToNine(), y: getRandomZeroToNine() };
    if (this.recordedShots.find((shot) => shot.x === possibleTarget.x && shot.y === possibleTarget.y)) {
      return this.generateTarget();
    } else {
      this.recordedShots.push(possibleTarget);
      return possibleTarget;
    }
  }
}
