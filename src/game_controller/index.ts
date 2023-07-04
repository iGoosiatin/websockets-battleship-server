import { IncomingCommand, IncomingMessage } from '../types/incoming';
import UserService from '../user/user_service';
import { OutgoingCommand, OutgoingData, OutgoingMessage } from '../types/outgoing';
import { RawData } from 'ws';

export default class GameController {
  private userService = new UserService();

  processIncomingMessage(rawMessage: RawData) {
    console.log(`Received: ${rawMessage}`);
    const message = this.parseRawIncomingMessage(rawMessage);

    if (!message) {
      return null;
    }

    switch (message.type) {
      case IncomingCommand.Register: {
        const {
          data: { name, password },
        } = message;
        const result = this.userService.register(name, password);
        const response = this.buildOutgoingMessage(OutgoingCommand.Register, result);
        return response;
      }
      default: {
        console.log('Unknown command received');
        return null;
      }
    }
  }

  private parseRawIncomingMessage(stringifiedMessage: RawData) {
    try {
      const { data: rawData, ...restMessage } = JSON.parse(stringifiedMessage.toString());
      const data = rawData === '' ? rawData : JSON.parse(rawData);
      return {
        ...restMessage,
        data,
      } as IncomingMessage;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private buildOutgoingMessage(type: OutgoingCommand, data: OutgoingData) {
    return {
      type,
      data: JSON.stringify(data),
      id: 0,
    } as OutgoingMessage;
  }
}
