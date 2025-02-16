import { httpUrl } from "@/url";
import axios from "axios";
import { store } from "@/redux/store";
import { Tool } from "@/redux/toolbarSlice";



type Shapes = {
    type: "rectangle";
    xPercent: number;
    yPercent: number;
    heightPercent: number;
    widthPercent: number;
} | {
    type: "circle";
    centerXPercent: number;
    centerYPercent: number;
    radiusPercent: number;
}
store.subscribe(() => {
    const selectedTool = store.getState().toolbar.selectedTool;
    console.log("Tool changed:", selectedTool);
  });

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket,selectedToolRef: React.MutableRefObject<string>) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    ctx.strokeStyle = "white";

    function getSelectedTool() {
        return selectedToolRef.current; // Always get the latest value
    }
    // Convert absolute coordinates to percentage
    function toPercentage(value: number, total: number): number {
        return (value / total) * 100;
    }

    // Convert percentage to absolute coordinates
    function toAbsolute(percent: number, total: number): number {
        return (percent * total) / 100;
    }

    socket.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        if (messageData.type == "sendShape") {
            const shapeProperties = JSON.parse(messageData.shapeProperties);
            const newShape: Shapes = {
                type: messageData.shapeType,
                ...shapeProperties
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

    //initial values
    let clicked = false;
    let startX = 0;
    let startY = 0;
    const startAngle = 0;
    const endAngle = 2*Math.PI;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    resizeObserver.observe(canvas);

    function createShape(type:string,height:number,width:number):Shapes{
       return createShapeOnCanvas(type,startX,startY,canvas.width,canvas.height,height,width)
    }

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.offsetX;
        startY = e.offsetY;
    });

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        let width = e.offsetX - startX;
        let height = e.offsetY - startY;
        
        // Convert to percentages
        const newShape: Shapes = createShape(getSelectedTool(),height,width);
        const { type, ...properties } = newShape;
        existingShapes.push(newShape);
        
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "sendShape",
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
            let height = e.offsetY - startY;
            let width = e.offsetX - startX;
            clearCanvas(ctx, canvas, existingShapes);
            ctx.strokeStyle = "white";
            if(getSelectedTool()=="rectangle"){
                ctx.strokeRect(startX, startY, width, height);
            }else if (getSelectedTool()=="circle") {
                ctx.beginPath();
                ctx.arc(startX+width/2,startY+height/2,getRadius(width,height),startAngle,endAngle);
                ctx.stroke();
            }
        }
    });
}

function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, shapesArray: Shapes[]) {
    ctx.strokeStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawShapes(ctx, canvas, shapesArray);
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
                    xPercent: properties.xPercent,
                    yPercent: properties.yPercent,
                    heightPercent: properties.heightPercent,
                    widthPercent: properties.widthPercent,
                };
            } else if (x.shapeType === "circle") {
                return {
                    type: "circle",
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
const createShapeOnCanvas = (type: string,startX:number,startY:number,canvasWidth:number,canvasHeight:number,height:number,width:number): Shapes => {
    switch (type) {
        case "rectangle":
            return {
                type: "rectangle",
                xPercent: toPercentage(startX, canvasWidth),
                yPercent: toPercentage(startY, canvasHeight),
                heightPercent: toPercentage(height, canvasHeight),
                widthPercent: toPercentage(width, canvasWidth),
            };
        case "circle":
            return {
                type: "circle",
                centerXPercent: toPercentage(startX+width/2, canvasWidth),
                centerYPercent: toPercentage(startY+height/2, canvasHeight),
                radiusPercent: toPercentage(getRadius(height,width), Math.max(canvasWidth, canvasHeight)),
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