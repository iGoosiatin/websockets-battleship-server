import { RegisterData } from '../types/outgoing';
import UserModel from './user';

export default class UserService {
  private users: UserModel[] = [];

  register(name: string, password: string): RegisterData {
    const existingUser = this.users.find(({ name: existingName }) => existingName === name);

    if (existingUser) {
      if (existingUser.password === password) {
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
      this.users.push(user);
      return {
        ...user,
        error: false,
        errorText: '',
      };
    }
  }
}
