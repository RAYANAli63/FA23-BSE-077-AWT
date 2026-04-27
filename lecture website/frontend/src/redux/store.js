import { configureStore } from '@reduxjs/toolkit';
import lectureReducer from './slices/lectureSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    lectures: lectureReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
