import { Point, WidthHeight } from "../../type"

export default class CanvasHelper {

  canvasElement: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D
  canvasContainerElement: HTMLCanvasElement
  // TODO - check how we can update availableSpaceForCanvas dynamicaly
  availableSpaceForCanvas: WidthHeight

  // default value doesn't do anything in getter we getting the actual dimension of the cavnas
  _canvasDimension: WidthHeight = { width: 300, height: 300}

  constructor(canvasElement: HTMLCanvasElement, canvasContainerElement: HTMLCanvasElement, availableSpaceForCanvas: WidthHeight) {
    this.canvasElement = canvasElement
    let ctx = canvasElement.getContext('2d')
    if (!ctx) {
      throw Error("unable to get canvas context")
    }
    this.canvasContext = ctx
    this.canvasContainerElement = canvasContainerElement
    this.availableSpaceForCanvas = availableSpaceForCanvas
  }

  changeCanvasDimension({height, width}: WidthHeight) {

    console.debug(`canvas dimension changed to ${height}, ${width}`)

    this.canvasElement.width = width;
    this.canvasElement.height = height;

    this.canvasContainerElement.style.width = width + 'px';
    this.canvasContainerElement.style.height = height + 'px';
  }

  // TODO - add draw image for other image types i.e. imageElement and imageSource if required
  drawImageFromImageData(imageData: ImageData, offset?: Point) {
    let x = 0, y = 0;
    if (offset != undefined) {
      x = offset.x
      y = offset.y
    }
    this.canvasContext.putImageData(imageData, x, y);
  }

  // maxCanvasSize = space available for the canvas element
  scaleCanvas(size: WidthHeight) {
    
    let { height, width } = size
    let { height: availableHeight, width: availableWidth } = this.availableSpaceForCanvas
    console.debug(`scaleCanvas input ${size.height}, ${size.width}, available space = ${availableHeight}, ${availableWidth}`)
    
    // ah = avaialble height, ih = image height, ch = canvas height
    // if ah/ih > aw/iw (ch = ah, cw = ah/ih * iw) // here ratio = ah/ih
    // else (cw = aw, ch = aw/iw * ih) // here ratio = aw/iw
 
    let newCanvasDimension = { 
      height: availableHeight,
      width: availableWidth
    }

    if (availableWidth/width < availableHeight/height) {
      console.debug(`canvas width = available width, height will be scaled accordingly`)
      newCanvasDimension.height = (availableWidth/width) * height
    }
    else {
      console.debug(`canvas height = available height, width will be scaled accordingly`)
      newCanvasDimension.width = (availableHeight/height) * width
    }
    
    console.debug(`scaleCanvasTosize final ${newCanvasDimension.height}, ${newCanvasDimension.width}`)
    this.changeCanvasDimension(newCanvasDimension)
  }

  get canvasDimension(): WidthHeight {
    return {
      width: this.canvasElement.width,
      height: this.canvasElement.height
    }
  }

}