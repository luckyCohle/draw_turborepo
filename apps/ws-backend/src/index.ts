import { WebSocketServer,WebSocket } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import {prismaClient as prisma} from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });
interface User {
  userId:string,
  ws:WebSocket,
  rooms:string[];
}
const users: User[] = [];
wss.on('connection', async function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string"||!decoded || !decoded.userId) {
      ws.close();
      return;
    }
    const userId = decoded.userId;
    users.push({
      userId,
      rooms:[],
      ws
    })
    ws.on('message', function message(data) {
      try {
        const parsedData = JSON.parse(data as unknown as string);
      //join room
      if (parsedData.type == "join_room") {
        const user = users.find(x=>x.ws===ws);
        user?.rooms.push(parsedData?.roomId);
      }
      //leave room
        if (parsedData.type == "leave_room") {
        const user = users.find(x=>x.ws===ws);
        if (user) {
          user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
        }
        
      }
      //send text 
      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId;
        const message = parsedData.message;
        users.forEach(async user=>{
          if (user.rooms.includes(roomId)) {
            user.ws.send(JSON.stringify({
              type:"chat",
              message:message,
              roomId:roomId
            }))
          }
          //db update
          const parsedRoomId = parseInt(roomId);
          try {
            await prisma.chat.create({
              data:{
                roomId:parsedRoomId,
                message,
                userId
              }
            })
          } catch (error) {
            console.log(error);
          }
        })
      }
      } catch (error) {
        console.error("Invalid message received:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });
  
  } catch (error) {
    console.log(error)
    ws.close()
  }

  
});
