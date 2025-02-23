import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Tool = "none"|"select" | "drag"|"rectangle" | "ellipse" | "line" | "pencil" | "text" | "eraser"|"circle";
export type canvasColourType = "#000000" | "#121212" | "#1e1e1e" | "#5C4033" | "#6E260E";
export type strokeColorType = "#ffffff"|"#e03131"|"#2f9e44"|"#1971c2"|"#f08c00";
export type strokeWidthType = 1|2|3;
interface ToolbarState {
  selectedTool: Tool;
  strokeColor: strokeColorType;
  strokeWidth:strokeWidthType;
  canvasColour:canvasColourType;
  fontSize:number;
}

const initialState: ToolbarState = {
  selectedTool: "none",
  strokeColor: "#ffffff",
  strokeWidth: 2,
  canvasColour:"#000000",
  fontSize:18
  
};

const toolbarSlice = createSlice({
  name: "toolbar",
  initialState,
  reducers: {
    setSelectedTool: (state, action: PayloadAction<Tool>) => {
      state.selectedTool = action.payload;
    },
    setStrokeColor: (state, action: PayloadAction<strokeColorType>) => {
      state.strokeColor = action.payload;
    },
    setStrokeWidth: (state, action: PayloadAction<strokeWidthType>) => {
      state.strokeWidth = action.payload;
    },
    setCanvasColour: (state, action: PayloadAction<canvasColourType>) => {
      state.canvasColour = action.payload;
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },
    resetToolbar: () => initialState,
  },
});

export const { setSelectedTool, setStrokeColor, setStrokeWidth,setCanvasColour, resetToolbar,setFontSize} = toolbarSlice.actions;
export default toolbarSlice.reducer;
