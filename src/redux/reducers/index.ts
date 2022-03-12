import { setSelectionInfo } from "../actions";
import { state } from "../../type.js";

// combine multiple reducers (function which uses data from actions (type, data(payload)) to set state(store))
// you can have multiple reducer function and combine them but here we will only have one reducer function as of now
// reducer function returns the state according to the action type

import { SET_IMAGE_LOADED, SET_SELECTION_INFO, SHOW_DISABLE_SELECTION_TOOLTIP } from "./../actionTypes";



const initialState: state = {
  isImageLoaded: false,
  canvasFunctions: null,
  canvasElements: null,
  selectionInfo: {
    selectionEnabled: false,
    selectionMapping: null,
    temporaryDisabled: false,
    fullResSelectionMapping: null
  },
  showDisableSelectionTooltip: false
}

export default (state: state = initialState, action: any): state => {
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
    case SET_SELECTION_INFO:
      {
        return {
          ...state,
          selectionInfo: {
            selectionEnabled: action.payload.selectionEnabled,
            selectionMapping: action.payload.selectionMapping,
            fullResSelectionMapping: action.payload.fullResSelectionMapping,
            temporaryDisabled: false
          }
        }
      }
    case SHOW_DISABLE_SELECTION_TOOLTIP:
      {
        return {
          ...state,
          showDisableSelectionTooltip: action.payload.value
        }
      }
    default:
      {
        return state
      }
  }
}