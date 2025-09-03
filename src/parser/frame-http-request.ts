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

type HeaderLine = [headerKey: string, headerValue: string];

export function FrameHttpRequest(buffer: Buffer): FrameHttpRequestResult {
  try {
    const CRLF = "\r\n";

    let data = buffer.toString("utf8");

    const requestEnds = data.endsWith(CRLF + CRLF);

    if (!requestEnds) {
      return { result: "incomplete" };
    }

    const startLineCRLF = data.indexOf(CRLF);
    const startLine = data.slice(0, startLineCRLF);

    data = data.slice(startLineCRLF, data.length);
    let headers: HeaderLine[] = [];

    let nextCRLF = data.indexOf(CRLF);
    while (nextCRLF !== -1) {
      let headerLine = data.slice(0, nextCRLF);
      let header: HeaderLine;

      const headerSeperatorIndex = headerLine.indexOf(":");
      const headerKey = headerLine.slice(0, headerSeperatorIndex);
      const headerValue = headerLine.slice(
        headerSeperatorIndex + 2,
        headerLine.length
      );
      header = [headerKey, headerValue];
      headers.push(header);
    }

    return {
      result: "success",
      bytesConsumed: 0,
      requestData: {
        startLine,
        headers,
      },
    };
  } catch (error) {
    return {
      result: "error",
      error: new Error("error"),
    };
  }
}
