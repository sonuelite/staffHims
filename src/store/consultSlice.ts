import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {QueuePatient} from '../screens/doctor/queue/QueueScreen';

interface ConsultState {
  selectedPatient: QueuePatient | null;
}

const initialState: ConsultState = {
  selectedPatient: null,
};

const consultSlice = createSlice({
  name: 'consult',
  initialState,
  reducers: {
    setSelectedPatient: (
      state,
      action: PayloadAction<QueuePatient>,
    ) => {
      state.selectedPatient = action.payload;
    },

    clearSelectedPatient: state => {
      state.selectedPatient = null;
    },
  },
});

export const {setSelectedPatient, clearSelectedPatient} =
  consultSlice.actions;

export default consultSlice.reducer;