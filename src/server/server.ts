import net, { Socket } from "net";

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
      console.log("ends with", buffer.toString("utf8").endsWith("\r\n\r\n"));

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
