import { Ship } from '../types/common';

export default class Game {
  private static index = 0;
  idGame: number;
  ships = new Map<number, Ship[]>();
  private currentPlayer: number;

  constructor() {
    this.idGame = Game.index;
    Game.index++;
    return this;
  }

  setCurrentPlayer(id: number) {
    this.currentPlayer = id;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }
}
