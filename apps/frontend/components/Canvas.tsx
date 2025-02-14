"use client";

import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

export default function Canvas({roomId,socket}:{roomId:string,socket:WebSocket}) {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   useEffect(()=>{
           if (canvasRef.current) {
               const canvas = canvasRef.current;
               initDraw(canvas,roomId,socket);
           }
       },[canvasRef,roomId,socket])
     return (
       <div className='w-screen h-screen p-10 '>
           <canvas ref={canvasRef}  className=' w-full h-full bg-black'></canvas>
       </div>
     )
}
