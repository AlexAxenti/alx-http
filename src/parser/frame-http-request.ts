export type FrameHttpRequestResult =
  | {
      result: "success";
      bytesConsumed: number;
      requestData: {
        startLine: string;
        headers: HeaderLine[];
        body?: Buffer;
      };
    }
  | {
      result: "error";
      error: Error;
    }
  | {
      result: "incomplete";
    };

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

type HeaderLine = [headerKey: string, headerValue: string];

// TODO: Instead of returning 'error' throw error instead or creating standardized error objects
export function FrameHttpRequest(buffer: Buffer): FrameHttpRequestResult {
  try {
    const CRLF = "\r\n";

    const data = buffer.toString("utf8");

    const requestEnds = data.includes(CRLF + CRLF);

    if (!requestEnds) {
      return { result: "incomplete" };
    }

    let parsedString = data;

    const startLineCRLF = parsedString.indexOf(CRLF);
    const startLine = parsedString.slice(0, startLineCRLF);

    parsedString = parsedString.slice(startLineCRLF + 2, parsedString.length);
    let headers: HeaderLine[] = [];

    while (true) {
      const nextCRLF = parsedString.indexOf(CRLF);

      let headerLine = parsedString.slice(0, nextCRLF);
      if (headerLine.trim() === "") {
        break;
      }
      let header: HeaderLine;

      const headerSeperatorIndex = headerLine.indexOf(":");
      // TODO: malformed header error
      const headerKey = headerLine.slice(0, headerSeperatorIndex);
      const headerValue = headerLine.slice(
        headerSeperatorIndex + 2,
        headerLine.length
      );
      header = [headerKey, headerValue];
      headers.push(header);

      parsedString = parsedString.slice(nextCRLF + 2, parsedString.length);
    }

    const startLineComponents = frameStartLine(startLine);
    if (!startLineComponents) {
      return {
        result: "error",
        error: new Error("malformed start line"),
      };
    }

    const contentLengthHeader = findHeader(headers, "Content-Length");
    if (
      (startLineComponents.method === "POST" ||
        startLineComponents.method === "PUT" ||
        startLineComponents.method === "PATCH") &&
      contentLengthHeader === null
    ) {
      return {
        result: "error",
        error: new Error("missing content lenght"),
      };
    }

    let contentLength = 0;
    if (contentLengthHeader) {
      contentLength = parseInt(contentLengthHeader[1], 10);
    }
    const HTTP_BODY_SEPARATOR = Buffer.from(CRLF + CRLF, "utf8");
    const httpBodyIndex = buffer.indexOf(HTTP_BODY_SEPARATOR);

    const bodyStart = httpBodyIndex + HTTP_BODY_SEPARATOR.length;
    const body = buffer.slice(bodyStart, bodyStart + contentLength);

    console.log("body:", body.toString("utf8"));
    console.log("body length: ", body.length);

    // Calculate bytes consumed
    const bytesConsumed = bodyStart + body.length;

    console.log("body length", body.length);

    console.log("content length", contentLengthHeader);

    console.log("startLineComponents", startLineComponents);
    console.log("headers", headers);

    return {
      result: "success",
      bytesConsumed,
      requestData: {
        startLine,
        headers,
        body: body.length > 0 ? body : undefined,
      },
    };
  } catch (error) {
    return {
      result: "error",
      error: new Error("error"),
    };
  }
}

function findHeader(
  headers: HeaderLine[],
  headerKey: string
): HeaderLine | null {
  for (const header of headers) {
    if (header[0] === headerKey) {
      return header;
    }
  }

  return null;
}

// TODO: Instead of null return proper error
function frameStartLine(startLine: string): StartLine | null {
  const parts = startLine.split(" ");
  if (parts.length !== 3) {
    return null;
  }

  const [method, path, version] = parts;

  if (!isMethodOption(method)) {
    return null;
  }

  return { method, path, version };
}

function isMethodOption(method: string): method is MethodOptions {
  return allowedMethods.includes(method as MethodOptions);
}
