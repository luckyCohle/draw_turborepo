import { lineArrayType, Shapes } from "@/interfaces/shape";
import { generateId, getRadius, toAbsolute, toPercentage } from "./canvasCalc";
import { checkShape } from "./checkShape";
import { strokeColorType, strokeWidthType, Tool } from "@/redux/toolbarSlice";

 export const  redrawShapes=(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, shapesArray: Shapes[])=> {
    shapesArray.forEach((shape) => {
        // Set stroke styles before starting any path
        ctx.strokeStyle = shape.strokeColour;
       if (shape.type != "text") {
        ctx.lineWidth = shape.strokeWidth;
       }
        if (shape.type === "rectangle") {
            const x:number = toAbsolute(shape.xPercent, canvas.width);
            const y = toAbsolute(shape.yPercent, canvas.height);
            const width = toAbsolute(shape.widthPercent, canvas.width);
            const height = toAbsolute(shape.heightPercent, canvas.height);
            ctx.strokeRect(x, y, width, height);
        } else if (shape.type === "circle") {
            const centerX = toAbsolute(shape.centerXPercent, canvas.width);
            const centerY = toAbsolute(shape.centerYPercent, canvas.height);
            const radius = toAbsolute(shape.radiusPercent, Math.max(canvas.width, canvas.height));
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (shape.type === "line") {
            const startX = toAbsolute(shape.startXPercent, canvas.width);
            const startY = toAbsolute(shape.startYPercent, canvas.height);
            const endX = toAbsolute(shape.endXPercent, canvas.width);
            const endY = toAbsolute(shape.endYPercent, canvas.height);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        } else if (shape.type === "pencil") {
            ctx.beginPath();
            shape.lineArray.forEach((stroke, index) => {
                const x = toAbsolute(stroke.xPercent, canvas.width);
                const y = toAbsolute(stroke.yPercent, canvas.height);
                if (stroke.actionType === "begin") {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        }else if (shape.type === "text") {
            const x = toAbsolute(shape.xPercent, canvas.width);
            const y = toAbsolute(shape.yPercent, canvas.height);
            ctx.font = `${shape.fontSize}px serif`;
            ctx.fillStyle = shape.strokeColour;
            ctx.fillText(shape.text, x,y)
        }
    });
}

export const  dragShape=(xCord: number, yCord: number, canvasHeight: number, canvasWidth: number, dragOffsetX: number, dragOffsetY: number, shape: Shapes, existingShapes: Shapes[]): Shapes[]=> {
    // Remove the shape being dragged from the array
    existingShapes = existingShapes.filter(x => x.id != shape.id);
    
    const newShape: Shapes = (() => {
        switch (shape.type) {
            case "rectangle":
                return {
                    type: "rectangle",
                    id: shape.id,
                    strokeColour:shape.strokeColour,
                    strokeWidth:shape.strokeWidth,
                    xPercent: toPercentage(xCord - dragOffsetX, canvasWidth),
                    yPercent: toPercentage(yCord - dragOffsetY, canvasHeight),
                    heightPercent: shape.heightPercent,
                    widthPercent: shape.widthPercent,
                };
    
            case "circle":
                return {
                    type: "circle",
                    id: shape.id,
                    strokeColour:shape.strokeColour,
                    strokeWidth:shape.strokeWidth,
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
                    strokeColour:shape.strokeColour,
                    strokeWidth:shape.strokeWidth,
                    
                    startXPercent: shape.startXPercent + deltaXPercent,
                    startYPercent: shape.startYPercent + deltaYPercent,
                    endXPercent: shape.endXPercent + deltaXPercent,
                    endYPercent: shape.endYPercent + deltaYPercent
                };
            }
            case "pencil": {
                const xCurMove = xCord-(dragOffsetX+toAbsolute(shape.lineArray[0].xPercent,canvasWidth));
                const yCurMove = yCord-(dragOffsetY+toAbsolute(shape.lineArray[0].yPercent,canvasHeight)); // Fixed to use dragOffsetY
                const xMovePercent = toPercentage(xCurMove,canvasWidth);
                const yMovePercent = toPercentage(yCurMove,canvasHeight);
                
                const newLineArray = shape.lineArray.map(el => ({
                    actionType: el.actionType,
                    xPercent: el.xPercent + xMovePercent,
                    yPercent: el.yPercent + yMovePercent
                }));
                
                return {
                    type: "pencil",
                    id: shape.id,
                    strokeColour:shape.strokeColour,
                    strokeWidth:shape.strokeWidth,
                    lineArray: newLineArray
                };
            }
        case "text":
            return{
                type: "text",
                id: shape.id,
                text:shape.text,
                strokeColour:shape.strokeColour,
                fontSize:shape.fontSize,
                xPercent: toPercentage(xCord - dragOffsetX, canvasWidth),
                yPercent: toPercentage(yCord - dragOffsetY, canvasHeight),
            }
    
            default:
                throw new Error(`Unknown shape type`);
        }
    })();
    
    existingShapes.push(newShape);
    return existingShapes;
}
export const  selectShapeNearCurser=(xCord:number,yCord:number,ctx:CanvasRenderingContext2D,canvasHeight:number,canvasWidth:number,existingShapes:Shapes[],threshold:number=5):Shapes|null=> {
    let selectedShape:Shapes|null = null;
    existingShapes.map(shape=>{
        if(checkShape(xCord,yCord,canvasHeight,canvasWidth,shape,ctx)){
            selectedShape=shape;
        }
        
    })
    return selectedShape||null;
}
export const createShapeOnCanvas = (type:Tool,startX:number,startY:number,endX:number,endY:number,canvasWidth:number,canvasHeight:number,pencilStrokes:lineArrayType[],strokeColor:strokeColorType,strokeWidth:strokeWidthType,textFontSize:number,displayText:string): Shapes => {
    let width = endX- startX;
    let height = endY - startY;
    switch (type) {
        case "rectangle":
            return {
                type: "rectangle",
                id:generateId(),
                strokeColour:strokeColor,
                strokeWidth:strokeWidth,
                xPercent: toPercentage(startX, canvasWidth),
                yPercent: toPercentage(startY, canvasHeight),
                heightPercent: toPercentage(height, canvasHeight),
                widthPercent: toPercentage(width, canvasWidth),
            };
        case "circle":
            return {
                type: "circle",
                id:generateId(),
                strokeColour:strokeColor,
                strokeWidth:strokeWidth,
                centerXPercent: toPercentage(startX+width/2, canvasWidth),
                centerYPercent: toPercentage(startY+height/2, canvasHeight),
                radiusPercent: toPercentage(getRadius(height,width), Math.max(canvasWidth, canvasHeight)),
            };
        case "line":
            return{
                type:"line",
                id:generateId(),
                strokeColour:strokeColor,
                strokeWidth:strokeWidth,
                startXPercent: toPercentage(startX, canvasWidth),
                startYPercent: toPercentage(startY, canvasHeight),
                endXPercent: toPercentage(endX, canvasWidth),
                endYPercent: toPercentage(endY, canvasHeight),

            }
        case "pencil":
            return{
                type:"pencil",
                id:generateId(),
                strokeColour:strokeColor,
                strokeWidth:strokeWidth,
                lineArray:pencilStrokes
            }
        case "text":
            return{
                type:"text",
                id:generateId(),
                text:displayText,
                strokeColour:strokeColor,
                fontSize:textFontSize,
                xPercent:toPercentage(startX,canvasWidth),
                yPercent:toPercentage(startY,canvasHeight)
            }
        default:
            throw new Error(`Unknown shape type: ${type}`);
    }
};
export const  getNewShapeAfterDrag=(oldShape: Shapes, xCord: number, yCord: number, canvasHeight: number, canvasWidth: number, dragOffsetX: number, dragOffsetY: number): Shapes=> {
    switch (oldShape.type) {
        case "rectangle":
            return {
                type: "rectangle",
                id: oldShape.id,
                strokeColour: oldShape.strokeColour,
                strokeWidth: oldShape.strokeWidth,
                xPercent: toPercentage(xCord - dragOffsetX, canvasWidth),
                yPercent: toPercentage(yCord - dragOffsetY, canvasHeight),
                heightPercent: oldShape.heightPercent,
                widthPercent: oldShape.widthPercent,
            };

        case "circle":
            return {
                type: "circle",
                id: oldShape.id,
                strokeColour: oldShape.strokeColour,
                strokeWidth: oldShape.strokeWidth,
                centerXPercent: toPercentage(xCord - dragOffsetX, canvasWidth),
                centerYPercent: toPercentage(yCord - dragOffsetY, canvasHeight),
                radiusPercent: oldShape.radiusPercent,
            };

        case "line":
            const deltaXPercent = toPercentage(xCord - dragOffsetX, canvasWidth) - oldShape.startXPercent;
            const deltaYPercent = toPercentage(yCord - dragOffsetY, canvasHeight) - oldShape.startYPercent;
            return {
                type: "line",
                id: oldShape.id,
                strokeColour: oldShape.strokeColour,
                strokeWidth: oldShape.strokeWidth,
                startXPercent: oldShape.startXPercent + deltaXPercent,
                startYPercent: oldShape.startYPercent + deltaYPercent,
                endXPercent: oldShape.endXPercent + deltaXPercent,
                endYPercent: oldShape.endYPercent + deltaYPercent
            }
        case "pencil": {
            const xCurMove = xCord - (dragOffsetX + toAbsolute(oldShape.lineArray[0].xPercent, canvasWidth));
            const yCurMove = yCord - (dragOffsetY + toAbsolute(oldShape.lineArray[0].yPercent, canvasHeight)); // Fixed to use dragOffsetY
            const xMovePercent = toPercentage(xCurMove, canvasWidth);
            const yMovePercent = toPercentage(yCurMove, canvasHeight);

            const newLineArray = oldShape.lineArray.map(el => ({
                actionType: el.actionType,
                xPercent: el.xPercent + xMovePercent,
                yPercent: el.yPercent + yMovePercent
            }));

            return {
                type: "pencil",
                id: oldShape.id,
                strokeColour: oldShape.strokeColour,
                strokeWidth: oldShape.strokeWidth,
                lineArray: newLineArray
            };
        }
        case "text":
            return{
                type: "text",
                id: oldShape.id,
                text:oldShape.text,
                strokeColour:oldShape.strokeColour,
                fontSize:oldShape.fontSize,
                xPercent: toPercentage(xCord - dragOffsetX, canvasWidth),
                yPercent: toPercentage(yCord - dragOffsetY, canvasHeight),
            }
        default:
            throw new Error(`Unknown shape type`);
    }
}
