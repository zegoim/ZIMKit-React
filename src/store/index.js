import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authSlice from "./authSlice";
export const store = configureStore({ reducer: authSlice });
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
