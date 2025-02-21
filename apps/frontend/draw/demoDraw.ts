import { store } from "@/redux/store";
import { Tool } from "@/redux/toolbarSlice";
import { styleText } from "util";



type Shapes = {
    type: "rectangle";
    id:number,
    xPercent: number;
    yPercent: number;
    heightPercent: number;
    widthPercent: number;
} | {
    type: "circle";
    id:number;
    centerXPercent: number;
    centerYPercent: number;
    radiusPercent: number;
}
|{
    type:"line";
    id:number;
    startXPercent:number;
    startYPercent:number;
    endXPercent:number;
    endYPercent:number;
}


export async function demoInitDraw(canvas: HTMLCanvasElement,selectedToolRef: React.MutableRefObject<string>) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    ctx.strokeStyle = "white";


    function getSelectedTool() {
        return selectedToolRef.current as Tool; // Always get the latest value
    }
    function isEraserSelected():boolean {
        return getSelectedTool()=="eraser";
    }
    
    store.subscribe(() => {
        const selectedTool = store.getState().toolbar.selectedTool;
        console.log("Tool changed:", selectedTool);
      });
    //   updateCursor()
    

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

    function createShape(type:Tool,endX:number,endY:number,height:number,width:number):Shapes{
       return createShapeOnCanvas(type,startX,startY,endX,endY,canvas.width,canvas.height)
    }

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.offsetX;
        startY = e.offsetY;
        shapesToRemove = [];
        if (getSelectedTool() == "drag") {
            canvas.style.cursor="grabbing";
            shapeToDrag = selectShapeNearCurser(e.offsetX, e.offsetY, ctx, canvas.height, canvas.width, existingShapes);
            if (shapeToDrag) {
                // Calculate offset based on shape type
                if (shapeToDrag.type === "rectangle") {
                    dragOffsetX = e.offsetX - toAbsolute(shapeToDrag.xPercent,canvas.width);
                    dragOffsetY = e.offsetY - toAbsolute(shapeToDrag.yPercent , canvas.height);
                } else if(shapeToDrag.type==="circle") {
                    dragOffsetX = e.offsetX - toAbsolute(shapeToDrag.centerXPercent,  canvas.width );
                    dragOffsetY = e.offsetY - toAbsolute(shapeToDrag.centerYPercent,  canvas.height);
                }else if(shapeToDrag.type === "line"){
                    dragOffsetX=e.offsetX-toAbsolute(shapeToDrag.startXPercent,canvas.width);
                    dragOffsetY=e.offsetY-toAbsolute(shapeToDrag.startYPercent,canvas.height);
                }
            }
        }
    });
    canvas.addEventListener("mouseup", (e) => {
        clicked=false
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
        const newShape: Shapes = createShape(getSelectedTool(),e.offsetX,e.offsetY,height,width);
        const { type, ...properties } = newShape;
        existingShapes.push(newShape);
        clearCanvas(ctx,canvas,existingShapes);
    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            let xCord = e.offsetX;
            let yCord = e.offsetY;
            let height = yCord - startY;
            let width = xCord - startX;
            clearCanvas(ctx, canvas, existingShapes);
            ctx.strokeStyle = "white";
            if(getSelectedTool()=="rectangle"){
                ctx.strokeRect(startX, startY, width, height);
            }else if (getSelectedTool()=="circle") {
                ctx.beginPath();
                ctx.arc(startX+width/2,startY+height/2,getRadius(width,height),startAngle,endAngle);
                ctx.stroke();
            }else if(getSelectedTool()=="line"){
                ctx.beginPath();
                ctx.moveTo(startX,startY);
                ctx.lineTo(xCord,yCord);
                ctx.stroke()
            }else if(isEraserSelected()){
                selectShapesToerase(xCord,yCord,ctx,existingShapes,canvas.height,canvas.width,shapesToRemove);
            }else if(getSelectedTool()=="drag"&&shapeToDrag!=null){
                existingShapes=dragShape(xCord,yCord,canvas.height,canvas.width,dragOffsetX,dragOffsetY,shapeToDrag,existingShapes);
                // console.log(existingShapes);
                clearCanvas(ctx,canvas,existingShapes);
            }
        }
    });
}

function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, shapesArray: Shapes[]) {
    ctx.strokeStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawShapes(ctx, canvas, shapesArray);
}



function redrawShapes(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, shapesArray: Shapes[]) {
    shapesArray.forEach((shape) => {
        if (shape.type === "rectangle") {
            const x = toAbsolute(shape.xPercent , canvas.width);
            const y = toAbsolute(shape.yPercent , canvas.height);
            const width = toAbsolute(shape.widthPercent , canvas.width);
            const height = toAbsolute(shape.heightPercent , canvas.height);
            ctx.strokeRect(x, y, width, height);
            
        } else if (shape.type === "circle") {
            const centerX = toAbsolute(shape.centerXPercent , canvas.width);
            const centerY = toAbsolute(shape.centerYPercent , canvas.height);
            const radius = toAbsolute(shape.radiusPercent , Math.max(canvas.width, canvas.height));
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }else if(shape.type==="line"){
            const startX = toAbsolute(shape.startXPercent,canvas.width);
            const startY = toAbsolute(shape.startYPercent,canvas.height);
            const endX  =  toAbsolute(shape.endXPercent,canvas.width);
            const endY  =  toAbsolute(shape.endYPercent,canvas.height);
            ctx.beginPath();
            ctx.moveTo(startX,startY);
            ctx.lineTo(endX,endY);
            ctx.stroke();
        }
    });
}
const createShapeOnCanvas = (type:Tool,startX:number,startY:number,endX:number,endY:number,canvasWidth:number,canvasHeight:number): Shapes => {
    let width = endX- startX;
    let height = endY - startY;
    switch (type) {
        case "rectangle":
            return {
                type: "rectangle",
                id:generateId(),
                xPercent: toPercentage(startX, canvasWidth),
                yPercent: toPercentage(startY, canvasHeight),
                heightPercent: toPercentage(height, canvasHeight),
                widthPercent: toPercentage(width, canvasWidth),
            };
        case "circle":
            return {
                type: "circle",
                id:generateId(),
                centerXPercent: toPercentage(startX+width/2, canvasWidth),
                centerYPercent: toPercentage(startY+height/2, canvasHeight),
                radiusPercent: toPercentage(getRadius(height,width), Math.max(canvasWidth, canvasHeight)),
            };
        case "line":
            return{
                type:"line",
                id:generateId(),
                startXPercent: toPercentage(startX, canvasWidth),
                startYPercent: toPercentage(startY, canvasHeight),
                endXPercent: toPercentage(endX, canvasWidth),
                endYPercent: toPercentage(endY, canvasHeight),

            }
        default:
            throw new Error(`Unknown shape type: ${type}`);
    }
};
function toPercentage(value: number, total: number): number {
    return (value / total) * 100;
}
function toAbsolute(percentageValue: number, total: number): number {
    return  percentageValue*total/100;
}
function getRadius(height: number, width: number) {
    return Math.sqrt((Math.abs(width) ** 2) + (Math.abs(height) ** 2)) / 2;
}
function generateId() {
    
    return Math.floor(Math.random()*20000000)+1; // Ensures an integer ID
}

function selectShapesToerase(xCord:number,yCord:number,ctx:CanvasRenderingContext2D,existingShapes:Shapes[],canvasHeight:number,canvasWidth:number, shapesToRemove:number[],threshold:number=1):number[] {
    const xCordPercentage = toPercentage(xCord,canvasWidth);
    const yCordPercentage = toPercentage(yCord,canvasHeight)
    existingShapes.map(shape=>{
        if (shapesToRemove.includes(shape.id)) {
            return;
        }
        if (shape.type === "circle") {
            const { centerXPercent, centerYPercent, radiusPercent} = shape;
            const distance = Math.sqrt((xCordPercentage - centerXPercent) ** 2 + (yCordPercentage - centerYPercent) ** 2);
            if (Math.abs(distance - radiusPercent) <= threshold){
                shapesToRemove.push(shape.id);
            };
        }

        if (shape.type === "rectangle") {
            const { xPercent, yPercent, widthPercent, heightPercent } = shape;
            // Check if near any edge
            const nearLeft = Math.abs(xCordPercentage - xPercent) <= threshold;
            const nearRight = Math.abs(xCordPercentage - (xPercent + widthPercent)) <= threshold;
            const nearTop = Math.abs(yCordPercentage - yPercent) <= threshold;
            const nearBottom = Math.abs(yCordPercentage - (yPercent + heightPercent)) <= threshold;

            const withinVerticalBounds = yCordPercentage >= yPercent && yCordPercentage <= yPercent + heightPercent;
            const withinHorizontalBounds = xCordPercentage >= xPercent && xCordPercentage<= xPercent + widthPercent;
            if ((nearTop || nearBottom) && withinHorizontalBounds||((nearLeft || nearRight) && withinVerticalBounds)){
                shapesToRemove.push(shape.id);
            };
        }
        if(shape.type==="line"){
            const { startXPercent,startYPercent,endXPercent,endYPercent} = shape
               // Calculate the shortest distance from point to line
               const distance = getDistanceFromPointToLine(
                startXPercent,
                startYPercent,
                endXPercent,
                endYPercent,
                xCordPercentage,
                yCordPercentage
            );

            // Check if point is within the line segment bounds
            const withinBounds = 
                xCordPercentage >= Math.min(startXPercent, endXPercent) - threshold &&
                xCordPercentage <= Math.max(startXPercent, endXPercent) + threshold &&
                yCordPercentage >= Math.min(startYPercent, endYPercent) - threshold &&
                yCordPercentage <= Math.max(startYPercent, endYPercent) + threshold;

            if (distance <= threshold && withinBounds) {
                shapesToRemove.push(shape.id);
            }
        }
    })
    return [...new Set(shapesToRemove)];
}


function eraseShape(shapesToBeRemoved: number[], existingShapes: Shapes[]) {
    existingShapes.splice(0, existingShapes.length, ...existingShapes.filter(shape => !shapesToBeRemoved.includes(shape.id)));
}
function selectShapeNearCurser(xCord:number,yCord:number,ctx:CanvasRenderingContext2D,canvasHeight:number,canvasWidth:number,existingShapes:Shapes[],threshold:number=5):Shapes|null {
    const xCordPercentage = toPercentage(xCord,canvasWidth);
    const yCordPercentage = toPercentage(yCord,canvasHeight);
    let selectedShape:Shapes|null = null;
    existingShapes.map(shape=>{
        if (shape.type === "circle") {
            const { centerXPercent, centerYPercent, radiusPercent} = shape;
            const distance = Math.sqrt((xCordPercentage - centerXPercent) ** 2 + (yCordPercentage - centerYPercent) ** 2);
            if (Math.abs(distance - radiusPercent) <= threshold){
                selectedShape=shape;
            };
        }

        if (shape.type === "rectangle") {
            const { xPercent, yPercent, widthPercent, heightPercent } = shape;
            // Check if near any edge
            const nearLeft = Math.abs(xCordPercentage - xPercent) <= threshold;
            const nearRight = Math.abs(xCordPercentage - (xPercent + widthPercent)) <= threshold;
            const nearTop = Math.abs(yCordPercentage - yPercent) <= threshold;
            const nearBottom = Math.abs(yCordPercentage - (yPercent + heightPercent)) <= threshold;

            const withinVerticalBounds = yCordPercentage >= yPercent && yCordPercentage <= yPercent + heightPercent;
            const withinHorizontalBounds = xCordPercentage >= xPercent && xCordPercentage<= xPercent + widthPercent;
            if ((nearTop || nearBottom) && withinHorizontalBounds||((nearLeft || nearRight) && withinVerticalBounds)){
                selectedShape = shape;
            };
        }
        if(shape.type==="line"){
            const { startXPercent,startYPercent,endXPercent,endYPercent} = shape
               // Calculate the shortest distance from point to line
               const distance = getDistanceFromPointToLine(
                startXPercent,
                startYPercent,
                endXPercent,
                endYPercent,
                xCordPercentage,
                yCordPercentage
            );

            // Check if point is within the line segment bounds
            const withinBounds = 
                xCordPercentage >= Math.min(startXPercent, endXPercent) - threshold &&
                xCordPercentage <= Math.max(startXPercent, endXPercent) + threshold &&
                yCordPercentage >= Math.min(startYPercent, endYPercent) - threshold &&
                yCordPercentage <= Math.max(startYPercent, endYPercent) + threshold;

            if (distance <= threshold && withinBounds) {
                selectedShape=shape;
            }
        }
        
    })
    return selectedShape||null;
}
function dragShape(xCord: number, yCord: number, canvasHeight: number, canvasWidth: number, dragOffsetX: number, dragOffsetY: number, shape: Shapes, existingShapes: Shapes[]): Shapes[] {
    // Remove the shape being dragged from the array
    existingShapes = existingShapes.filter(x => x.id != shape.id);
    
    const newShape: Shapes = (() => {
        switch (shape.type) {
            case "rectangle":
                return {
                    type: "rectangle",
                    id: shape.id,
                    xPercent: toPercentage(xCord - dragOffsetX, canvasWidth),
                    yPercent: toPercentage(yCord - dragOffsetY, canvasHeight),
                    heightPercent: shape.heightPercent,
                    widthPercent: shape.widthPercent,
                };
    
            case "circle":
                return {
                    type: "circle",
                    id: shape.id,
                    centerXPercent: toPercentage(xCord - dragOffsetX, canvasWidth),
                    centerYPercent: toPercentage(yCord - dragOffsetY, canvasHeight),
                    radiusPercent: shape.radiusPercent,
                };

            case "line": {
                // Calculate the movement in percentage terms
                const deltaXPercent = toPercentage(xCord - dragOffsetX, canvasWidth) - shape.startXPercent;
                const deltaYPercent = toPercentage(yCord - dragOffsetY, canvasHeight) - shape.startYPercent;
                
                return {
                    type: "line",
                    id: shape.id,
                    
                    
                    startXPercent: shape.startXPercent + deltaXPercent,
                    startYPercent: shape.startYPercent + deltaYPercent,
                    endXPercent: shape.endXPercent + deltaXPercent,
                    endYPercent: shape.endYPercent + deltaYPercent
                };
            }
    
            default:
                throw new Error(`Unknown shape type`);
        }
    })();
    
    existingShapes.push(newShape);
    return existingShapes;
}
function getDistanceFromPointToLine(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number, 
    pointX: number, 
    pointY: number
): number {
    // If start and end points are the same, calculate direct distance to point
    if (startX === endX && startY === endY) {
        return Math.sqrt(Math.pow(pointX - startX, 2) + Math.pow(pointY - startY, 2));
    }

    // Calculate the shortest distance from point to line using vector math
    const numerator = Math.abs(
        (endY - startY) * pointX -
        (endX - startX) * pointY +
        endX * startY -
        endY * startX
    );
    
    const denominator = Math.sqrt(
        Math.pow(endY - startY, 2) + 
        Math.pow(endX - startX, 2)
    );

    return numerator / denominator;
}
