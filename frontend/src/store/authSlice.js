import { createSlice } from '@reduxjs/toolkit';

const initialState = { user: null, token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token || state.token;
    },
    setUser: (state, action) => { state.user = action.payload; },
    logout: (state) => { state.user = null; state.token = null; },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
