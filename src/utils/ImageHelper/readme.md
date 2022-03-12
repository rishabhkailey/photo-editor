# ImageHelper class

# Constructors


# Fields (with getter and setters?)

## `originalImageElement: HTMLImageElement` - 
image Element which contains the original Image Element without any changes., not currently used by any feature but for future use when we add reset button to reset all the changes and when we add undo/redo button.
 
Events - 
* onload - `this.originalImageElementOnLoadHandler`

> originalImageElement setter will be private. it can only be set when the user selects a new image to edit.

## `fullResImageElement: HTMLImageElement`
it is Image ELement with all the saved changes with full Resolution. 

#

## `imageElement: HTMLImageElement`
it is Image ELement with all the saved changes. same as fullResImageElement but the resolution of the image is equal to the size of the canvas element(displayed image element).

#

## `editedImageElement: HTMLImageElement`
it is Image Element with all the unsaved changes. editedImageElement also represent the current display image. 

#

## `fullResImageData: ImageData`
it is Image Data of full resolution image with all the saved changes.

`setter` - on setting the fullResImageData, fullResImageElement will also be set.

#

## `imageData: ImageData`
it is Image Data with all the saved changes. same as fullResImageData but the resolution of the image is equal to the size of the canvas element(displayed image element).

`setter` - on setting the imageData, imageElement will also be set.

#

## `editedImageData: ImageData`

it is Image Data with all the unsaved changes. editedImageData also represent the current display image.

`setter` - on setting the editedImageData, editedImageElement will also be set. will scale canvas according to edited image dimensions.

> we can set any resolution of image Data in editedImageData, its resolution will be automatically scaled to canvas size.

#

## `static fileReader: FileReader`

it is used to read the image file selected by the user.

Events - 

* `onload` - calls fileReaderOnLoadHandler()


# Life Cycles

## Constructor

1. `constructor(imageInputFile: Blob, canvasHelper: CanvasHelper)` 
2. inside constructor we read the imageInputFile using fileReader and its onload event is called `fileReaderOnLoadHandler()`
3. inside fileReaderOnLoadHandler we set the originalImageElement and its onload event calls the `originalImageElementOnLoadHandler`
4. inside `originalImageElementOnLoadHandler` we intialize the image element and image data fields, and other methods like scaleCanvas.

## setters
fullResImageData -> fullResImageElement, fullResEditedImageData, imageData
imageData -> imageDataElement
fullResEditedImageData -> fullResEditedImageElement, editedImageData
editedImageData -> editedImageElement

#
## on window resize
> on window resize needs to be rethink, we don't have any way to recalculate the editedImageElement and data as we don't hvae fullResEditedIamge element.

## ~~on window resize -> set the imageElement, editedImage, editedImageElement from canvas resolution and fullResImageData~~

#
## on save
set fullResImageData(which will further set fullResImageElement). no need to set editedImage that should already contains the correct iamge data.

#

# Methods

image Life cycle




fullResImageElement = full res saved image 
fullResImageData = full res saved image data


// image element
fullResImageElement: HTMLImageElement
imageElement: HTMLImageElement
editedImageElement: HTMLImageElement

// image data
fullResImageData: ImageData
imageData: ImageData
editedImageData: ImageData

private setter only be set when we select new image
originalImage element


onload originalImageElement => set FullResImageData => set fullResImageELement

onwindow resize => set image data from fullResImageELement => set image elelemtn

onsave set => fullResImageData => fullResImageElement 

on fullResImageData set => set full res iamge Element( => edited image Data => edited image element)

set fullresiamgeElement set(onload?) => edited image Data => edited image element

