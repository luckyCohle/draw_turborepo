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


            let existingShapes:Shapes[] = await getExistingShapes(roomId)
            let clicked =false;
            let startX=0;
            let startY =0;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
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
    ctx.clearRect(0,0,canvas.width,canvas.height);
    shapesArray.map((shape)=>{
        if(shape.type==="rectangle"){
        ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
        }
    })
}
async function getExistingShapes(roomId: string): Promise<Shapes[]> {
    try {
        const res = await axios.get(`${httpUrl}/shapes/${roomId}`);
    if(!res.data.shapes){
        return [];
    }
    const existingShapes: Shapes[] = res.data.shapes.map((x: any) => {
        const properties = JSON.parse(x.properties);
        
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

    return existingShapes;
    } catch (error) {
        console.log(error);
        return [];
    }
}
