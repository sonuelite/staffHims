import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import consultReducer from './consultSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    consult: consultReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;