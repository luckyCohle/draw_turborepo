import { httpUrl } from "@/url";
import axios from "axios";


type Shapes ={
    type:"rectangle";
    x:number;
    y:number;
    height:number;
    width:number
}|{
    type:"circle";
    centerX:number;
    centerY:number;
    radius:number;
}
export async function initDraw(canvas:HTMLCanvasElement,roomId:string,socket:WebSocket) {
    const ctx = canvas.getContext("2d")
            if(!ctx){
                return ;
            }
            ctx.strokeStyle="white";
            socket.onmessage=(event)=>{
                const messageData = JSON.parse(event.data);
                if(messageData.type=="sendShape"){
                    const shapeProperties = JSON.parse(messageData.shapeProperties);
                    const newShape:Shapes ={
                        type:messageData.shapeType,
                        ...shapeProperties
                    }
                    existingShapes.push(newShape);
                    clearCanvas(ctx,canvas,existingShapes);
                }
            }
            //function to reset dimensions of canvas on change of window size
            function resizeCanvas() {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                if(ctx){
                    clearCanvas(ctx!,canvas,existingShapes)
                    redrawShapes(ctx,existingShapes)
                }

            }

            let existingShapes:Shapes[] = await getExistingShapes(roomId)
            // console.log("existing Shapes=>"+existingShapes)
            let clicked =false;
            let startX=0;
            let startY =0;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            let originalWidth: number;
            let originalHeight: number;
            //to observe any change in the windowsize,did it to prevent issues on opening dev tools
            const resizeObserver = new ResizeObserver(() => {
                resizeCanvas();
            });
            resizeObserver.observe(canvas);
        
            // Initial setup
            // resizeCanvas();
            //mousedown event
            canvas.addEventListener("mousedown",(e)=>{
                clicked=true;
                startX=e.offsetX;
                startY=e.offsetY;
            })
            //mouseup Event
            canvas.addEventListener("mouseup",(e)=>{
                clicked=false;
                let width = e.offsetX-startX;
                let height = e.offsetY-startY;
                const newShape:Shapes={
                    type:"rectangle",
                    x:startX,
                    y:startY,
                    height,
                    width
                }
                const{type,...properties} = newShape;
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
                
            })
            //mousemove event
            canvas.addEventListener("mousemove",(e)=>{
                if (clicked) {
                    let height = e.offsetY-startY;
                    let width =e.offsetX-startX;
                    // ctx.clearRect(0,0,canvas.width,canvas.height);
                    clearCanvas(ctx,canvas,existingShapes);
                    ctx.strokeStyle="white";
                    ctx.strokeRect(startX,startY,width,height);
                    
                }
                
            })
}
function clearCanvas(ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement,shapesArray:Shapes[]) {
    // console.log("clearCanvas called")
    ctx.strokeStyle = "white";
    ctx.clearRect(0,0,canvas.width,canvas.height);
    shapesArray.map((shape)=>{
        if(shape.type==="rectangle"){
        ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
        }
    })
}
async function getExistingShapes(roomId: string): Promise<Shapes[]> {
    console.log("get existing shapes called")
    try {
        const res = await axios.get(`${httpUrl}/shapes/${roomId}`);
    if(!res.data.existingShapes){
        console.error("did not recivied existingShapes form response")
        return [];
    }
    const existingShapes: Shapes[] = res.data.existingShapes.map((x: any) => {
        const properties = (x.properties);
        
        if (x.shapeType === "rectangle") {
            return {
                type: "rectangle",
                x: properties.x,
                y: properties.y,
                height: properties.height,
                width: properties.width,
            };
        } else if (x.shapeType === "circle") {
            return {
                type: "circle",
                centerX: properties.centerX,
                centerY: properties.centerY,
                radius: properties.radius,
            };
        }

        throw new Error(`Unknown shapeType: ${x.shapeType}`);
    });
    // console.log("existingShapes=>"+existingShapes)
    return existingShapes;
    } catch (error) {
        console.log(error);
        return [];
    }
}
function redrawShapes(ctx: CanvasRenderingContext2D, shapesArray: Shapes[]) {
    // console.log("redrawShapes called")
    shapesArray.forEach((shape) => {
        if (shape.type === "rectangle") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}
