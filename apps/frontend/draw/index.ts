import { httpUrl } from "@/url";
import axios from "axios";
import { store } from "@/redux/store";
import { strokeColorType, strokeWidthType, Tool } from "@/redux/toolbarSlice";

type Shapes = {
    type: "rectangle";
    id: number,
    strokeColour: strokeColorType;
    strokeWidth: strokeWidthType
    xPercent: number;
    yPercent: number;
    heightPercent: number;
    widthPercent: number;
} | {
    type: "circle";
    id: number;
    strokeColour: strokeColorType;
    strokeWidth: strokeWidthType
    centerXPercent: number;
    centerYPercent: number;
    radiusPercent: number;
}
    | {
        type: "line";
        id: number;
        strokeColour: strokeColorType;
        strokeWidth: strokeWidthType
        startXPercent: number;
        startYPercent: number;
        endXPercent: number;
        endYPercent: number;
    }
    | {
        type: "pencil";
        id: number;
        strokeColour: strokeColorType;
        strokeWidth: strokeWidthType
        lineArray: lineArrayType[];
    }


type lineArrayType = {
    actionType: "begin" | "draw";
    xPercent: number,
    yPercent: number
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, selectedToolRef: React.MutableRefObject<string>) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    ctx.strokeStyle = "white";





    function getSelectedTool() {
        return store.getState().toolbar.selectedTool;
    }

    function getStrokeColor() {
        return store.getState().toolbar.strokeColor;
    }

    function getStrokeWidth() {
        return store.getState().toolbar.strokeWidth;
    }
    function isEraserSelected(): boolean {
        return getSelectedTool() == "eraser";
    }

    store.subscribe(() => {
        const selectedTool = store.getState().toolbar.selectedTool;
        console.log("Tool changed:", selectedTool);

    });

    socket.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        if (messageData.type == "sendShape") {
            const shapeProperties = JSON.parse(messageData.shapeProperties);
            const newShape: Shapes = {
                type: messageData.shapeType,
                id: messageData.id,
                ...shapeProperties
            };
            existingShapes.push(newShape);
            clearCanvas(ctx, canvas, existingShapes);
        } else if (messageData.type == "deleteShapes") {
            const shapesToBeRemoved = messageData.shapesToRemove;
            shapesToBeRemoved.forEach((x: number) => {
                shapesToRemove.push(x);
            })
            eraseShape(shapesToRemove, existingShapes);
            clearCanvas(ctx, canvas, existingShapes);

        } else if (messageData.type == "moveShape") {
            // const shapeProperties = JSON.parse(messageData.shapeProperties);
            const findShapeIndex = existingShapes.findIndex(x => x.id == messageData.id);
            console.log(findShapeIndex)
            existingShapes.splice(findShapeIndex, 1);
            const newShape: Shapes = {
                type: messageData.shapeType,
                id: messageData.id,
                ...messageData.shapeProperties
            };
            existingShapes.push(newShape);
            clearCanvas(ctx, canvas, existingShapes);
        }
    }

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        if (ctx) {
            clearCanvas(ctx, canvas, existingShapes);
            redrawShapes(ctx, canvas, existingShapes);
        }
    }

    let existingShapes: Shapes[] = await getExistingShapes(roomId);
    console.log(existingShapes)
    let shapesToRemove: number[] = [];
    let shapeToDrag: Shapes | null = null;
    let pencilStrokeArray: lineArrayType[] = [];

    //initial values
    let clicked = false;
    let startX = 0;
    let startY = 0;
    let dragOffsetX = 0
    let dragOffsetY = 0;
    const startAngle = 0;
    const endAngle = 2 * Math.PI;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    resizeObserver.observe(canvas);

    function createShape(type: Tool, endX: number, endY: number, height: number, width: number): Shapes {
        return createShapeOnCanvas(type, startX, startY, endX, endY, canvas.width, canvas.height, pencilStrokeArray, getStrokeColor(), getStrokeWidth())
    }

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.offsetX;
        startY = e.offsetY;
        shapesToRemove = [];
        if (getSelectedTool() == "pencil") {
            pencilStrokeArray = []
            pencilStrokeArray.push({
                actionType: "begin",
                xPercent: toPercentage(startX, canvas.width),
                yPercent: toPercentage(startY, canvas.height)
            })
            ctx.beginPath();
            ctx.moveTo(startX, startY);
        }
        if (getSelectedTool() == "drag") {
            shapeToDrag = selectShapeNearCurser(e.offsetX, e.offsetY, ctx, canvas.height, canvas.width, existingShapes);
            canvas.style.cursor = "grabbing";
            if (shapeToDrag) {
                // Calculate offset based on shape type
                if (shapeToDrag.type === "rectangle") {
                    dragOffsetX = e.offsetX - toAbsolute(shapeToDrag.xPercent, canvas.width);
                    dragOffsetY = e.offsetY - toAbsolute(shapeToDrag.yPercent, canvas.height);
                } else if (shapeToDrag.type === "circle") {
                    dragOffsetX = e.offsetX - toAbsolute(shapeToDrag.centerXPercent, canvas.width);
                    dragOffsetY = e.offsetY - toAbsolute(shapeToDrag.centerYPercent, canvas.height);
                } else if (shapeToDrag.type === "line") {
                    dragOffsetX = e.offsetX - toAbsolute(shapeToDrag.startXPercent, canvas.width);
                    dragOffsetY = e.offsetY - toAbsolute(shapeToDrag.startYPercent, canvas.height);
                } else if (shapeToDrag.type === "pencil") {
                    dragOffsetX = e.offsetX - toAbsolute(shapeToDrag.lineArray[0].xPercent, canvas.width);
                    dragOffsetY = e.offsetY - toAbsolute(shapeToDrag.lineArray[0].yPercent, canvas.height);
                }
            }
        }
    });
    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        if (getSelectedTool() == "none") {
            return;
        }

        if (isEraserSelected()) {
            if (shapesToRemove.length > 0) {  // Only send if there are shapes to remove
                if (socket.readyState === WebSocket.OPEN) {
                    console.log("Sending shapes to remove:", shapesToRemove);
                    socket.send(JSON.stringify({
                        type: "deleteShapes",
                        shapesToRemove,
                        roomId: roomId
                    }));

                    // Clear the shapes locally after sending
                    eraseShape(shapesToRemove, existingShapes);
                    clearCanvas(ctx, canvas, existingShapes);
                    shapesToRemove = []; // Reset the array
                } else {
                    console.error("WebSocket is not open. Cannot send delete message.");
                }
            }
            return;
        }



        if (getSelectedTool() == "drag") {
            canvas.style.cursor = "grab";
            if (shapeToDrag != null) {
                if (socket.readyState === WebSocket.OPEN) {
                    const properties = getNewShapeAfterDrag(shapeToDrag, e.offsetX, e.offsetY, canvas.height, canvas.width, dragOffsetX, dragOffsetY)
                    socket.send(JSON.stringify({
                        id: shapeToDrag.id,
                        type: "moveShape",
                        roomId,
                        shapeType: shapeToDrag.type,
                        shapeProperties: properties
                    }))
                    shapeToDrag = null;
                } else {
                    console.error("WebSocket is not open.can't send update message");
                }
            }
            return;
        }
        let width = e.offsetX - startX;
        let height = e.offsetY - startY;
        const newShape: Shapes = createShape(getSelectedTool(), e.offsetX, e.offsetY, height, width);
        const { type, ...properties } = newShape;
        existingShapes.push(newShape);


        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "sendShape",
                id: newShape.id,
                shapeType: newShape.type,
                shapeProperties: JSON.stringify(properties),
                roomId: roomId
            }));
        } else {
            console.warn("WebSocket is not open. Cannot send message.");
        }



    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
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
            if (getSelectedTool() != "pencil") {
                clearCanvas(ctx, canvas, existingShapes);
            }
            // Re-apply styles after clearCanvas
            ctx.strokeStyle = currentStrokeColor;
            ctx.lineWidth = currentStrokeWidth;
            if (getSelectedTool() == "rectangle") {
                ctx.strokeRect(startX, startY, width, height);
            } else if (getSelectedTool() == "circle") {
                ctx.beginPath();
                ctx.arc(startX + width / 2, startY + height / 2, getRadius(width, height), startAngle, endAngle);
                ctx.stroke();
            } else if (getSelectedTool() == "line") {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(xCord, yCord);
                ctx.stroke()
            } else if (getSelectedTool() == "pencil") {
                ctx.lineTo(xCord, yCord);
                ctx.stroke();

                pencilStrokeArray.push({
                    actionType: "draw",
                    xPercent: toPercentage(xCord, canvas.width),
                    yPercent: toPercentage(yCord, canvas.height),
                });
            } else if (isEraserSelected()) {
                selectShapesToerase(xCord, yCord, ctx, existingShapes, canvas.height, canvas.width, shapesToRemove);
            } else if (getSelectedTool() == "drag" && shapeToDrag != null) {
                existingShapes = dragShape(xCord, yCord, canvas.height, canvas.width, dragOffsetX, dragOffsetY, shapeToDrag, existingShapes);
                clearCanvas(ctx, canvas, existingShapes);
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
        // Set stroke styles before starting any path
        ctx.strokeStyle = shape.strokeColour;
        ctx.lineWidth = shape.strokeWidth;
        // console.log(shapesArray);
        if (shape.type === "rectangle") {
            const x = (shape.xPercent * canvas.width) / 100;
            const y = (shape.yPercent * canvas.height) / 100;
            const width = (shape.widthPercent * canvas.width) / 100;
            const height = (shape.heightPercent * canvas.height) / 100;
            ctx.strokeRect(x, y, width, height);

        } else if (shape.type === "circle") {
            const centerX = (shape.centerXPercent * canvas.width) / 100;
            const centerY = (shape.centerYPercent * canvas.height) / 100;
            const radius = (shape.radiusPercent * Math.max(canvas.width, canvas.height)) / 100;
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
            shape.lineArray.forEach(stroke => {
                const x = toAbsolute(stroke.xPercent, canvas.width);
                const y = toAbsolute(stroke.yPercent, canvas.height);
                if (stroke.actionType == "begin") {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            })
            ctx.stroke()
            ctx.closePath()
        }
    });
}
const createShapeOnCanvas = (type: Tool, startX: number, startY: number, endX: number, endY: number, canvasWidth: number, canvasHeight: number, pencilStrokes: lineArrayType[], strokeColor: strokeColorType, strokeWidth: strokeWidthType): Shapes => {
    let width = endX - startX;
    let height = endY - startY;
    switch (type) {
        case "rectangle":
            return {
                type: "rectangle",
                id: generateId(),
                strokeColour: strokeColor,
                strokeWidth: strokeWidth,
                xPercent: toPercentage(startX, canvasWidth),
                yPercent: toPercentage(startY, canvasHeight),
                heightPercent: toPercentage(height, canvasHeight),
                widthPercent: toPercentage(width, canvasWidth),
            };
        case "circle":
            return {
                type: "circle",
                id: generateId(),
                strokeColour: strokeColor,
                strokeWidth: strokeWidth,
                centerXPercent: toPercentage(startX + width / 2, canvasWidth),
                centerYPercent: toPercentage(startY + height / 2, canvasHeight),
                radiusPercent: toPercentage(getRadius(height, width), Math.max(canvasWidth, canvasHeight)),
            };
        case "line":
            return {
                type: "line",
                id: generateId(),
                strokeColour: strokeColor,
                strokeWidth: strokeWidth,
                startXPercent: toPercentage(startX, canvasWidth),
                startYPercent: toPercentage(startY, canvasHeight),
                endXPercent: toPercentage(endX, canvasWidth),
                endYPercent: toPercentage(endY, canvasHeight),

            }
        case "pencil":
            return {
                type: "pencil",
                id: generateId(),
                strokeColour: strokeColor,
                strokeWidth: strokeWidth,
                lineArray: pencilStrokes
            }
        default:
            throw new Error(`Unknown shape type: ${type}`);
    }
};
function toPercentage(value: number, total: number): number {
    return (value / total) * 100;
}
function toAbsolute(percentageValue: number, total: number): number {
    return percentageValue * total / 100
}
function getRadius(height: number, width: number) {
    return Math.sqrt((Math.abs(width) ** 2) + (Math.abs(height) ** 2)) / 2;
}
function generateId() {

    return Math.floor(Math.random() * 20000000); // Ensures an integer ID
}

function selectShapesToerase(xCord: number, yCord: number, ctx: CanvasRenderingContext2D, existingShapes: Shapes[], canvasHeight: number, canvasWidth: number, shapesToRemove: number[], threshold: number = 1): number[] {
    existingShapes.map(shape => {
        if (shapesToRemove.includes(shape.id)) {
            return;
        }
        if (checkShape(xCord, yCord, canvasHeight, canvasWidth, shape)) {
            shapesToRemove.push(shape.id);
        }
    })
    return [...new Set(shapesToRemove)];
}

async function getExistingShapes(roomId: string): Promise<Shapes[]> {
    try {
        const res = await axios.get(`${httpUrl}/shapes/${roomId}`);
        if (!res.data.existingShapes) {
            console.error("did not receive existingShapes from response");
            return [];
        }

        const existingShapes: Shapes[] = res.data.existingShapes.map((x: any) => {
            const properties = x.properties;

            if (x.shapeType === "rectangle") {
                return {
                    type: "rectangle",
                    id: x.id,
                    strokeColour: properties.strokeColour,
                    strokeWidth: properties.strokeWidth,
                    xPercent: properties.xPercent,
                    yPercent: properties.yPercent,
                    heightPercent: properties.heightPercent,
                    widthPercent: properties.widthPercent,
                };
            } else if (x.shapeType === "circle") {
                return {
                    type: "circle",
                    id: x.id,
                    strokeColour: properties.strokeColour,
                    strokeWidth: properties.strokeWidth,
                    centerXPercent: properties.centerXPercent,
                    centerYPercent: properties.centerYPercent,
                    radiusPercent: properties.radiusPercent,
                };
            } else if (x.shapeType === "line") {
                return {
                    type: "line",
                    id: x.id,
                    strokeColour: properties.strokeColour,
                    strokeWidth: properties.strokeWidth,
                    startXPercent: properties.startXPercent,
                    startYPercent: properties.startYPercent,
                    endXPercent: properties.endXPercent,
                    endYPercent: properties.endYPercent,
                }
            } else if (x.shapeType === "pencil") {
                return {
                    type: "pencil",
                    id: x.id,
                    strokeColour: properties.strokeColour,
                    strokeWidth: properties.strokeWidth,
                    lineArray: properties.lineArray,
                }
            }
            throw new Error(`Unknown shapeType: ${x.shapeType}`);
        });
        return existingShapes;
    } catch (error) {
        console.log(error);
        return [];
    }
}
function eraseShape(shapesToBeRemoved: number[], existingShapes: Shapes[]) {
    existingShapes.splice(0, existingShapes.length, ...existingShapes.filter(shape => !shapesToBeRemoved.includes(shape.id)));
}
function selectShapeNearCurser(xCord: number, yCord: number, ctx: CanvasRenderingContext2D, canvasHeight: number, canvasWidth: number, existingShapes: Shapes[], threshold: number = 5): Shapes | null {

    let selectedShape: Shapes | null = null;
    existingShapes.map(shape => {
        if (checkShape(xCord, yCord, canvasHeight, canvasWidth, shape)) {
            selectedShape = shape;
        }
    })
    return selectedShape || null;
}
function dragShape(xCord: number, yCord: number, canvasHeight: number, canvasWidth: number, dragOffsetX: number, dragOffsetY: number, shape: Shapes, existingShapes: Shapes[]): Shapes[] {

    existingShapes = existingShapes.filter(x => x.id != shape.id)
    // console.log(existingShapes.length+" after filter"+existingShapes)

    const newShape: Shapes = getNewShapeAfterDrag(shape, xCord, yCord, canvasHeight, canvasWidth, dragOffsetX, dragOffsetY);
    existingShapes.push(newShape);
    // console.log(existingShapes.length+" after push")
    return existingShapes;
}
function getNewShapeAfterDrag(oldShape: Shapes, xCord: number, yCord: number, canvasHeight: number, canvasWidth: number, dragOffsetX: number, dragOffsetY: number): Shapes {
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

        default:
            throw new Error(`Unknown shape type`);
    }
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
function checkShape(xCord: number, yCord: number, canvasHeight: number, canvasWidth: number, shapeToCheck: Shapes, threshold: number = 5) {
    const xCordPercentage = toPercentage(xCord, canvasWidth);
    const yCordPercentage = toPercentage(yCord, canvasHeight);

    if (shapeToCheck.type === "circle") {
        const { centerXPercent, centerYPercent, radiusPercent } = shapeToCheck;
        // Convert to absolute pixels
        const centerX = toAbsolute(centerXPercent, canvasWidth);
        const centerY = toAbsolute(centerYPercent, canvasHeight);
        const radius = toAbsolute(radiusPercent, Math.max(canvasWidth, canvasHeight));
        const x = toAbsolute(xCordPercentage, canvasWidth);
        const y = toAbsolute(yCordPercentage, canvasHeight);

        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (Math.abs(distance - radius) <= threshold) {
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
        const withinHorizontalBounds = xCordPercentage >= xPercent && xCordPercentage <= xPercent + widthPercent;
        if ((nearTop || nearBottom) && withinHorizontalBounds || ((nearLeft || nearRight) && withinVerticalBounds)) {
            return true;
        };
    }
    if (shapeToCheck.type === "line") {
        const { startXPercent, startYPercent, endXPercent, endYPercent } = shapeToCheck
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


    return false;
}