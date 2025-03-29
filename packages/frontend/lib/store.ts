import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import mediaReducer from "./features/media/mediaSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    media: mediaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["auth/login", "auth/refreshToken"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.refreshToken"],
        // Ignore these paths in the state
        ignoredPaths: ["auth.refreshToken"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
