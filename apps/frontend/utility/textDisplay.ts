import { Shapes } from "@/interfaces/shape";
import { strokeColorType } from "@/redux/toolbarSlice";
import { generateId, toPercentage } from "./canvasCalc";

export const addTextInput=(
    x: number, 
    y: number, 
    leftOffset: number, 
    topOffset: number, 
    textFontSize: number, 
    strokeColor: string, 
    callback: (text: string) => void
)=> {
    // Remove any existing text inputs first
    const existingInputs = document.querySelectorAll('.canvas-text-input');
    existingInputs.forEach(input => input.remove());

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("canvas-text-input");
    input.style.position = "fixed";
    input.style.left = `${x + leftOffset}px`;
    input.style.top = `${y + topOffset}px`;
    input.style.fontSize = `${textFontSize}px`;
    input.style.border = `2px solid ${strokeColor}`;
    input.style.outline = "none";
    // input.style.background = "rgba(255, 255, 255, 0.9)";
    input.style.background="transparent"
    input.style.color = strokeColor;
    input.style.padding = "2px";
    input.style.minWidth = "10px";
    input.style.minHeight = "5px";
    input.style.zIndex = "1000";

    document.body.appendChild(input);
    
    setTimeout(() => input.focus(), 0);

    let isRemoved = false;

    function removeInput() {
        if (isRemoved || !document.body.contains(input)) {
            return;
        }
        isRemoved = true;
        const text = input.value.trim();
        if (text) {
            callback(text);
        }
        if (document.body.contains(input)) {
            document.body.removeChild(input);
        }
    }

    input.addEventListener("blur", () => {
        // Add a small delay to handle the case where blur is triggered by Enter key
        setTimeout(removeInput, 100);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            removeInput();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            isRemoved = true;
            if (document.body.contains(input)) {
                document.body.removeChild(input);
            }
        }
        e.stopPropagation();
    });

    input.addEventListener("mousedown", (e) => {
        e.stopPropagation();
    });
    input.addEventListener("mousemove", (e) => {
        e.stopPropagation();
    });
    input.addEventListener("mouseup", (e) => {
        e.stopPropagation();
    });
}
export const addText =(xCord:number,yCord:number,strokeColor:strokeColorType,fontSize:number,displayText:string,canvasHeight:number,canvasWidth:number,shapeArray:Shapes[])=>{
    const newText:Shapes ={
        type:"text",
        id:generateId(),
        text:displayText,
        strokeColour:strokeColor,
        fontSize:fontSize,
        xPercent:toPercentage(xCord,canvasWidth),
        yPercent:toPercentage(yCord,canvasHeight),
    }
    shapeArray.push(newText);
    return {newText,shapeArray};
}