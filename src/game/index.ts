import { AttackStatus, Position, Ship } from '../types/common';
import { getRandom } from '../utils';

enum ShipState {
  Healthy = 'healty',
  Damaged = 'damaged',
  Sunk = 'sunk',
}

enum PartState {
  Healthy = 'healty',
  Damaged = 'damaged',
}
interface Part extends Position {
  partState: PartState;
}

interface ShipData {
  state: ShipState;
  parts: Part[];
}

const getRandomZeroToNine = getRandom.bind(null, 0, 9);

export default class Game {
  private static index = 0;
  private currentPlayer: number;
  private shipsData = new Map<number, ShipData[]>();
  idGame: number;
  isStarted = false;
  ships = new Map<number, Ship[]>();

  constructor() {
    this.idGame = Game.index;
    Game.index++;
    return this;
  }

  startGame() {
    this.isStarted = true;
    this.ships.forEach((playerShips, playerId) => {
      const playerShipData: ShipData[] = [];
      playerShips.forEach(({ length, direction, position: { x, y } }) => {
        const shipData: ShipData = { state: ShipState.Healthy, parts: [] };
        for (let i = 0; i < length; i++) {
          shipData.parts.push({ partState: PartState.Healthy, x: direction ? x : x + i, y: direction ? y + i : y });
        }
        playerShipData.push(shipData);
      });
      this.shipsData.set(playerId, playerShipData);
    });
  }

  setCurrentPlayer(id: number) {
    this.currentPlayer = id;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  handleAttack(currentPlayer: number, enemyId: number, possibleTarget: Position | null) {
    const position = possibleTarget || this.getRandomTarget();

    const { status, extraShots } = this.processAttack(enemyId, position);

    return {
      currentPlayer,
      position,
      status,
      extraShots,
    };
  }

  checkEndOfGame(enemyId: number): boolean {
    const enemyShipData = this.shipsData.get(enemyId) as ShipData[];
    return enemyShipData.every(({ state }) => state === ShipState.Sunk);
  }

  private processAttack(enemyId: number, target: Position) {
    const enemyShipData = this.shipsData.get(enemyId) as ShipData[];
    let status = AttackStatus.Miss;
    let extraShots: Position[] = [];
    const updatedShipData = enemyShipData.map(({ state, parts }) => {
      let updatedShipState = state;
      let updatedParts = parts.map(({ partState, x, y }) => {
        let updatedPartState = partState;
        if (target.x === x && target.y === y) {
          updatedPartState = PartState.Damaged;
          updatedShipState = ShipState.Damaged;
          status = AttackStatus.Shot;
        }
        return {
          partState: updatedPartState,
          x,
          y,
        };
      });

      if (updatedParts.length > 0 && updatedParts.every(({ partState }) => partState === PartState.Damaged)) {
        extraShots = this.buildExtraShots(updatedParts);
        updatedParts = [];
        updatedShipState = ShipState.Sunk;
        status = AttackStatus.Killed;
      }
      return {
        state: updatedShipState,
        parts: updatedParts,
      };
    });

    this.shipsData.set(enemyId, updatedShipData);
    return { status, extraShots };
  }

  private getRandomTarget(): Position {
    return {
      x: getRandomZeroToNine(),
      y: getRandomZeroToNine(),
    };
  }

  private buildExtraShots(parts: Part[]): Position[] {
    const extraShots = parts.reduce((extraShots, part) => {
      for (let x = part.x - 1; x <= part.x + 1; x++) {
        if (!this.isValidPoint(x)) {
          continue;
        }
        for (let y = part.y - 1; y <= part.y + 1; y++) {
          if (!this.isValidPoint(y)) {
            continue;
          }
          const isPart = parts.find((part) => part.x === x && part.y === y);
          const isDuplicate = extraShots.find((position) => position.x === x && position.y === y);
          if (!isPart && !isDuplicate) {
            extraShots.push({ x, y });
          }
        }
      }
      return extraShots;
    }, [] as Position[]);
    return extraShots;
  }

  private isValidPoint(point: number) {
    return point >= 0 && point <= 9;
  }
}
