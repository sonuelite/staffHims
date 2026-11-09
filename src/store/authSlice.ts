import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface StaffUser {
  employee_id: number;
  employee_code: string;
  employee_official_email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  title: string;
  contact_number: string;
  employee_photo: string | null;
  role_master_id: number;
  role_master_name: string;
  department_id: number | null;
  department_name: string | null;
  primary_entity_id: number;
  entityList: any[];
  financeList: any[];
  hasAccess: boolean;
  forceReset: boolean;
}

interface AuthState {
  user: StaffUser | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  authLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoggedIn: false,
  authLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (
      state,
      action: PayloadAction<{
        user: StaffUser;
        accessToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isLoggedIn = true;
      state.authLoading = false;
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.authLoading = action.payload;
    },

    logout: state => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      state.authLoading = false;
    },
  },
});

export const {setLogin, setAuthLoading, logout} = authSlice.actions;
export default authSlice.reducer;