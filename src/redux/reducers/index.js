// combine multiple reducers (function which uses data from actions (type, data(payload)) to set state(store))
// you can have multiple reducer function and combine them but here we will only have one reducer function as of now
// reducer function returns the state according to the action type

import { SET_IMAGE_LOADED, SET_CANVAS_FUNCTIONS, SET_CANVAS_ELEMENTS } from "./../actionTypes.js";

const initialState = {
    isImageLoaded: false,
    canvasFunctions: null,
    canvasElements: null
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_IMAGE_LOADED:
            {
                return {
                    ...state,
                    ...action.payload
                }
            }
        case SET_CANVAS_FUNCTIONS:
            {
                return {
                    ...state,
                    ...action.payload
                }
            }
        case SET_CANVAS_ELEMENTS:
            {
                return {
                    ...state,
                    ...action.payload
                }
            }
    }
}