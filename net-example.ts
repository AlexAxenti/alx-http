import net from "net";

const PORT = 6001;
const HOST = "127.0.0.1";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log(`Received data: ${data.toString()}`);

    const body = "Hello from alx-http!\n";
    const head =
      "HTTP/1.1 200 OK\r\n" +
      "Content-Type: text/plain\r\n" +
      `Content-Length: ${Buffer.byteLength(body)}\r\n` +
      "Connection: close\r\n\r\n";

    socket.write(head + body);
    socket.end();
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
