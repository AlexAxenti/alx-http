import AlxServer from "./server/server.js";

export default function createServer(handler: (req: any, res: any) => void) {
  return new AlxServer(handler);
}
