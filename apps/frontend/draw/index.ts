export function initDraw(canvas:HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
            if(!ctx){
                return ;
            }
            // ctx.strokeRect(25,25,100,100);
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
                console.log("mouseUpX =>"+e.clientX)
                console.log("mouseUpY =>"+e.clientY)
            })
            canvas.addEventListener("mousemove",(e)=>{
                if (clicked) {
                    let height = e.offsetY-startY;
                    let width =e.offsetX-startX;
                    ctx.clearRect(0,0,canvas.width,canvas.height);
                    ctx.strokeStyle="white";
                    ctx.strokeRect(startX,startY,width,height);
                    
                }
                
            })
}