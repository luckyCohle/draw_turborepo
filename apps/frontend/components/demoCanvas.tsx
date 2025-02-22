import { useEffect, useRef, useState } from "react";
import ToolBar from "./ToolBar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { strokeColorType, strokeWidthType, Tool } from "@/redux/toolbarSlice";
import { demoInitDraw } from "@/draw/demoDraw";
import Menu from "@/components/Menu";

export default function DemoCanvas() {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const {selectedTool,strokeColor,canvasColour,strokeWidth} = useSelector((state: RootState) => state.toolbar);
   const selectedToolRef = useRef<Tool>(selectedTool);
   const strokeColorRef = useRef<strokeColorType>(strokeColor);
   const strokeWidthRef = useRef<strokeWidthType>(strokeWidth); 
   const [displayMenu, setDisplayMenu] = useState(false);
   const displayMenuForTools:Tool[] =["circle","rectangle","pencil","line"];

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
}, [selectedTool, strokeWidth, strokeColor, canvasColour]);
   useEffect(() => {
       if (canvasRef.current) {
           const canvas = canvasRef.current;
           demoInitDraw(canvas); 
       }
   }, [canvasRef]); 

   return (
       <div className='w-screen h-screen '>
           <ToolBar />
           <canvas ref={canvasRef} className='w-full h-full ' style={{"backgroundColor":canvasColour}}></canvas>
           {displayMenu&&<Menu/>}
       </div>
   );
}
