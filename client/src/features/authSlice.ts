import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  bio: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    website: string;
  };
  aiTokensUsed: number;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('user_profile') ? JSON.parse(localStorage.getItem('user_profile')!) : null,
  token: localStorage.getItem('auth_token') || null,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: UserProfile; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('user_profile', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
    },
    updateUserSuccess: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      localStorage.setItem('user_profile', JSON.stringify(action.payload));
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
});

export const { loginSuccess, logout, updateUserSuccess, setAuthError, setAuthLoading, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
