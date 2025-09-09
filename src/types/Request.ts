export class HttpRequest {
  method: string;
  path: string;
  httpVersion: string;
  headers: Map<string, string>;
  body: Buffer;
  ip: string;

  constructor(
    method: string,
    path: string,
    httpVersion: string,
    headers: Map<string, string>,
    body: Buffer,
    ip: string
  ) {
    this.method = method;
    this.path = path;
    this.httpVersion = httpVersion;
    this.headers = headers;
    this.body = body;
    this.ip = ip;
  }
}
