import { configureStore } from '@reduxjs/toolkit'
import rootReducer from "./reducers/index";

// for future we want different reducers 
// const store = configureStore({
//   reducer: {
//     image: imageReducer,
//     canvas: canvasReducer,
//   },
// })

// 
const store = configureStore({reducer: rootReducer})

export default store

// following are only the types real instances are created in hooks.ts

// RootState - function with return type is the state
// https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype
export type RootState = ReturnType<typeof store.getState>

// AppDispatch - function to change the state
// AppDispatch(action name)
export type AppDispatch = typeof store.dispatch