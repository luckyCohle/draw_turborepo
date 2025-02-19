import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Tool = "none"|"select" | "drag"|"rectangle" | "ellipse" | "line" | "pencil" | "text" | "eraser"|"circle";

interface ToolbarState {
  selectedTool: Tool;
  strokeColor: string;
  strokeWidth: number;
}

const initialState: ToolbarState = {
  selectedTool: "none",
  strokeColor: "#000000",
  strokeWidth: 2,
};

const toolbarSlice = createSlice({
  name: "toolbar",
  initialState,
  reducers: {
    setSelectedTool: (state, action: PayloadAction<Tool>) => {
      state.selectedTool = action.payload;
    },
    setStrokeColor: (state, action: PayloadAction<string>) => {
      state.strokeColor = action.payload;
    },
    setStrokeWidth: (state, action: PayloadAction<number>) => {
      state.strokeWidth = action.payload;
    },
    resetToolbar: () => initialState,
  },
});

export const { setSelectedTool, setStrokeColor, setStrokeWidth, resetToolbar } = toolbarSlice.actions;
export default toolbarSlice.reducer;
