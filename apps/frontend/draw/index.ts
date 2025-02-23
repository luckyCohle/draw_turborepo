import { store } from "@/redux/store";
import { strokeColorType, strokeWidthType, Tool } from "@/redux/toolbarSlice";
import { lineArrayType, Shapes } from "@/interfaces/shape";
import { createShapeOnCanvas, dragShape, getNewShapeAfterDrag, redrawShapes, selectShapeNearCurser } from "@/utility/drawUtil";
import getExistingShapes from "@/utility/getShapes";
import { generateId, getRadius, selectShapesToerase, toAbsolute, toPercentage } from "@/utility/canvasCalc";
import { addTextInput, addText } from "@/utility/textDisplay";



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
    function getFontSize() {
        return store.getState().toolbar.fontSize;
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
    let inputVal:string = "";

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

    function createShape(type: Tool, endX: number, endY: number, height: number, width: number,text:string): Shapes {
        return createShapeOnCanvas(type, startX, startY, endX, endY, canvas.width, canvas.height, pencilStrokeArray, getStrokeColor(), getStrokeWidth(),getFontSize(),text)
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
        if (getSelectedTool() === "text") {
            // Prevent immediate canvas drawing when creating text input
            e.stopPropagation();
            addTextInput(e.offsetX, e.offsetY, canvas.offsetLeft, canvas.offsetTop, getFontSize(), getStrokeColor(), (text) => {
                inputVal = text;
                
                if (ctx && text) {
                    ctx.font = `${getFontSize()}px serif`;
                    ctx.fillStyle = getStrokeColor();
                    ctx.fillText(text, e.offsetX, e.offsetY);
                }
               let result= addText(startX,startY,getStrokeColor(),getFontSize(),text,canvas.height,canvas.width,existingShapes);
               existingShapes=result.shapeArray;
               sendShape(socket,result.newText,roomId);
            });
        }
        if (getSelectedTool() == "drag") {
            shapeToDrag = selectShapeNearCurser(e.offsetX, e.offsetY, ctx, canvas.height, canvas.width, existingShapes);
            canvas.style.cursor = "grabbing";
            if (shapeToDrag) {
                // Calculate offset based on shape type
                if (shapeToDrag.type === "rectangle"||shapeToDrag.type==="text") {
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
        const newShape: Shapes = createShape(getSelectedTool(), e.offsetX, e.offsetY, height, width,inputVal);
        const { type, ...properties } = newShape;
        existingShapes.push(newShape);
        // console.log(existingShapes)


       sendShape(socket,newShape,roomId);



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


function eraseShape(shapesToBeRemoved: number[], existingShapes: Shapes[]) {
    existingShapes.splice(0, existingShapes.length, ...existingShapes.filter(shape => !shapesToBeRemoved.includes(shape.id)));
}
const sendShape =(socket:WebSocket,newShape:Shapes,roomId:string)=>{
    const { type, ...properties } = newShape;
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
}