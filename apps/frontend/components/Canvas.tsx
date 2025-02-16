import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";
import ActionMenu from "./ActionMenu";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Canvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const selectedTool = useSelector((state: RootState) => state.toolbar.selectedTool);
   const selectedToolRef = useRef(selectedTool); // Create a ref to store tool

   // Update the ref whenever selectedTool changes
   useEffect(() => {
       selectedToolRef.current = selectedTool;
   }, [selectedTool]);

   useEffect(() => {
       if (canvasRef.current) {
           const canvas = canvasRef.current;
           initDraw(canvas, roomId, socket, selectedToolRef); // Pass ref instead of value
       }
   }, [canvasRef, roomId, socket]); // Does NOT depend on selectedTool to avoid unnecessary resets

   return (
       <div className='w-screen h-screen p-2'>
           <ActionMenu />
           <canvas ref={canvasRef} className='w-full h-full bg-black'></canvas>
       </div>
   );
}
