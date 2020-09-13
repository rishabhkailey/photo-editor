// returns object that represent type of the action and data(payload) required by the action

import { SET_IMAGE_LOADED, SET_CANVAS_FUNCTIONS, SET_CANVAS_ELEMENTS } from "./actionTypes.js";

export const setImageLoaded = isImageLoaded => {
    return {
        type: SET_IMAGE_LOADED,
        payload: {
            isImageLoaded
        }
    }
}

export const setCanvasFunctions = canvasFunctions => ({
    type: SET_CANVAS_ELEMENTS,
    payload: {
        canvasFunctions
    }
})

export const setCanvasElements = canvasElements => ({
    type: SET_CANVAS_ELEMENTS,
    payload: {
        canvasElements
    }
})