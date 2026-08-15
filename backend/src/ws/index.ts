import {WebSocketServer,WebSocket} from "ws";

function sendJson(socket:WebSocket,payload:unknown){
    if(socket.readyState !== WebSocket.OPEN)return;

    socket.send(JSON.stringify(payload));

}

function broadcast(wss:WebSocketServer,payload:unknown){
    for(const client of wss.clients){
        if(client.readyState !== WebSocket.OPEN) return;
    
        client.send(JSON.stringify(payload));
}
}

export function attachWebSocketServer(server: any){
    const wss = new WebSocketServer({ 
        server,
        path : "/ws",
        maxPayload : 1024 * 1024 //1mb
    });

    
}