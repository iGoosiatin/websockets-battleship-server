import { User } from '../types/common';

export default class UserModel implements User {
  private static index = 0;
  name: string;
  password: string;
  index: number;

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
    this.index = UserModel.index;
    UserModel.index++;
  }
}
