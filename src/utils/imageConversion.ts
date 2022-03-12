import { WidthHeight } from "../type";

// returns the image Data for the input image, if the resolution object is not provided then the FullResolutionImage data will be returned
// ideally it should never return undefined
export function imageElementToImageData(image: HTMLImageElement, resolution?: WidthHeight): ImageData {
  
  // temporary canvas element
  let canvas = document.createElement('canvas');
  console.debug("imageElementToImageData called with resolution", resolution)
  if (resolution === undefined) {
    canvas.width = image.width;
    canvas.height = image.height;
  }
  else {
    canvas.width = resolution.width;
    canvas.height = resolution.height;  
  }
  
  let ctx:CanvasRenderingContext2D | null = canvas.getContext('2d');
  
  let imageData: ImageData|undefined;
  try {
    ctx?.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
    imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);      
  }
  catch (e) {
    console.debug("Error in converting Image Element to Image Data", e)
    throw e
  }
  if(!imageData) {
    // return new ImageData(0, 0)
    throw Error("Error in converting Image Element to Image Data. imageData of input imageElement comes out to be undefined")
  }
  return imageData
}

export function imageDataToImageSrc (image: ImageData): string {
  let { height, width } = image;

  // temporary canvas html element
  let canvas = document.createElement("canvas");

  canvas.height = height;
  canvas.width = width;

  let ctx: any = canvas.getContext('2d');
  ctx.putImageData(image, 0, 0);

  return canvas.toDataURL('image/png');
}


// export function scaleImage(imageElement: HTMLImageElement, resolution: WidthHeight) {
  
// }