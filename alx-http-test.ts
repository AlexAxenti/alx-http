import createServer from "./src/index.js";

const server = createServer((req: any, res: any) => {
  console.log("test");
});

server.listen(6001, "127.0.0.1", () => {
  console.log("listening!");
});
