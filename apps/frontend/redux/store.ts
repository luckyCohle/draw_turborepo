import { configureStore } from "@reduxjs/toolkit";
import toolbarReducer from "./toolbarSlice"; // Adjust path based on structure

export const store = configureStore({
  reducer: {
    toolbar: toolbarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
