import { Shapes } from "@/interfaces/shape";
import { getDistanceFromPointToLine, toAbsolute, toPercentage } from "./canvasCalc";

export const checkShape=(xCord:number,yCord:number,canvasHeight:number,canvasWidth:number,shapeToCheck:Shapes,ctx:CanvasRenderingContext2D,threshold:number=5)=> {
    const xCordPercentage = toPercentage(xCord,canvasWidth);
    const yCordPercentage = toPercentage(yCord,canvasHeight);
    
        if (shapeToCheck.type === "circle") {
            const { centerXPercent, centerYPercent, radiusPercent} = shapeToCheck;
            // Convert to absolute pixels
            const centerX = toAbsolute(centerXPercent, canvasWidth);
            const centerY = toAbsolute(centerYPercent, canvasHeight);
            const radius = toAbsolute(radiusPercent, Math.max(canvasWidth, canvasHeight));
            const x = toAbsolute(xCordPercentage, canvasWidth);
            const y = toAbsolute(yCordPercentage, canvasHeight);
            
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (Math.abs(distance - radius) <= threshold){
                return true;
            };
        }

        if (shapeToCheck.type === "rectangle") {
            const { xPercent, yPercent, widthPercent, heightPercent } = shapeToCheck;
            // Check if near any edge
            const nearLeft = Math.abs(xCordPercentage - xPercent) <= threshold;
            const nearRight = Math.abs(xCordPercentage - (xPercent + widthPercent)) <= threshold;
            const nearTop = Math.abs(yCordPercentage - yPercent) <= threshold;
            const nearBottom = Math.abs(yCordPercentage - (yPercent + heightPercent)) <= threshold;

            const withinVerticalBounds = yCordPercentage >= yPercent && yCordPercentage <= yPercent + heightPercent;
            const withinHorizontalBounds = xCordPercentage >= xPercent && xCordPercentage<= xPercent + widthPercent;
            if ((nearTop || nearBottom) && withinHorizontalBounds||((nearLeft || nearRight) && withinVerticalBounds)){
                return true;
            };
        }
        if(shapeToCheck.type==="line"){
            const { startXPercent,startYPercent,endXPercent,endYPercent} = shapeToCheck
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
               return true;
            }
        }
        if (shapeToCheck.type === "pencil") {
            // For pencil, check each line segment in the stroke
            const lineArray = shapeToCheck.lineArray;
            for (let i = 1; i < lineArray.length; i++) {
                const prevPoint = lineArray[i - 1];
                const currentPoint = lineArray[i];
                
                // Calculate distance from cursor to this line segment
                const distance = getDistanceFromPointToLine(
                    prevPoint.xPercent,
                    prevPoint.yPercent,
                    currentPoint.xPercent,
                    currentPoint.yPercent,
                    xCordPercentage,
                    yCordPercentage
                );

                // Check if point is within the bounds of this line segment
                const withinBounds = 
                    xCordPercentage >= Math.min(prevPoint.xPercent, currentPoint.xPercent) - threshold &&
                    xCordPercentage <= Math.max(prevPoint.xPercent, currentPoint.xPercent) + threshold &&
                    yCordPercentage >= Math.min(prevPoint.yPercent, currentPoint.yPercent) - threshold &&
                    yCordPercentage <= Math.max(prevPoint.yPercent, currentPoint.yPercent) + threshold;

                if (distance <= threshold && withinBounds) {
                    return true;
                    break;
                }
            }
        } 
        if (shapeToCheck.type === 'text') {
            ctx.font = `${shapeToCheck.fontSize}px Serif`
            const containerWidth = ctx.measureText(shapeToCheck.text).width
            const containerHeight = shapeToCheck.fontSize;
            const widthPercent = toPercentage(containerWidth,canvasWidth);
            const heightPercent = toPercentage(containerHeight,canvasHeight);
            const nearLeft = Math.abs(xCordPercentage - shapeToCheck.xPercent) <= threshold;
            const nearRight = Math.abs(xCordPercentage - (shapeToCheck.xPercent + widthPercent)) <= threshold;
            const nearTop = Math.abs(yCordPercentage - shapeToCheck.yPercent) <= threshold;
            const nearBottom = Math.abs(yCordPercentage - (shapeToCheck.yPercent + heightPercent)) <= threshold;

            const withinVerticalBounds = yCordPercentage >= shapeToCheck.yPercent && yCordPercentage <= shapeToCheck.yPercent + heightPercent;
            const withinHorizontalBounds = xCordPercentage >= shapeToCheck.xPercent && xCordPercentage<= shapeToCheck.xPercent + widthPercent;
            if ((nearTop || nearBottom) && withinHorizontalBounds||((nearLeft || nearRight) && withinVerticalBounds)){
                return true;
            };
        }
        
    
    return false;
}