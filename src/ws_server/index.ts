import { Server, WebSocketServer } from 'ws';
import GameController from '../game_controller';

export default class WsServer {
  private port: number;
  private server: Server;
  private gameController: GameController;

  constructor(port: number) {
    this.port = port;
    this.server = new WebSocketServer({ port });
    this.gameController = new GameController(this.broadcast.bind(this));
  }

  start() {
    this.server.on('listening', () => {
      console.log(`WebSocker server is listening on the ${this.port} port!`);
    });

    this.server.on('custom', () => {
      console.log('custom event');
    });

    this.server.on('connection', (ws) => {
      ws.on('error', console.error);

      ws.on('message', (data) => {
        try {
          this.gameController.processIncomingMessage(ws, data.toString());
        } catch (error) {
          console.error(error);
        }
      });
    });
  }

  broadcast(message: string) {
    this.server.clients.forEach((client) => {
      client.send(message);
    });
  }
}
