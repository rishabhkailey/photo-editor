// returns object that represent type of the action and data(payload) required by the action

import { SET_IMAGE_LOADED, SET_CANVAS_FUNCTIONS, SET_CANVAS_ELEMENTS, SET_SELECTION_INFO } from "./actionTypes.js";

export const setImageLoaded = isImageLoaded => {
    return {
        type: SET_IMAGE_LOADED,
        payload: {
            isImageLoaded
        }
    }
}

export const setCanvasFunctions = canvasFunctions => ({
    type: SET_CANVAS_FUNCTIONS,
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

export const setSelectionInfo = selectionInfoObj => ({
    type: SET_SELECTION_INFO,
    payload: {
        selectionEnabled: selectionInfoObj.selectionEnabled,
        selectionMapping: selectionInfoObj.selectionMapping,
        temporaryDisabled: !!selectionInfoObj.temporaryDisabled // by default false
    }
})