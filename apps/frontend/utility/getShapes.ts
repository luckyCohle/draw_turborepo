import { Shapes } from "@/interfaces/shape";
import { httpUrl } from "@/url";
import axios from "axios";

export default async function getExistingShapes(roomId: string): Promise<Shapes[]> {
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
            }else if(x.shapeType === "text"){
                return{
                    type:"text",
                    id:x.id,
                    text:x.properties.text,
                    strokeColour: properties.strokeColour,
                    fontSize:x.properties.fontSize,
                    xPercent: properties.xPercent,
                    yPercent: properties.yPercent,
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