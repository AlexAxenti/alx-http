export type FrameHttpRequestResult =
  | {
      result: "success";
      framedHttpRequest: FramedHttpRequest;
    }
  | {
      result: "error";
      error: Error;
    }
  | {
      result: "incomplete";
    };

export type FramedHttpRequest = {
  bytesConsumed: number;
  requestData: {
    startLine: string;
    headers: HeaderLine[];
    body?: Buffer;
  };
};

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

    // const startLineComponents = frameStartLine(startLine);
    // if (!startLineComponents) {
    //   return {
    //     result: "error",
    //     error: new Error("malformed start line"),
    //   };
    // }

    const HTTP_BODY_SEPARATOR = Buffer.from(CRLF + CRLF, "utf8");
    const httpSeperatorIndex = buffer.indexOf(HTTP_BODY_SEPARATOR);

    const bodyStartBytes = httpSeperatorIndex + HTTP_BODY_SEPARATOR.length;
    let body = Buffer.alloc(0);

    const contentLengthHeader = findHeader(headers, "Content-Length");

    let contentLength = 0;

    // If content length, parse body
    if (contentLengthHeader) {
      contentLength = parseInt(contentLengthHeader[1], 10);

      // If request does not match buffer length, stream possibly not fully received
      // TODO: add timeout incase the stream is fully received and still doesn't align
      if (bodyStartBytes + contentLength > buffer.length) {
        return {
          result: "incomplete",
        };
      }
      body = buffer.slice(bodyStartBytes, bodyStartBytes + contentLength);
    } else {
      if (bodyStartBytes < buffer.length) {
        return {
          result: "error",
          error: new Error("missing content length"),
        };
      }
    }

    console.log("body:", body.toString("utf8"));
    console.log("body length: ", body.length);

    // Calculate bytes consumed
    const bytesConsumed = bodyStartBytes + body.length;

    console.log("body length", body.length);

    console.log("content length", contentLengthHeader);

    // console.log("startLineComponents", startLineComponents);
    console.log("headers", headers);

    const framedHttpRequest: FramedHttpRequest = {
      bytesConsumed,
      requestData: {
        startLine,
        headers,
        body: body.length > 0 ? body : undefined,
      },
    };

    return {
      result: "success",
      framedHttpRequest,
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
  let foundHeader: HeaderLine | null = null;
  for (const header of headers) {
    if (header[0] === headerKey) {
      if (foundHeader && foundHeader[1] !== header[1]) {
        //return error if duplicate with different values
      }
      foundHeader = header;
    }
  }

  return foundHeader;
}

// // TODO: Instead of null return proper error
// function frameStartLine(startLine: string): StartLine | null {
//   const parts = startLine.split(" ");
//   if (parts.length !== 3) {
//     return null;
//   }

//   const [method, path, version] = parts;

//   if (!isMethodOption(method)) {
//     return null;
//   }

//   return { method, path, version };
// }

// function isMethodOption(method: string): method is MethodOptions {
//   return allowedMethods.includes(method as MethodOptions);
// }
