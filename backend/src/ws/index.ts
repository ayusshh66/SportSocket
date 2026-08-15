import { WebSocketServer, WebSocket } from "ws";
import { Request, Response } from "express";
import { wsArcjet } from "../arcjet.js";

declare module "ws" {
    interface WebSocket {
        isAlive?: boolean;
    }
}

const matchSubscribers = new Map<string, WebSocket[]>();

function subscribe(matchId: string, socket: WebSocket) {
    if (!matchSubscribers.has(matchId)) {
        matchSubscribers.set(matchId, []);
    }
    matchSubscribers.get(matchId)?.push(socket);
}

function unsubscribe(match: string, socket: WebSocket) {
    const subs = matchSubscribers.get(match);
    if (!subs) return;

    const index = subs.indexOf(socket);
    if (index !== -1) subs.splice(index, 1);

    if (subs.length === 0) matchSubscribers.delete(match);

}

function cleanUpSubscriptions(socket: WebSocket) {
    for (const [match, subs] of matchSubscribers.entries()) {
        const index = subs.indexOf(socket);
        if (index !== -1) {
            subs.splice(index, 1);
            if (subs.length === 0) matchSubscribers.delete(match);
            return;
        }
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
        socket.on("pong", () => { socket.isAlive = true; });
        sendJson(socket, { type: "welcome" });
        socket.on("error", console.error);
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