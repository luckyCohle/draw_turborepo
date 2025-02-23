import { Shapes } from "@/interfaces/shape";
import { checkShape } from "./checkShape";

export const  toPercentage=(value: number, total: number): number=> {
    return (value / total) * 100;
}
export const  toAbsolute=(percentageValue: number, total: number): number=> {
    return  percentageValue*total/100;
}
export const  getRadius=(height: number, width: number)=> {
    return Math.sqrt((Math.abs(width) ** 2) + (Math.abs(height) ** 2)) / 2;
}
export const generateId=()=>{
    
    return Math.floor(Math.random()*20000000)+1; // Ensures an integer ID
}
export const  getDistanceFromPointToLine=(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number, 
    pointX: number, 
    pointY: number
): number=> {
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
export const selectShapesToerase=(xCord:number,yCord:number,ctx:CanvasRenderingContext2D,existingShapes:Shapes[],canvasHeight:number,canvasWidth:number, shapesToRemove:number[],threshold:number=1):number[]=> {
    
    existingShapes.map(shape=>{
        if (shapesToRemove.includes(shape.id)) {
            return;
        }
        if(checkShape(xCord,yCord,canvasHeight,canvasWidth,shape,ctx)){
            shapesToRemove.push(shape.id);
        }
    })
    return [...new Set(shapesToRemove)];
}
