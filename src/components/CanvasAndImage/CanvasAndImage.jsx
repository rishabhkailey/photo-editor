import React, {Component} from 'react';
// input image file -> image data url(by image reader) -> image (new Image(data url)) -> imageData (by image -> canvas -> imageData)
// originalImage, displayImage, editedImage represent image data(array and width) not image html element

class CanvasAndImage extends Component {

    constructor(props) {
        super(props);

        // canvasContainerRef = container of canvas (its dimentions will be changed according to image dimentions)
        // canvasAvailabeSpaceRef = container of (canvasContainerRef) its dimentions will not be changed but will be used to calculate dimentions of cavnasContainerRef
        this.canvasRef = React.createRef();
        this.canvasContainerRef = React.createRef();
        this.canvasAvailableSpaceRef = React.createRef();
        this.ctx = null;
        
        // just for backup original image file without any changes
        this.originalImage = null;

        // image which is being currently displayed (under editing)
        this.displayImage = null;

        // edited image, value = displayImage when display image or currently editing image is saved 
        this.editedImage = null;

        // full res edited image, used by crop where res is decreased, so to maintain the quality it is used, and the last save image will reapply all the changes on the full res image then save (full res image)
        this.fullResEditedImage = null; 

        // image file which can be read by fileReader and can convert it into data url (image)(after that can be stored in originalImage, displayImage, editedImage)
        this.imageFile = null;

        // html image element, try not to use this 
        this.image = new Image();

        // contains all funtions required by the features
        this.canvasFunctions = {};

        // contains all elements(refs) which can be used e.g. canvasRef, canvasContainerRef
        this.canvasElements = {};

        this.state = {
            isImageLoaded: false 
        }
    }

    /*------------------------images-------------------------------*/
    // returns new refernce of editedImage, so you can not do changes in editedImage use display image instead for intermediate changes
    
    getFullResEditedImage = ()=> {        
        if(!this.state.isImageLoaded)
            return;

        let image = this.fullResEditedImage;
        return new ImageData(new Uint8ClampedArray(image.data), image.width);
    }

    setFullResEditedImage = (image)=> {
        this.fullResEditedImage = new ImageData(new Uint8ClampedArray(image.data), image.width);
        console.log(this.fullResEditedImage);
    }

    getEditedImage = ()=> {
        if(!this.state.isImageLoaded)
            return;

        let image = this.editedImage;
        return new ImageData(new Uint8ClampedArray(image.data), image.width);
    }

    // set new reference because this image reference incoming can be of displayImage 
    // try not to use this, use setDisplayImageAndSaveEdits // if using this don't forget to call drawImage
    setEditedImage = (image)=> {
        if(!this.state.isImageLoaded)
            return;

        this.editedImage = new ImageData(new Uint8ClampedArray(image.data), image.width);
    }
    
    getDisplayImage = ()=> {
        if(!this.state.isImageLoaded)
            return;
        
        return this.displayImage;
    }

    // requires new reference
    setDisplayImage = (image)=> {
        if(!this.state.isImageLoaded)
            return;
           
        this.displayImage = image;
        this.drawImage();
    }

    saveEdits = ()=> {
        if(!this.state.isImageLoaded)
            return;
            
        this.setDisplayImageAndSaveEdits(this.getDisplayImage());
    }

    setDisplayImageAndSaveEdits = (image)=> {
        if(!this.state.isImageLoaded)
            return;
        
        let {width, height} = this.canvasContainerRef.current.getBoundingClientRect();
        if(parseInt(width) - parseInt(image.width) > 10 || parseInt(height) - parseInt(image.height) > 10) {
            console.log("scaling the image to canvas size ");

            // scale image is asynchronous so we cannot return imagedata from it so instead we are calling setDisplayImageAndSaveEdits in it (it is not recurssion this fucntion will complete first)
            this.changeCanvasDimensions({width: image.width, height: image.height})
            // scale the image so if image size is less then canvas size (scale the image) (canvas size is not effected by image, canvas ratio is effected by image)
            image = this.scaleImageToCanvaSize(image);

        }
        else {
            this.setEditedImage(image);
            this.setDisplayImage(image);
        }
        
    }

    initializeDisplayImage = ()=> {
        if(!this.state.isImageLoaded)
            return;
            
        let image = this.editedImage;
        this.displayImage =  new ImageData(new Uint8ClampedArray(image.data), image.width);
        this.drawImage();
    }
    /*------------------------images-------------------------------*/

    /*-------------------SCALING-------------------------------------*/
    scaleImageToCanvaSize = (image)=> {
        // converting imagedata to image element
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;

        canvas.getContext("2d").putImageData(image, 0, 0);
        
        let imageObject = new Image();
        imageObject.src = canvas.toDataURL();

        let imageData = null;

        imageObject.onload = ()=> {
            imageData = this.imageToImageData(imageObject);
            this.setDisplayImageAndSaveEdits(imageData);
        }
    }
    /*-------------------SCALING-------------------------------------*/

    /*----------------------------DRAW----------------------------------------------*/
    // draw display image
    drawImage = (left, top)=> {
        left = left|0;
        top = top|0;
	    this.ctx.putImageData(this.displayImage, left, top);
    }
    /*----------------------------DRAW----------------------------------------------*/
    
    /*-------------------------CANVAS--------------------------*/
    changeCanvasDimensions = ({width, height}) => {
        let container = this.canvasContainerRef.current;
        let canvas = this.canvasRef.current;
        let availableSpace = this.canvasAvailableSpaceRef.current

        let {height: availableHeight, width: availableWidth} = availableSpace.getBoundingClientRect();
        
		let ratio = availableWidth/width;
		if((height*ratio) > availableHeight) {
			ratio = availableHeight/height;
		}

		canvas.width = ratio*width;
        canvas.height = ratio*height;
        
		container.style.width = ratio*width+'px';
        container.style.height = ratio*height+'px';
        
	}
    /*-------------------------CANVAS--------------------------*/


    /*-------------------------IMAGE INPUT ----------------*/
    
    imageToImageData = (image, fullRes)=> {
        let canvas1 = document.createElement('canvas');
        // because original image resolution is changed according to the display size, i.e. = canvas resolution
        let canvas = this.canvasRef.current;
        canvas1.width = canvas.width;
        canvas1.height = canvas.height;    
    
        if(fullRes) {
            canvas1.width = image.width;
            canvas1.height = image.height;    
        }

        let ctx = canvas1.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas1.width, canvas1.height);
        return ctx.getImageData(0, 0, canvas1.width, canvas1.height);
    }

    fileReaderNewImageHandler = (e)=> {
        this.image.src = e.target.result;
        // now image.onload event will call displayInputImage
    }

    displayInputImage = (e)=> {
        this.setState({isImageLoaded: true});
        this.props.setGlobalState({isImageLoaded: true});

        this.changeCanvasDimensions({width: this.image.width, height: this.image.height});
        
        let imageData = this.imageToImageData(this.image);
        let fullResImageData = this.imageToImageData(this.image, true);
        this.setFullResEditedImage(fullResImageData);
        this.setDisplayImageAndSaveEdits(imageData);
    }

    imageInput = (e)=> {
        if(e.target.files && e.target.files.length === 0)
            return;

        this.imageFile = e.target.files[0];

        // it will trigger fileReader.onload event and call fileReaderNewImageHandler 
        this.fileReader.readAsDataURL(e.target.files[0]);
    }
    
    componentDidMount() {
        this.fileReader = new FileReader();
        this.fileReader.onload = this.fileReaderNewImageHandler
        this.image.onload = this.displayInputImage;
        this.ctx = this.canvasRef.current.getContext('2d');
        this.canvasFunctions = {getDisplayImage: this.getDisplayImage, setDisplayImage: this.setDisplayImage, setDisplayImageAndSaveEdits: this.setDisplayImageAndSaveEdits, getEditedImage: this.getEditedImage, saveEdits: this.saveEdits, getFullResEditedImage: this.getFullResEditedImage, setFullResEditedImage: this.setFullResEditedImage};
        this.canvasElements = {canvas: this.canvasRef, canvasContainer: this.canvasContainerRef};
        
        this.props.setGlobalState({canvasFunctions: this.canvasFunctions, canvasElements: this.canvasElements})
    }

    /*-------------------------IMAGE INPUT ----------------*/
    
    render() {
        return <div className="d-flex flex-column align-items-stretch h-100">
            <div className="d-flex flex-column align-items-center">
                <input className="border" type='file' accept="images" onChange={this.imageInput} />
            </div>
            <div className="flex-grow-1 d-flex flex-row justify-content-center align-items-center" ref={this.canvasAvailableSpaceRef}>
                <div style={{height: "100%", width: "100%", position: "relative"}} ref={this.canvasContainerRef}>
                    <div className="flex-grow-1" style={{position: "relative"}} >
                        <canvas ref={this.canvasRef}></canvas>
                    </div>
                </div>
            </div>

        </div>
    }
}

export default CanvasAndImage;