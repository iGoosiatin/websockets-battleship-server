export default class Game {
  private static index = 0;
  idGame: number;
  constructor() {
    this.idGame = Game.index;
    Game.index++;
    return this;
  }
}
