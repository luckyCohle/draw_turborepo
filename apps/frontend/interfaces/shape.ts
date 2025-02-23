import { strokeColorType, strokeWidthType } from "@/redux/toolbarSlice";

export type Shapes = {
    type: "rectangle";
    id:number,
    strokeColour:strokeColorType;
    strokeWidth:strokeWidthType
    xPercent: number;
    yPercent: number;
    heightPercent: number;
    widthPercent: number;
} | {
    type: "circle";
    id:number;
    strokeColour:strokeColorType;
    strokeWidth:strokeWidthType
    centerXPercent: number;
    centerYPercent: number;
    radiusPercent: number;
}
|{
    type:"line";
    id:number;
    strokeColour:strokeColorType;
    strokeWidth:strokeWidthType
    startXPercent:number;
    startYPercent:number;
    endXPercent:number;
    endYPercent:number;
}
|{
    type:"pencil";
    id:number;
    strokeColour:strokeColorType;
    strokeWidth:strokeWidthType
    lineArray:lineArrayType[];
}
|{
    type:"text";
    id:number;
    text:string;
    strokeColour:strokeColorType;
    fontSize:number;
    xPercent:number;
    yPercent:number;
}




 export type lineArrayType={
    actionType:"begin"|"draw";
    xPercent:number,
    yPercent:number
 }
