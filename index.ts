import HttpServer from './src/http_server';
import WsServer from './src/ws_server';

const HTTP_PORT = 8181;
const WS_PORT = 3000;

const httpServer = new HttpServer(HTTP_PORT);
const wsServer = new WsServer(WS_PORT);

httpServer.start();
wsServer.start();
