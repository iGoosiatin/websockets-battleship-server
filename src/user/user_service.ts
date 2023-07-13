import { WebSocket } from 'ws';
import { AuthedWebSocket, Winner } from '../types/common';
import { RegisterData } from '../types/outgoing';
import UserModel from './user';

export default class UserService {
  private users: UserModel[] = [];
  private winners: Winner[] = [];

  register(name: string, password: string, ws: WebSocket): RegisterData {
    const existingUser = this.users.find(({ name: existingName }) => existingName === name);

    if (existingUser) {
      if (existingUser.password === password) {
        (ws as AuthedWebSocket).name = existingUser.name;
        (ws as AuthedWebSocket).index = existingUser.index;
        return {
          ...existingUser,
          error: false,
          errorText: '',
        };
      } else {
        return {
          ...existingUser,
          error: true,
          errorText: 'Wrong password!',
        };
      }
    } else {
      const user = new UserModel(name, password);
      (ws as AuthedWebSocket).name = user.name;
      (ws as AuthedWebSocket).index = user.index;
      this.users.push(user);
      this.winners.push({ name, wins: 0 });
      return {
        ...user,
        error: false,
        errorText: '',
      };
    }
  }

  getWinners() {
    return this.winners;
  }

  processWinner(playerId: number) {
    const user = this.users.find(({ index }) => index === playerId) as UserModel;
    this.winners = this.winners
      .map(({ name, wins }) => (name === user.name ? { name, wins: wins + 1 } : { name, wins }))
      .sort((winnerA, winnerB) => winnerB.wins - winnerA.wins);
  }
}
