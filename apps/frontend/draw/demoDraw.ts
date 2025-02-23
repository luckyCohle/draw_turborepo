import { store } from "@/redux/store";
import { lineArrayType, Shapes } from "@/interfaces/shape";
import {createShapeOnCanvas, dragShape, redrawShapes, selectShapeNearCurser} from "@/utility/drawUtil"
import {   getRadius, selectShapesToerase, toAbsolute, toPercentage } from "@/utility/canvasCalc";
import {  Tool } from "@/redux/toolbarSlice";
import { addText, addTextInput } from "@/utility/textDisplay";
import { current } from "@reduxjs/toolkit";
import { Zoom } from "react-toastify";


export async function demoInitDraw(canvas: HTMLCanvasElement,zoom:number,shapeArrayRef:React.MutableRefObject<Shapes[]>) {
    const zoomScale = zoom/100;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }

    function getSelectedTool() {
        return store.getState().toolbar.selectedTool;
    }

    function getStrokeColor() {
        return store.getState().toolbar.strokeColor;
    }

    function getStrokeWidth() {
        return store.getState().toolbar.strokeWidth;
    }
    function getFontSize() {
        return store.getState().toolbar.fontSize;
    }
    function isEraserSelected():boolean {
        return getSelectedTool()=="eraser";
    }
    
    store.subscribe(() => {
        const selectedTool = store.getState().toolbar.selectedTool;
        console.log("Tool changed:", selectedTool);
      });

    

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        if (ctx) {
            clearCanvas(ctx, canvas, shapeArrayRef.current,zoom);
            redrawShapes(ctx, canvas, shapeArrayRef.current,zoom,newViewportX,newViewportY);
        }
    }

    // let existingShapes: Shapes[] =shapeArrayRef.current;
    let shapesToRemove:number[]=[];
    let shapeToDrag:Shapes|null=null;
    let pencilStrokeArray:lineArrayType[]=[];
    let inputVal:string = "";

    //initial values
    let clicked = false;
    let startX = 0;
    let startY = 0;
    let dragOffsetX=0;
    let dragOffsetY=0;
    const startAngle = 0;
    const endAngle = 2*Math.PI;
    const scale = zoom / 100;
    const newViewportX = (canvas.width / 2) * (1 - scale);
    const newViewportY = (canvas.height / 2) * (1 - scale);
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    resizeObserver.observe(canvas);

    function createShape(type:Tool,endX:number,endY:number,height:number,width:number,displayText:string):Shapes{
       return createShapeOnCanvas(type,startX,startY,endX,endY,canvas.width,canvas.height,pencilStrokeArray,getStrokeColor(),getStrokeWidth(),getFontSize(),displayText)
    }

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.offsetX;
        startY = e.offsetY;
        shapesToRemove = [];
        if(getSelectedTool()== "pencil"){
            pencilStrokeArray=[]
            pencilStrokeArray.push({
                actionType:"begin",
                xPercent:toPercentage(startX,canvas.width),
                yPercent:toPercentage(startY,canvas.height)
            })
            ctx.beginPath();
            ctx.moveTo(startX,startY);
        }
        if (getSelectedTool() === "text") {
            // Prevent immediate canvas drawing when creating text input
            e.stopPropagation();
            addTextInput(e.offsetX, e.offsetY, canvas.offsetLeft, canvas.offsetTop, getFontSize(), getStrokeColor(), (text) => {
                inputVal = text;
                
                if (ctx && text) {
                    ctx.font = `${getFontSize()}px serif`;
                    ctx.fillStyle = getStrokeColor();
                    ctx.fillText(text, e.offsetX, e.offsetY);
                }
               shapeArrayRef.current= addText(startX,startY,getStrokeColor(),getFontSize(),text,canvas.height,canvas.width,shapeArrayRef.current).shapeArray;
            });
        }
        if (getSelectedTool() == "drag") {
            canvas.style.cursor="grabbing";
            

            shapeToDrag = selectShapeNearCurser(e.offsetX, e.offsetY, ctx, canvas.height, canvas.width, shapeArrayRef.current);
            if (shapeToDrag) {
                // Calculate offset based on shape type
                if (shapeToDrag.type === "rectangle"||shapeToDrag.type==='text') {
                    dragOffsetX = e.offsetX - toAbsolute(shapeToDrag.xPercent,canvas.width);
                    dragOffsetY = e.offsetY - toAbsolute(shapeToDrag.yPercent , canvas.height);
                } else if(shapeToDrag.type==="circle") {
                    dragOffsetX = e.offsetX - toAbsolute(shapeToDrag.centerXPercent,  canvas.width );
                    dragOffsetY = e.offsetY - toAbsolute(shapeToDrag.centerYPercent,  canvas.height);
                }else if(shapeToDrag.type === "line"){
                    dragOffsetX=e.offsetX-toAbsolute(shapeToDrag.startXPercent,canvas.width);
                    dragOffsetY=e.offsetY-toAbsolute(shapeToDrag.startYPercent,canvas.height);
                }else if (shapeToDrag.type === "pencil") {
                    dragOffsetX=e.offsetX-toAbsolute(shapeToDrag.lineArray[0].xPercent,canvas.width);
                    dragOffsetY=e.offsetY-toAbsolute(shapeToDrag.lineArray[0].yPercent,canvas.height);
                }
            }
        }
    });
    canvas.addEventListener("mouseup", (e) => {
        clicked=false
        const displayText =inputVal
        if (getSelectedTool()=="none") {
            return;
        }
        if(isEraserSelected()){
            shapeArrayRef.current=eraseShape(shapesToRemove,shapeArrayRef.current);
            clearCanvas(ctx,canvas,shapeArrayRef.current,zoom);
            return;
        }
        if(getSelectedTool()==="drag"){
            canvas.style.cursor="grab"
            shapeToDrag=null;
            return;
        }
        let width = e.offsetX - startX;
        let height = e.offsetY - startY;
        const newShape: Shapes = createShape(getSelectedTool(),e.offsetX,e.offsetY,height,width,displayText);
        const { type, ...properties } = newShape;
        shapeArrayRef.current.push(newShape);
        shapeArrayRef.current.push(newShape);
        clearCanvas(ctx,canvas,shapeArrayRef.current,zoom);
        pencilStrokeArray=[];
        ctx.closePath()
    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            // Get latest values directly before each draw operation
            const currentStrokeColor = store.getState().toolbar.strokeColor;
            const currentStrokeWidth = store.getState().toolbar.strokeWidth;
            const currentTool = store.getState().toolbar.selectedTool;
    
            // Apply current styles
            ctx.strokeStyle = currentStrokeColor;
            ctx.lineWidth = currentStrokeWidth;
    
            let xCord = e.offsetX;
            let yCord = e.offsetY;
            let height = yCord - startY;
            let width = xCord - startX;
    
            if(currentTool != "pencil"){
                clearCanvas(ctx, canvas, shapeArrayRef.current,zoom);
            }
    
            // Re-apply styles after clearCanvas
            ctx.strokeStyle = currentStrokeColor;
            ctx.lineWidth = currentStrokeWidth;
    
            if(currentTool == "rectangle"){
                ctx.beginPath();
                ctx.strokeRect(startX, startY, width, height);
            } else if (currentTool == "circle") {
                ctx.beginPath();
                ctx.arc(startX+width/2, startY+height/2, getRadius(width,height), startAngle, endAngle);
                ctx.stroke();
            } else if(currentTool == "line"){
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(xCord, yCord);
                ctx.stroke();
            } else if(currentTool == "pencil"){
                ctx.lineTo(xCord, yCord);
                ctx.stroke();
                pencilStrokeArray.push({
                    actionType: "draw",
                    xPercent: toPercentage(xCord, canvas.width),
                    yPercent: toPercentage(yCord, canvas.height),
                });
            }else if (isEraserSelected()) {
                selectShapesToerase(xCord, yCord, ctx, shapeArrayRef.current, canvas.height, canvas.width, shapesToRemove);
            }else if (getSelectedTool() == "drag" && shapeToDrag != null) {
                shapeArrayRef.current = dragShape(xCord, yCord, canvas.height, canvas.width,dragOffsetX,dragOffsetY, shapeToDrag, shapeArrayRef.current);
                clearCanvas(ctx, canvas, shapeArrayRef.current,zoom);
            }
        }
    });
}

function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, shapesArray: Shapes[],zoom:number) {
    const scale = zoom / 100;
    const newViewportX = (canvas.width / 2) * (1 - scale);
    const newViewportY = (canvas.height / 2) * (1 - scale);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawShapes(ctx, canvas, shapesArray,zoom,newViewportX,newViewportY);
}

function eraseShape(shapesToBeRemoved: number[], existingShapes: Shapes[]) {
    const toRemoveSet = new Set(shapesToBeRemoved);  
    const filteredShapes = existingShapes.filter(shape => !toRemoveSet.has(shape.id));  
    existingShapes.length = 0;  
    existingShapes.push(...filteredShapes); 
    return existingShapes; 
}
