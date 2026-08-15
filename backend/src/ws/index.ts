import { WebSocketServer, WebSocket, RawData } from "ws";
import { Request, Response } from "express";
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
    let message;
    try {
        message = JSON.parse(data.toString());
    } catch {
        sendJson(socket, {
            type: "error",
            message: "invalid json"
        })
        return;
    }

    if (message?.type === "subscribe" && Number.isInteger(message.matchId)) {
        subscribe(message.matchId, socket);
        if (!socket.subscriptions) {
            socket.subscriptions = new Set<string>();
        }
        socket.subscriptions.add(message.matchId);
        sendJson(socket, {
            type: "subscribed",
            matchId: message.matchId,
            timestamp: Date.now()
        });
    }
}

export function attachWebSocketServer(server: any) {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024 //1mb
    });

    wss.on("connection", async (socket, req: Request) => {
        if (wsArcjet) {

            try {
                const decision = await wsArcjet.protect(req);
                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? "Rate Limit" : "Blocked";

                    socket.close(code, reason)
                    return;
                }
            } catch (error) {
                console.error("WebSocket Blocked: ", error);
                socket.close(1011, "server security error");
                return;
            }
        }
        socket.isAlive = true;
        socket.subscriptions = new Set<string>();
        socket.on("pong", () => { socket.isAlive = true; });
        sendJson(socket, { type: "welcome" });
        socket.on("error", console.error);
        socket.on("close", () => {
            cleanUpSubscriptions(socket);
        });
    })

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        })
    })


    function broadcastMatchCreated(match: unknown) {
        broadcastToAll(wss, { type: "match_created", data: match });
    }

    return { broadcastMatchCreated };


}