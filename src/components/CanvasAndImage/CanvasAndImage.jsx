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

        // image file which can be read by fileReader and can convert it into data url (image)(after that can be stored in originalImage, displayImage, editedImage)
        this.imageFile = null;

        // html image element, try not to use this 
        this.image = new Image();

        // contains all funtions required by the features
        this.canvasFunctions = {};

        this.state = {
            isImageLoaded: false 
        }
    }

    /*------------------------images-------------------------------*/
    // returns new refernce of editedImage, so you can not do changes in editedImage use display image instead for intermediate changes
    getEditedImage = ()=> {
        if(!this.state.isImageLoaded)
            return;

        let image = this.editedImage;
        return new ImageData(new Uint8ClampedArray(image.data), image.width);
    }

    // set new reference because this image reference incoming can be of displayImage 
    // try not to use this, use setDisplayImageAndSaveEdits // if using this don't forget to call drawImage
    setEditedImage = (image, isImageDimentionsChanged)=> {
        if(!this.state.isImageLoaded)
            return;
            
        if(isImageDimentionsChanged === true) {
            this.changeCanvasDimensions({width: image.width, height: image.height})
        }
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
            
        this.setEditedImage(image);
        this.setDisplayImage(image);
    }

    initializeDisplayImage = ()=> {
        if(!this.state.isImageLoaded)
            return;
            
        let image = this.editedImage;
        this.displayImage =  new ImageData(new Uint8ClampedArray(image.data), image.width);
        this.drawImage();
    }
    /*------------------------images-------------------------------*/



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
    
    imageToImageData = (image)=> {
        let canvas1 = document.createElement('canvas');
        // because original image resolution is changed according to the display size, i.e. = canvas resolution
        let canvas = this.canvasRef.current;
        
        canvas1.width = canvas.width;
        canvas1.height = canvas.height;

        let ctx = canvas1.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas1.width, canvas1.height);
        console.log(ctx.getImageData(0, 0, canvas1.height, canvas1.width));
        return ctx.getImageData(0, 0, canvas1.width, canvas1.height);
    }

    fileReaderNewImageHandler = (e)=> {
        this.image.src = e.target.result;
    }

    displayInputImage = (e)=> {
        this.setState({isImageLoaded: true});
        this.props.setGlobalState({isImageLoaded: true});

        this.changeCanvasDimensions({width: this.image.width, height: this.image.height});
        
        let imageData = this.imageToImageData(this.image);
        this.setDisplayImageAndSaveEdits(imageData)
    }

    imageInput = (e)=> {
        if(e.target.files && e.target.files.length === 0)
            return;

        this.imageFile = e.target.files[0];

        // it will trigger fileReader.onload event 
        this.fileReader.readAsDataURL(e.target.files[0]);
    }
    
    componentDidMount() {
        this.fileReader = new FileReader();
        this.fileReader.onload = this.fileReaderNewImageHandler
        this.image.onload = this.displayInputImage;
        this.ctx = this.canvasRef.current.getContext('2d');
        // console.log(this);
        this.canvasFunctions = {getDisplayImage: this.getDisplayImage, setDisplayImage: this.setDisplayImage, setDisplayImageAndSaveEdits: this.setDisplayImageAndSaveEdits, getEditedImage: this.getEditedImage, saveEdits: this.saveEdits};
        this.props.setGlobalState({canvasFunctions: this.canvasFunctions})
    }

    /*-------------------------IMAGE INPUT ----------------*/
    
    render() {
        return <div className="d-flex flex-column align-items-stretch h-100">
            <div className="d-flex flex-column align-items-center">
                <input className="border" type='file' accept="images" onChange={this.imageInput} />
            </div>
            <div className="flex-grow-1 d-flex flex-row justify-content-center align-items-center" ref={this.canvasAvailableSpaceRef}>
                <div style={{height: "100%", width: "100%"}} ref={this.canvasContainerRef}>
                    <div className="flex-grow-1" style={{position: "relative"}} >
                        <canvas ref={this.canvasRef}></canvas>
                    </div>
                </div>
            </div>

        </div>
    }
}

export default CanvasAndImage;