"use client";
import { initDraw } from '@/draw';
import React, { useEffect, useRef } from 'react'

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(()=>{
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            initDraw(canvas);
        }
    },[canvasRef])
  return (
    <div className='w-screen h-screen p-10 '>
        <canvas ref={canvasRef}  className=' w-full h-full bg-black'></canvas>
    </div>
  )
}
