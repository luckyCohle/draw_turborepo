

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
export function initDraw(canvas:HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
            if(!ctx){
                return ;
            }
            let existingShapes:Shapes[] =[]
            let clicked =false;
            let startX=0;
            let startY =0;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            canvas.addEventListener("mousedown",(e)=>{
                clicked=true;
                startX=e.offsetX;
                startY=e.offsetY;
            })
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
                existingShapes.push(newShape);
            })
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