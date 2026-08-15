import {WebSocketServer,WebSocket} from "ws";

declare module "ws" {
  interface WebSocket {
    isAlive?: boolean;
  }
}

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

    wss.on("connection",(socket)=>{
        socket.isAlive = true;
        socket.on("pong",()=>{socket.isAlive = true;});
        sendJson(socket,{type:"welcome"});
        socket.on("error", console.error);
    })

    const interval = setInterval(()=>{
        wss.clients.forEach((ws)=>{
            if(ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        })
    })
        

    function broadcastMatchCreated(match:unknown){
        broadcast(wss, {type:"match_created",data : match});
    }

    return { broadcastMatchCreated};


}