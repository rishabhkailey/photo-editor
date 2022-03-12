import { Ref } from "react";
import ImageHelper from "./utils/ImageHelper/imageHelper";

type WidthHeight = {
  width: number,
  height: number
}


type Point = {
  x: number,
  y: number
}

interface selectionInfo {
  selectionEnabled: boolean,
  selectionMapping: any,
  temporaryDisabled: boolean,
  fullResSelectionMapping: any
}

// change name to redux state
interface state {
  isImageLoaded: boolean,
  canvasFunctions: any,
  canvasElements: any,
  selectionInfo: selectionInfo,
  showDisableSelectionTooltip: boolean
}

// move to some different file
// TODO - remove canvasRef and canvasContainerRef, and make imageHelper and isImageLoaded as permanent istead of optional
interface GlobalState {
  canvasRef: React.RefObject<any>,
  canvasContainerRef: React.RefObject<any>,
  imageHelper?: ImageHelper,
  isImageLoaded?: Boolean
}