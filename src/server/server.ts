import net, { Socket } from "net";
import { FrameHttpRequest } from "../parser/frame-http-request.js";

export default class AlxServer {
  private handler: (req: any, res: any) => void;
  private netServer: net.Server;

  constructor(handler: (req: any, res: any) => void) {
    this.handler = handler;
    this.netServer = net.createServer((socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket) {
    let buffer = Buffer.alloc(0);

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      console.log("buffer:", buffer.toString("utf8"));

      const frameResult = FrameHttpRequest(buffer);
      console.log("frameResult:", frameResult);

      socket.end();
    });
  }

  public listen(
    port: number = 80,
    host?: string | undefined,
    listeningHandler?: () => void
  ) {
    this.netServer.listen(port, host, listeningHandler);
  }
}
