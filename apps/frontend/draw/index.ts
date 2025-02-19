import { httpUrl } from "@/url";
import axios from "axios";
import { store } from "@/redux/store";
import { Tool } from "@/redux/toolbarSlice";

type Shapes = {
    type: "rectangle";
    id: number,
    xPercent: number;
    yPercent: number;
    heightPercent: number;
    widthPercent: number;
} | {
    type: "circle";
    id: number;
    centerXPercent: number;
    centerYPercent: number;
    radiusPercent: number;
}

// store.subscribe(() => {
//     const selectedTool = store.getState().toolbar.selectedTool;
//     console.log("Tool changed:", selectedTool);
//   });

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, selectedToolRef: React.MutableRefObject<string>) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    ctx.strokeStyle = "white";

    //set curser


    function getSelectedTool() {
        return selectedToolRef.current as Tool; // Always get the latest value
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

        }else if(messageData.type=="moveShape"){
            // const shapeProperties = JSON.parse(messageData.shapeProperties);
            const findShapeIndex = existingShapes.findIndex(x=>x.id==messageData.id);
            existingShapes.splice(findShapeIndex,1);
            const newShape: Shapes = {
                type: messageData.shapeType,
                id: messageData.id,
                ...messageData.shapeProperties
            };
            existingShapes.push(newShape);
            clearCanvas(ctx,canvas,existingShapes);
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
    let shapesToRemove: number[] = [];
    let shapeToDrag: Shapes | null = null;

    //initial values
    let clicked = false;
    let startX = 0;
    let startY = 0;
    const startAngle = 0;
    const endAngle = 2 * Math.PI;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    resizeObserver.observe(canvas);

    function createShape(type: Tool, height: number, width: number): Shapes {
        return createShapeOnCanvas(type, startX, startY, canvas.width, canvas.height, height, width)
    }

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.offsetX;
        startY = e.offsetY;
        shapesToRemove = [];
        if (getSelectedTool() == "drag") {
            shapeToDrag = selectShapeNearCurser(e.offsetX, e.offsetY, ctx, canvas.height, canvas.width, existingShapes);
            console.log(shapeToDrag);
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
            if(shapeToDrag!=null){
                if (socket.readyState === WebSocket.OPEN) {
                    const properties = getNewShapeAfterDrag(shapeToDrag,e.offsetX,e.offsetY,canvas.height,canvas.width)
                    socket.send(JSON.stringify({
                        id:shapeToDrag.id,
                        type: "moveShape",
                        roomId,
                        shapeType:shapeToDrag.type,
                        shapeProperties:properties
                    }))
                shapeToDrag=null;
                }else{
                    console.error("WebSocket is not open.can't send update message");
                }
            }
            return;
        }
        let width = e.offsetX - startX;
        let height = e.offsetY - startY;
        const newShape: Shapes = createShape(getSelectedTool(), height, width);
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
            let xCord = e.offsetX;
            let yCord = e.offsetY;
            let height = yCord - startY;
            let width = xCord - startX;
            clearCanvas(ctx, canvas, existingShapes);
            ctx.strokeStyle = "white";
            if (getSelectedTool() == "rectangle") {
                ctx.strokeRect(startX, startY, width, height);
            } else if (getSelectedTool() == "circle") {
                ctx.beginPath();
                ctx.arc(startX + width / 2, startY + height / 2, getRadius(width, height), startAngle, endAngle);
                ctx.stroke();
            }
            if (isEraserSelected()) {
                selectShapesToerase(xCord, yCord, ctx, existingShapes, canvas.height, canvas.width, shapesToRemove);
            }
            if (getSelectedTool() == "drag" && shapeToDrag != null) {
                existingShapes = dragShape(xCord, yCord, canvas.height, canvas.width, shapeToDrag, existingShapes);
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
        }
    });
}
const createShapeOnCanvas = (type: Tool, startX: number, startY: number, canvasWidth: number, canvasHeight: number, height: number, width: number): Shapes => {
    switch (type) {
        case "rectangle":
            return {
                type: "rectangle",
                id: generateId(),
                xPercent: toPercentage(startX, canvasWidth),
                yPercent: toPercentage(startY, canvasHeight),
                heightPercent: toPercentage(height, canvasHeight),
                widthPercent: toPercentage(width, canvasWidth),
            };
        case "circle":
            return {
                type: "circle",
                id: generateId(),
                centerXPercent: toPercentage(startX + width / 2, canvasWidth),
                centerYPercent: toPercentage(startY + height / 2, canvasHeight),
                radiusPercent: toPercentage(getRadius(height, width), Math.max(canvasWidth, canvasHeight)),
            };
        default:
            throw new Error(`Unknown shape type: ${type}`);
    }
};
function toPercentage(value: number, total: number): number {
    return (value / total) * 100;
}
function getRadius(height: number, width: number) {
    return Math.sqrt((Math.abs(width) ** 2) + (Math.abs(height) ** 2)) / 2;
}
function generateId() {

    return Math.floor(Math.random() * 20000000); // Ensures an integer ID
}

function selectShapesToerase(xCord: number, yCord: number, ctx: CanvasRenderingContext2D, existingShapes: Shapes[], canvasHeight: number, canvasWidth: number, shapesToRemove: number[], threshold: number = 1): number[] {
    const xCordPercentage = toPercentage(xCord, canvasWidth);
    const yCordPercentage = toPercentage(yCord, canvasHeight)
    existingShapes.map(shape => {
        if (shapesToRemove.includes(shape.id)) {
            return;
        }
        if (shape.type === "circle") {
            const { centerXPercent, centerYPercent, radiusPercent } = shape;
            const distance = Math.sqrt((xCordPercentage - centerXPercent) ** 2 + (yCordPercentage - centerYPercent) ** 2);
            if (Math.abs(distance - radiusPercent) <= threshold) {
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
            const withinHorizontalBounds = xCordPercentage >= xPercent && xCordPercentage <= xPercent + widthPercent;
            if ((nearTop || nearBottom) && withinHorizontalBounds || ((nearLeft || nearRight) && withinVerticalBounds)) {
                shapesToRemove.push(shape.id);
            };
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
                    id: x,
                    xPercent: properties.xPercent,
                    yPercent: properties.yPercent,
                    heightPercent: properties.heightPercent,
                    widthPercent: properties.widthPercent,
                };
            } else if (x.shapeType === "circle") {
                return {
                    type: "circle",
                    id: x.id,
                    centerXPercent: properties.centerXPercent,
                    centerYPercent: properties.centerYPercent,
                    radiusPercent: properties.radiusPercent,
                };
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
function selectShapeNearCurser(xCord: number, yCord: number, ctx: CanvasRenderingContext2D, canvasHeight: number, canvasWidth: number, existingShapes: Shapes[], threshold: number = 3): Shapes | null {
    const xCordPercentage = toPercentage(xCord, canvasWidth);
    const yCordPercentage = toPercentage(yCord, canvasHeight);
    let selectedShape: Shapes | null = null;
    existingShapes.map(shape => {
        if (shape.type === "circle") {
            const { centerXPercent, centerYPercent, radiusPercent } = shape;
            const distance = Math.sqrt((xCordPercentage - centerXPercent) ** 2 + (yCordPercentage - centerYPercent) ** 2);
            if (Math.abs(distance - radiusPercent) <= threshold) {
                selectedShape = shape;
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
            const withinHorizontalBounds = xCordPercentage >= xPercent && xCordPercentage <= xPercent + widthPercent;
            if ((nearTop || nearBottom) && withinHorizontalBounds || ((nearLeft || nearRight) && withinVerticalBounds)) {
                selectedShape = shape;
            };
        }
    })
    return selectedShape || null;
}
function dragShape(xCord: number, yCord: number, canvasHeight: number, canvasWidth: number, shape: Shapes, existingShapes: Shapes[]): Shapes[] {
    // Modify the array in place rather than creating a new one
    existingShapes.splice(0, existingShapes.length, ...existingShapes.filter(x => x.id != shape.id));
    
    const newShape: Shapes = getNewShapeAfterDrag(shape, xCord, yCord, canvasHeight, canvasWidth);
    existingShapes.push(newShape);
    return existingShapes;
}
function getNewShapeAfterDrag(oldShape:Shapes,xCord:number,yCord:number,canvasHeight:number,canvasWidth:number):Shapes {
    switch (oldShape.type) {
        case "rectangle":
            return {
                type: "rectangle",
                id: oldShape.id,
                xPercent: toPercentage(xCord, canvasWidth),
                yPercent: toPercentage(yCord, canvasHeight),
                heightPercent: oldShape.heightPercent,
                widthPercent: oldShape.widthPercent,
            };

        case "circle":
            return {
                type: "circle",
                id: oldShape.id,
                centerXPercent: toPercentage(xCord, canvasWidth),
                centerYPercent: toPercentage(yCord, canvasHeight),
                radiusPercent: oldShape.radiusPercent,
            };

        default:
            throw new Error(`Unknown shape type`);
    }
}