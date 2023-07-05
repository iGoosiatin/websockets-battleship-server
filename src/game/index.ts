/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AttackStatus, Position, Ship } from '../types/common';

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

export default class Game {
  private static index = 0;
  idGame: number;
  ships = new Map<number, Ship[]>();
  shipsData = new Map<number, ShipData[]>();
  private currentPlayer: number;

  constructor() {
    this.idGame = Game.index;
    Game.index++;
    return this;
  }

  createBattlefieldMatrix() {
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
    // Fake random attack
    const position = possibleTarget || { x: 0, y: 0 };

    const status = this.processAttack(enemyId, position);

    return {
      currentPlayer,
      position,
      status,
    };
  }

  checkEndOfGame(enemyId: number): boolean {
    const enemyShipData = this.shipsData.get(enemyId) as ShipData[];
    return enemyShipData.every(({ state }) => state === ShipState.Sunk);
  }

  private processAttack(enemyId: number, target: Position): AttackStatus {
    const enemyShipData = this.shipsData.get(enemyId) as ShipData[];
    let status = AttackStatus.Miss;
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
    return status;
  }
}