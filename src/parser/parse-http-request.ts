import { HttpRequest } from "../types/Request.js";
import { FramedHttpRequest } from "./frame-http-request.js";

export function parseHttpRequest(
  framedHttpRequest: FramedHttpRequest
): HttpRequest {}
