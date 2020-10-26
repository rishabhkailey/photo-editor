import { setSelectionInfo } from "../actions.js";
// combine multiple reducers (function which uses data from actions (type, data(payload)) to set state(store))
// you can have multiple reducer function and combine them but here we will only have one reducer function as of now
// reducer function returns the state according to the action type

import { SET_IMAGE_LOADED, SET_CANVAS_FUNCTIONS, SET_CANVAS_ELEMENTS, SET_SELECTION_INFO } from "./../actionTypes.js";

const initialState = {
    isImageLoaded: false,
    canvasFunctions: null,
    canvasElements: null,
    selectionInfo: {
        selectionEnabled: false,
        selectionMapping: null,
        temporaryDisabled: false
    }
}

export default (state = initialState, action) => {
    console.log("redux state", state, "payload", action.payload);
    switch (action.type) {
        case SET_IMAGE_LOADED:
            {
                return {
                    ...state,
                    // ...action.payload // it creates confustion
                    isImageLoaded: action.payload.isImageLoaded
                }
            }
        case SET_CANVAS_FUNCTIONS:
            {
                return {
                    ...state,
                    // ...action.payload
                    canvasFunctions: action.payload.canvasFunctions
                }
            }
        case SET_CANVAS_ELEMENTS:
            {
                return {
                    ...state,
                    canvasElements: action.payload.canvasElements
                        // ...action.payload
                }
            }
        case SET_SELECTION_INFO:
            {
                return {
                    ...state,
                    selectionInfo: {
                        selectionEnabled: action.payload.selectionEnabled,
                        selectionMapping: action.payload.selectionMapping
                    }
                }
            }
        default:
            {
                return state
            }
    }
}