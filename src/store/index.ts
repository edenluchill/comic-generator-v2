import { configureStore } from "@reduxjs/toolkit";
import comicReducer from "./slices/comicSlice";

export const store = configureStore({
  reducer: {
    comic: comicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
