# CanvasHelper Class

## Fields
#
* `canvasElement: HTMLCanvasElement` 
* `canvasContext: CanvasRenderingContext2D`
* `canvasContainerElement: HTMLCanvasElement`
* `availableSpaceForCanvas: WidthHeight`

## Constructor
#
`constructor(canvasElement: HTMLCanvasElement, canvasContainerElement: HTMLCanvasElement, availableSpaceForCanvas: WidthHeight)`

Required fields by Constructor and the reason
* `canvasElement` - used to make any changes to the canvas
* `canvasContainerElement` - used for resizing the canvas
* `availableSpaceForCanvas` - used in for scaling the canvas. e.g. for scaling canvas to image size we need to know the max height and width available for the canvas.