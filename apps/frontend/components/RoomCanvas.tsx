"use client";

import { initDraw } from "@/draw";
import { wsUrl } from "@/url";
import { useEffect, useRef, useState } from "react";
import { Loading } from "./Loading";
import Canvas from "./Canvas";


export default function RoomCanvas({roomId}:{roomId:string}) {
     const [socket,setSocket] = useState<WebSocket|null>(null);
     const [token, setToken] = useState<string | null>(null);
     const [isLoading,setIsLoading] = useState(true);
     useEffect(()=>{
      const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    setIsLoading(false);
     },[])
  useEffect(()=>{
    if(!token) return;
          const ws = new WebSocket(`${wsUrl}?token=${token}`)
          ws.onopen=()=>{
            setSocket(ws);
            ws.send(JSON.stringify({
              type:"join_room",
              roomId:roomId
            }))
          }
      },[token]);

      if (!socket||isLoading) {
        return(
          <div>
           <Loading/>
           {/* Loading... */}
          </div>
        )
      }

    return (
      <div>
        <Canvas roomId={roomId} socket={socket}/>
      </div>
    )
  }
  
