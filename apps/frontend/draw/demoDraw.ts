import { store } from "@/redux/store";
import { lineArrayType, Shapes } from "@/interfaces/shape";
import {createShapeOnCanvas, dragShape, redrawShapes, selectShapeNearCurser} from "@/utility/drawUtil"
import {  generateId, getRadius, selectShapesToerase, toAbsolute, toPercentage } from "@/utility/canvasCalc";
import { strokeColorType, Tool } from "@/redux/toolbarSlice";
import { addText, addTextInput } from "@/utility/textDisplay";


export async function demoInitDraw(canvas: HTMLCanvasElement) {
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
            clearCanvas(ctx, canvas, existingShapes);
            redrawShapes(ctx, canvas, existingShapes);
        }
    }

    let existingShapes: Shapes[] =[];
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
               existingShapes= addText(startX,startY,getStrokeColor(),getFontSize(),text,canvas.height,canvas.width,existingShapes).shapeArray;
            });
        }
        if (getSelectedTool() == "drag") {
            canvas.style.cursor="grabbing";
            

            shapeToDrag = selectShapeNearCurser(e.offsetX, e.offsetY, ctx, canvas.height, canvas.width, existingShapes);
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
            eraseShape(shapesToRemove,existingShapes);
            clearCanvas(ctx,canvas,existingShapes);
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
        existingShapes.push(newShape);
        clearCanvas(ctx,canvas,existingShapes);
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
                clearCanvas(ctx, canvas, existingShapes);
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
                selectShapesToerase(xCord, yCord, ctx, existingShapes, canvas.height, canvas.width, shapesToRemove);
            }else if (getSelectedTool() == "drag" && shapeToDrag != null) {
                existingShapes = dragShape(xCord, yCord, canvas.height, canvas.width,dragOffsetX,dragOffsetY, shapeToDrag, existingShapes);
                clearCanvas(ctx, canvas, existingShapes);
            }
        }
    });
}

function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, shapesArray: Shapes[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawShapes(ctx, canvas, shapesArray);
}

function eraseShape(shapesToBeRemoved: number[], existingShapes: Shapes[]) {
    existingShapes.splice(0, existingShapes.length, ...existingShapes.filter(shape => !shapesToBeRemoved.includes(shape.id)));
}
