import { Socket } from "net";

export default class Request {
  private socket: Socket;
  // private method: string;

  constructor(incomingMessage: string, socket: Socket) {
    this.socket = socket;
  }
}
