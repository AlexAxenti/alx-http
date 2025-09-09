import { FramedHttpRequest } from "./frame-http-request.js";

interface StartLine {
  method: MethodOptions;
  path: string;
  version: string;
}

const allowedMethods = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD",
  "OPTIONS",
] as const;

type MethodOptions = (typeof allowedMethods)[number];

export function validateHttpProtocol(
  framedHttpRequest: FramedHttpRequest
): boolean {
  validateStartLine(framedHttpRequest.requestData.startLine);

  return true;
}

// TODO: Instead of null return proper error
function validateStartLine(startLine: string): StartLine | null {
  const parts = startLine.split(" ");
  if (parts.length !== 3) {
    return null;
  }

  const [method, path, version] = parts;

  if (!isMethodOption(method)) {
    return null;
  }

  if (path[0] !== "/") {
    // return error
  }

  if (version !== "HTTP/1.1") {
    // return error
  }

  return { method, path, version };
}

function isMethodOption(method: string): method is MethodOptions {
  return allowedMethods.includes(method as MethodOptions);
}
