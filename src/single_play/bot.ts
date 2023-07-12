import Game from '../game';
import { AttackStatus, AuthedWebSocket, Position } from '../types/common';
import { OutgoingCommand } from '../types/outgoing';
import { buildOutgoingMessage, getRandom } from '../utils';

const getRandomZeroToNine = getRandom.bind(null, 0, 9);
const getTrueOrFalse = () => getRandom(0, 1) === 1;

export default class Bot {
  private botId: number;
  private game: Game;
  private enemyWs: AuthedWebSocket;
  private recordedShots: Position[] = [];
  private damagedShipTrack: Position[] = [];

  constructor(botId: number, ws: AuthedWebSocket, game: Game) {
    this.botId = botId;
    this.game = game;
    this.enemyWs = ws;
  }

  takeover() {
    setTimeout(() => {
      let target: Position;

      if (this.damagedShipTrack.length < 2) {
        target = this.generateTarget(this.damagedShipTrack[0]);
      } else {
        target = this.huntDamagedShip();
      }

      this.recordedShots.push(target);

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

        if (result.status === AttackStatus.Killed) {
          this.damagedShipTrack = [];
        } else {
          this.damagedShipTrack.push(target);
        }

        this.takeover();
      }
    }, 1500);
  }

  private generateTarget(closeTo?: Position): Position {
    const possibleTarget = closeTo
      ? this.generateCloseTarget(closeTo)
      : { x: getRandomZeroToNine(), y: getRandomZeroToNine() };
    if (this.checkIsAlreadyShot(possibleTarget)) {
      return this.generateTarget(closeTo);
    } else {
      return possibleTarget;
    }
  }

  private generateCloseTarget(closeTo: Position): Position {
    const { x, y } = closeTo;

    const isXScale = getTrueOrFalse();

    if (isXScale) {
      if (x === 0) {
        return { x: x + 1, y };
      }
      if (x === 9) {
        return { x: x - 1, y };
      }
      const shouldAdd = getTrueOrFalse();
      return { x: shouldAdd ? x + 1 : x - 1, y };
    } else {
      if (y === 0) {
        return { x, y: y + 1 };
      }
      if (y === 9) {
        return { x, y: y - 1 };
      }
      const shouldAdd = getTrueOrFalse();
      return { x, y: shouldAdd ? y + 1 : y - 1 };
    }
  }

  private huntDamagedShip(): Position {
    const [partOne, partTwo] = this.damagedShipTrack as [Position, Position, ...(Position | undefined)[]];

    const isVertical = partOne.x === partTwo.x;

    if (isVertical) {
      const verticalParts = this.damagedShipTrack.map(({ y }) => y);
      const minY = Math.min(...verticalParts) - 1;
      const maxY = Math.max(...verticalParts) + 1;

      const canShootUp = minY >= 0 && !this.checkIsAlreadyShot({ x: partOne.x, y: minY });
      const canShootDown = maxY <= 9 && !this.checkIsAlreadyShot({ x: partOne.x, y: maxY });

      if (canShootUp && canShootDown) {
        const shouldShootUp = getTrueOrFalse();
        if (shouldShootUp) {
          return { x: partOne.x, y: minY };
        } else {
          return { x: partOne.x, y: maxY };
        }
      }

      if (canShootUp) {
        return { x: partOne.x, y: minY };
      }
      return { x: partOne.x, y: maxY };
    } else {
      const horizontalParts = this.damagedShipTrack.map(({ x }) => x);
      const minX = Math.min(...horizontalParts) - 1;
      const maxX = Math.max(...horizontalParts) + 1;

      const canShootLeft = minX >= 0 && !this.checkIsAlreadyShot({ x: minX, y: partOne.y });
      const canShootRight = maxX <= 9 && !this.checkIsAlreadyShot({ x: maxX, y: partOne.y });

      if (canShootLeft && canShootRight) {
        const shouldShootLeft = getTrueOrFalse();
        if (shouldShootLeft) {
          return { x: minX, y: partOne.y };
        } else {
          return { x: maxX, y: partOne.y };
        }
      }

      if (canShootLeft) {
        return { x: minX, y: partOne.y };
      }
      return { x: maxX, y: partOne.y };
    }
  }

  private checkIsAlreadyShot(target: Position) {
    return !!this.recordedShots.find((shot) => shot.x === target.x && shot.y === target.y);
  }
}
