import { Server, WebSocketServer } from 'ws';

export default class WsServer {
  private port: number;
  private server: Server;

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
          const parsedData = JSON.parse(data.toString());
          console.log(parsedData);
        } catch (error) {
          console.error(error);
        }
      });

      //ws.send(JSON.stringify('abs'));
    });
  }
}
