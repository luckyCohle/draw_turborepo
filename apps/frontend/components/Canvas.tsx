import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import ToolBar from "./ToolBar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { strokeColorType, strokeWidthType, Tool } from "@/redux/toolbarSlice";
import Menu from "./Menu";
import {Shapes} from "@/interfaces/shape"
import getExistingShapes from "@/utility/getShapes";
import Zoom from "./Zoom";

export default function Canvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const {selectedTool,strokeColor,strokeWidth,canvasColour}= useSelector((state: RootState) => state.toolbar);
   const selectedToolRef = useRef<Tool>(selectedTool); // Create a ref to store tool
    const strokeColorRef = useRef<strokeColorType>(strokeColor);
      const strokeWidthRef = useRef<strokeWidthType>(strokeWidth); 
      const [displayMenu, setDisplayMenu] = useState(false);
      const [zoom, setZoom] = useState<number>(100)
      const [viewport, setViewport] = useState({ x: 0, y: 0 });
      const shapeArrayRef = useRef<Shapes[]>([])
      const displayMenuForTools:Tool[] =["circle","rectangle","pencil","line","text"];

      useEffect(() => {
        const fetchShapes = async () => {
            shapeArrayRef.current = await getExistingShapes(roomId);
        };
        fetchShapes();
    }, [roomId]);
   useEffect(() => {
    selectedToolRef.current = selectedTool;
    strokeColorRef.current = strokeColor;
    strokeWidthRef.current = strokeWidth;
    
    setDisplayMenu(displayMenuForTools.includes(selectedTool));

    if (canvasRef.current) {
        const canvas = canvasRef.current;
        setTimeout(() => {
            if (selectedTool === "eraser") {
                canvas.style.cursor = "url('/eraser.png') 16 16, auto";
            } else if (selectedTool === "drag") {
                canvas.style.cursor = "grab";
            } else {
                canvas.style.cursor = "crosshair";
            }
        }, 10);

        
    }
}, [selectedTool, strokeWidth, strokeColor, canvasColour]);; 

   useEffect(() => {
       if (canvasRef.current) {
           const canvas = canvasRef.current;
           const ctx = canvas.getContext('2d');
           if(!ctx)return;
           ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const scale = zoom / 100;

            // Calculate the new center
            const newViewportX = (canvas.width / 2) * (1 - scale);
            const newViewportY = (canvas.height / 2) * (1 - scale);

            setViewport({ x: newViewportX, y: newViewportY });

            ctx.translate(newViewportX, newViewportY); // Shift to center
            ctx.scale(scale, scale); // Apply zoom
           initDraw(canvas, roomId, socket, selectedToolRef,shapeArrayRef,zoom); 
       }
   }, [canvasRef, roomId, socket,zoom]);
   return (
    <div className='w-screen h-screen '>
    <ToolBar />
    <canvas ref={canvasRef} className='w-full h-full ' style={{"backgroundColor":canvasColour}}></canvas>
    {displayMenu&&<Menu isText={selectedTool === 'text'}/>}
    <Zoom zoom={zoom} setZoom={setZoom}/>
</div>
   );
}
