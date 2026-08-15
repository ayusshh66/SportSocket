import { WebSocketServer, WebSocket, type RawData } from "ws";
import { Request } from "express";
import { wsArcjet } from "../arcjet.js";

declare module "ws" {
    interface WebSocket {
        isAlive?: boolean;
        subscriptions?: Set<string>;
    }
}

const matchSubscribers = new Map<string, WebSocket[]>();

function subscribe(matchId: string, socket: WebSocket) {
    if (!matchSubscribers.has(matchId)) {
        matchSubscribers.set(matchId, []);
    }
    matchSubscribers.get(matchId)?.push(socket);
    socket.subscriptions?.add(matchId);
}

function unsubscribe(matchId: string, socket: WebSocket) {
    const subs = matchSubscribers.get(matchId);
    if (subs) {
        const index = subs.indexOf(socket);
        if (index !== -1) subs.splice(index, 1);
        if (subs.length === 0) matchSubscribers.delete(matchId);
    }
    socket.subscriptions?.delete(matchId);
}

function cleanUpSubscriptions(socket: WebSocket) {
    if (socket.subscriptions) {
        for (const matchId of socket.subscriptions) {
            const subs = matchSubscribers.get(matchId);
            if (subs) {
                const index = subs.indexOf(socket);
                if (index !== -1) subs.splice(index, 1);
                if (subs.length === 0) matchSubscribers.delete(matchId);
            }
        }
        socket.subscriptions.clear();
    }
}

function sendJson(socket: WebSocket, payload: unknown) {
    if (socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));
}

function broadcastToAll(wss: WebSocketServer, payload: unknown) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) return;

        client.send(JSON.stringify(payload));
    }
}

function broadcastToMatch(match: string, payload: unknown) {
    const subs = matchSubscribers.get(match);
    if (!subs || subs.length === 0) return;

    const message = JSON.stringify(payload);

    for (const client of subs) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

function handleMessage(socket: WebSocket, data: RawData) {
    let message: any;
    try {
        message = JSON.parse(data.toString());
    } catch {
        sendJson(socket, {
            type: "error",
            message: "invalid json"
        });
        return;
    }

    if (message?.type === "subscribe" && (typeof message.matchId === "string" || typeof message.matchId === "number")) {
        const matchId = String(message.matchId);
        subscribe(matchId, socket);
        sendJson(socket, {
            type: "subscribed",
            matchId: message.matchId,
            timestamp: Date.now()
        });
    }

    if (message?.type === "unsubscribe" && (typeof message.matchId === "string" || typeof message.matchId === "number")) {
        const matchId = String(message.matchId);
        unsubscribe(matchId, socket);
        sendJson(socket, {
            type: "unsubscribed",
            matchId: message.matchId,
            timestamp: Date.now()
        });
    }
}

export function attachWebSocketServer(server: any) {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024 // 1mb
    });

    wss.on("connection", async (socket, req: Request) => {
        socket.isAlive = true;
        socket.subscriptions = new Set<string>();
        socket.on("pong", () => { socket.isAlive = true; });

        socket.on("message", (data: RawData) => {
            handleMessage(socket, data);
        });

        socket.on("error", (err) => {
            console.error("WebSocket Error:", err);
            socket.terminate();
        });

        socket.on("close", () => {
            cleanUpSubscriptions(socket);
        });

        if (wsArcjet) {
            try {
                if (!req.headers["user-agent"]) {
                    req.headers["user-agent"] = "websocket-client";
                }
                const decision = await wsArcjet.protect(req);
                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? "Rate Limit" : "Blocked";

                    socket.close(code, reason);
                    return;
                }
            } catch (error) {
                console.error("WebSocket Blocked: ", error);
                socket.close(1011, "server security error");
                return;
            }
        }

        sendJson(socket, { type: "welcome" });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on("close", () => {
        clearInterval(interval);
    });

    function broadcastMatchCreated(match: unknown) {
        broadcastToAll(wss, { type: "match_created", data: match });
    }

    function broadcastCommentary(matchId: string | number, commentary: unknown) {
        broadcastToMatch(String(matchId), { type: "commentary", data: commentary });
    }

    return { broadcastMatchCreated, broadcastCommentary };
}