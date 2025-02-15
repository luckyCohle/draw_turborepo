"use client";

import { initDraw } from "@/draw";
import { wsUrl } from "@/url";
import { useEffect, useRef, useState } from "react";
import { Loading } from "./Loading";
import Canvas from "./Canvas";
import { useRouter } from "next/navigation";
import RedirectPage from "./Redirecting";


export default function RoomCanvas({roomId}:{roomId:string}) {
     const [socket,setSocket] = useState<WebSocket|null>(null);
     const [token, setToken] = useState<string | null>(null);
     const [isLoading,setIsLoading] = useState(true);
     const [isRedirecting,setIsRedirecting] = useState(false);
     const router = useRouter();
     useEffect(()=>{
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        // setTimeout(() => {
        //   router.push("/signin"); 
        // }, 2000);
        setIsRedirecting(true);
        return 
      }
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
      if (isRedirecting) {
        return(
          <div>
            <RedirectPage message={"Unauthorized: Please log in to access this page"} destination={"/signin"} />
          </div>
        )
      }

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
  
