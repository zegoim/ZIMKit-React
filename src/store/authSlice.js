import { createSlice } from '@reduxjs/toolkit';
export const authSlice = createSlice({
    name: 'AUTH',
    initialState: {
        isInit: false,
        isLoggedIn: false
    },
    reducers: {
        initIMKitSDK: (state, action) => {
            state.isInit = action.payload;
        },
        login: (state, action) => {
            state.isLoggedIn = true;
        },
        logout: (state, action) => {
            state.isLoggedIn = false;
        }
    }
});
export const { initIMKitSDK, login, logout } = authSlice.actions;
export const selectIsLoggedIn = (state) => ({
    isInit: state.isInit,
    isLoggedIn: state.isLoggedIn
});
export default authSlice.reducer;
