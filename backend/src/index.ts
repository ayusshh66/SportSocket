import express, { Request, Response } from "express";
import router from "./routes/index.js";
import { commentartRouter } from "./routes/commentary.js";
import http from "http";
import { attachWebSocketServer } from "./ws/index.js";
import { securityMiddleware } from "./arcjet.js";

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use(securityMiddleware())

app.use("/api/matches", router);
app.use("/api/:id/commentary", commentartRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;


server.listen(PORT, HOST, () => {
  const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`WebSocket server is running on ${baseUrl.replace("http", "ws")}/ws`);
});
