"use client";
import React, {  useRef } from 'react'
import { useParams, useRouter } from 'next/navigation';
import Canvas from '@/components/RoomCanvas';
import RoomCanvas from '@/components/RoomCanvas';

export default function CanvasPage({}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const params = useParams();
    const roomId = params?.roomId;
    const room_id = roomId && typeof roomId === 'string' ? roomId : "invalid";
    const get404:boolean = roomId==="invalid";
    const router = useRouter();
    if(get404){
      router.push("/not-found");
      return;
    }
    return(
      <div>
        <RoomCanvas roomId={room_id}/>
      </div>
    )
}
