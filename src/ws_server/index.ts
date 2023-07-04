import { Server, WebSocketServer } from 'ws';
import GameController from '../game_controller';
import Responder from '../responder';

export default class WsServer {
  private port: number;
  private server: Server;
  private gameController = new GameController();
  private responder = new Responder();

  constructor(port: number) {
    this.port = port;
    this.server = new WebSocketServer({ port });
  }

  start() {
    this.server.on('listening', () => {
      console.log(`WebSocker server is listening on the ${this.port} port!`);
    });

    this.server.on('connection', (ws) => {
      ws.on('error', console.error);

      ws.on('message', (data) => {
        try {
          const response = this.gameController.processIncomingMessage(data);
          if (!response) {
            return;
          }

          this.responder.responsePersonally(response, ws);
        } catch (error) {
          console.error(error);
        }
      });
    });
  }
}
