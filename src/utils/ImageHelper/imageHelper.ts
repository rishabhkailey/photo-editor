import CanvasHelper from "../CanvasHelper/canvasHelper";
import { imageDataToImageSrc, imageElementToImageData } from '../../utils/imageConversion';
import { WidthHeight } from "../../type";

export default class ImageHelper {

  // image element
  originalImageElement: HTMLImageElement = new Image()
  fullResImageElement: HTMLImageElement = new Image()
  imageElement: HTMLImageElement = new Image()
  editedImageElement: HTMLImageElement = new Image()
  fullResEditedImageElement: HTMLImageElement = new Image()

  // image data (intialized with 1px till the image is loaded)
  _fullResImageData: ImageData = new ImageData(new Uint8ClampedArray(1 * 1 * 4), 1, 1)
  _imageData: ImageData = new ImageData(new Uint8ClampedArray(1 * 1 * 4), 1, 1)
  _editedImageData: ImageData = new ImageData(new Uint8ClampedArray(1 * 1 * 4), 1, 1)
  _fullResEditedImageData: ImageData = new ImageData(new Uint8ClampedArray(1 * 1 * 4), 1, 1)

  canvasHelper: CanvasHelper

  // tells if all the objects are intialized or not, because some are intialized asynchronously 
  loaded = false

  // used for reading blob image files
  static fileReader: FileReader = new FileReader();

  get fullResImageData(): ImageData {
    return this._fullResImageData
  }

  set fullResImageData(imageData: ImageData) {
    this._fullResImageData = imageData
    this.fullResImageElement.src = imageDataToImageSrc(imageData)
    this.fullResEditedImageData = imageData
    ImageHelper.scaleImage(imageData, this.canvasHelper.canvasDimension, (imageData: ImageData) => {
      this.imageData = imageData
    })
  }

  get editedImageData(): ImageData {
    return this._editedImageData
  }

  // this will only set the editedImageData and it will not handle the change in resolutionth
  // it performe better the set editedImageData use this when there are a lot of updates in short interval of time
  set displayImageData(imageData: ImageData) {
    this._editedImageData = imageData
    this.canvasHelper.drawImageFromImageData(this.editedImageData)
  }

  set editedImageData(imageData: ImageData) {
    
    console.debug("in editedImageData setter")
    console.debug(`Math.abs(${Math.floor(imageData.width)} - ${Math.floor(this.canvasHelper.availableSpaceForCanvas.width)}) > 0 && Math.abs(${Math.floor(imageData.width)} - ${Math.floor(this.canvasHelper.availableSpaceForCanvas.width)}) > 0`)

    // editedImageData is the displayed image
    // Check if the image resolution changed, if yes scale canvas and image accordingly and display the image else just display the image as it is
    if (Math.abs(Math.floor(imageData.width) - Math.floor(this.canvasHelper.availableSpaceForCanvas.width)) > 0 && Math.abs(Math.floor(imageData.width) - Math.floor(this.canvasHelper.availableSpaceForCanvas.width)) > 0) {
      console.debug("image resolution changed, need to scale canvas and image accordingly")
      this.canvasHelper.scaleCanvas(imageData)
      ImageHelper.scaleImage(imageData, this.canvasHelper.canvasDimension, (imageData) => {
        console.debug(`image scaled to ${imageData.height}, ${imageData.width}`)
        this._editedImageData = imageData
        this.editedImageElement.src = imageDataToImageSrc(imageData)
        this.canvasHelper.drawImageFromImageData(this.editedImageData)
        this.loaded = true
        console.debug("imageHelper intialized", this)
      })
    }
    else {
      console.debug("image resolution didn't changed", this)
      this._editedImageData = imageData
      this.editedImageElement.src = imageDataToImageSrc(imageData)
      this.canvasHelper.drawImageFromImageData(this.editedImageData)
      this.loaded = true
      console.debug("imageHelper intialized")
    }
  }

  get fullResEditedImageData(): ImageData {
    return this._fullResEditedImageData
  }

  set fullResEditedImageData(imageData: ImageData) {
    this._fullResEditedImageData = imageData
    this.editedImageElement.src = imageDataToImageSrc(imageData)
    this.editedImageData = imageData
  }

  get imageData(): ImageData {
    return this._imageData
  }

  set imageData(imageData: ImageData) {
    this._imageData = imageData
    this.imageElement.src = imageDataToImageSrc(imageData)
  }

  // accept the image file from the input element of type blob and canvas helper object
  constructor(imageInputFile: Blob, canvasHelper: CanvasHelper) {

    this.canvasHelper = canvasHelper

    // will be called when the image is loaded (will be called when we select a new image)
    this.originalImageElement.onload = this.originalImageElementOnLoadHandler

    // onload event will call callback function when we read the image input file  
    ImageHelper.fileReader.onload = this.fileReaderOnLoadHandler
    console.debug("Reading the image file")
    try {
      ImageHelper.fileReader.readAsDataURL(imageInputFile)
    }
    catch (err: any) {
      console.error("Exception in reading the input file.", err)
    }
  }

  // (=> for binding this/context=imageHelper instance)
  // callback for fullResImageData onload event, it is called when we set the src of fullResImageElement.
  // here we will set all the image elements and all the image data from the fullResImageElement 
  originalImageElementOnLoadHandler = () => {
    // this will either change the height or width or nothing of the canvas to make the canvas ratio equals to the image ratio
    this.canvasHelper.scaleCanvas({ width: this.originalImageElement.width, height: this.originalImageElement.height })
    let fullResImageData = imageElementToImageData(this.originalImageElement);
    this.fullResImageData = fullResImageData

    // this.fullResEditedImageData = fullResImageData
    
    // set editedImageData (async function)
    // ImageHelper.scaleImage(fullResImageData, this.canvasHelper.canvasDimension, (imageData: ImageData) => {
    //   this.editedImageData = imageData
    // })

    // set imageData
    // ImageHelper.scaleImage(fullResImageData, this.canvasHelper.canvasDimension, (imageData: ImageData) => {
    //   this.imageData = imageData
    // })
  }

  // (=> for binding this/context=imageHelper instance)
  // callback for the filereader onload event, it is called when we read new image input file using the filereader
  fileReaderOnLoadHandler = (e: any) => {
    console.debug(this)
    this.originalImageElement.src = e.target.result;
    // now this.fullResImageElement.onload event will call displayInputImage
  }

  static scaleImage(imageData: ImageData, resolution: WidthHeight, callback: (imageData: ImageData) => void) {
    console.debug(`scale image called for ${imageData}, resolution = ${resolution}`)
    // canvas doesn't scale input image when we use putImageData, but it does scale canvas when use draw image function
    // we will be converting the image data to image element and use that to call drawImage and get the data from the canvas
    let imageElement: HTMLImageElement = new Image()
    imageElement.onload = () => {
      callback(imageElementToImageData(imageElement, resolution))
    }
    imageElement.src = imageDataToImageSrc(imageData)
  }

  resetDisplayImage() {
    this.fullResEditedImageData = this.fullResImageData
  }

}

// todo - add a new constructor which will accept canvas helper properties and create a new canvas helper instance by it self

// we want this to be imported by multiple functions and used
// so for that we will need to either make image file as global state or image element
// making image blob file global will make the canvas helper function simpler