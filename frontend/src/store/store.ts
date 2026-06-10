import { configureStore } from "@reduxjs/toolkit";
import paymentReducer from "./slices/paymentSlice";
import videoReducer from "./slices/videoSlice";

export const store = configureStore({
  reducer: {
    payment: paymentReducer,
    video: videoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
