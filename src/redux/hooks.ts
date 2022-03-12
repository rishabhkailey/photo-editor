import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// used to change the state accept action as a argument
export const useAppDispatch = () => useDispatch<AppDispatch>()

// Function which accept a (function as a argument with state as argument and required value as return)  
// useAppSelector((state: RootState) => state.someValue)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector