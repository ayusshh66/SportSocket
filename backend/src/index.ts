import AgentAPI from "apminsight";
AgentAPI.config();

import express, { Request, Response } from "express";
import cors from "cors";
import router from "./routes/index.js";
import { commentartRouter } from "./routes/commentary.js";
import { userRouter } from "./routes/user.js";
import http from "http";
import { attachWebSocketServer } from "./ws/index.js";
import { securityMiddleware } from "./arcjet.js";

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT || 8000);
const HOST = "0.0.0.0";

// Enable CORS for all incoming origins and methods
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"]
}));

app.use(express.json());
app.use(securityMiddleware());

app.use("/api/users", userRouter);
app.use("/api/matches", router);
app.use("/api/matches/:id/commentary", commentartRouter);
app.use("/api/:id/commentary", commentartRouter);


app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

const { broadcastMatchCreated, broadcastCommentary } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`WebSocket server is running on ${baseUrl.replace("http", "ws")}/ws`);
});
