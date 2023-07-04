import { readFile } from 'fs';
import { resolve, dirname } from 'path';
import { createServer, Server } from 'http';

export default class HttpServer {
  private port: number;
  private server: Server;

  constructor(port: number) {
    this.port = port;
    this.server = createServer((req, res) => {
      const __dirname = resolve(dirname(''));
      const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);

      readFile(file_path, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Static HTTP server is listeting on the ${this.port} port!`);
    });
  }
}
