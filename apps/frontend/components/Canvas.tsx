import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";
import ToolBar from "./ToolBar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Tool } from "@/redux/toolbarSlice";

export default function Canvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const selectedTool = useSelector((state: RootState) => state.toolbar.selectedTool);
   const selectedToolRef = useRef<Tool>(selectedTool); // Create a ref to store tool


   
   // Update the ref whenever selectedTool changes
//    useEffect(() => {
//        selectedToolRef.current = selectedTool;
//    }, [selectedTool]);
useEffect(() => {

    selectedToolRef.current = selectedTool;
    if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.style.cursor = "default"; // Reset first

        setTimeout(() => {
            if (selectedTool === "eraser") {
                canvas.style.cursor = "url('/eraser.png') 16 16, auto";
            }else if (selectedTool === "drag") {
                canvas.style.cursor = "grab"
            } else {
                canvas.style.cursor = "crosshair";
            }
        }, 10);
    }
}, [selectedTool]); 

   useEffect(() => {
       if (canvasRef.current) {
           const canvas = canvasRef.current;
           initDraw(canvas, roomId, socket, selectedToolRef); // Pass ref instead of value
       }
   }, [canvasRef, roomId, socket]); // Does NOT depend on selectedTool to avoid unnecessary resets

   return (
       <div className='w-screen h-screen '>
           <ToolBar />
           <canvas ref={canvasRef} className='w-full h-full bg-black'></canvas>
       </div>
   );
}
