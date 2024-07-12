import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (client) => {
  console.log("Client connected");

  client.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.action) {
      case "draw":
        wss.clients.forEach((cl) => {
          if (cl !== client && cl.readyState === WebSocket.OPEN) {
            cl.send(JSON.stringify(data));
          }
        });
        break;
      case "clear":
        wss.clients.forEach((cl) => {
          if (cl !== client && cl.readyState === WebSocket.OPEN) {
            cl.send(JSON.stringify(data));
          }
        });
        break;

      case "preventloop":
        wss.clients.forEach((cl) => {
          if (cl !== client && cl.readyState === WebSocket.OPEN) {
            cl.send(JSON.stringify(data));
          }
        });
        break;
      default:
        console.log("Unknown action:", data.action);
        break;
    }
  });

  client.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(8000, () => {
  console.log("WebSocket server is running on ws://localhost:8000");
});
