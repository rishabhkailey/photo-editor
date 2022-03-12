// returns object that represent type of the action and data(payload) required by the action

import { SET_IMAGE_LOADED, SET_SELECTION_INFO, SHOW_DISABLE_SELECTION_TOOLTIP } from "./actionTypes";

export const setImageLoaded = (isImageLoaded: boolean): {type: any, payload: any}  => {
    return {
        type: SET_IMAGE_LOADED,
        payload: {
            isImageLoaded
        }
    }
}

export const setSelectionInfo = (selectionInfoObj: any): {type: any, payload: any} => ({
    type: SET_SELECTION_INFO,
    payload: {
        selectionEnabled: selectionInfoObj.selectionEnabled,
        selectionMapping: selectionInfoObj.selectionMapping,
        fullResSelectionMapping: selectionInfoObj.fullResSelectionMapping,
        temporaryDisabled: !!selectionInfoObj.temporaryDisabled // by default false
    }
})

export const setShowDisableSelectionTooltip = (really_LOL: any): {type: any, payload: any} => ({
    type: SHOW_DISABLE_SELECTION_TOOLTIP,
    payload: {
        value: !!really_LOL
    }
})