import { WebSocket } from 'ws';
import { OutgoingMessage } from '../types/outgoing';

export default class Responder {
  responsePersonally(response: OutgoingMessage, ws: WebSocket) {
    ws.send(JSON.stringify(response));
  }
}
