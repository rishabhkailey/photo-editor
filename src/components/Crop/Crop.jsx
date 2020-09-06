import React, {Component} from "react";
import history from "./../../history.js";

class Crop extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cropEnabled: false,
            needToEnableCrop: false // pending to enable crop
        }

        // this is used by crop rect on click handler, clicked near left edge its value = l, if top left then = lr, if in center = ''
        this.nearEdge = '';

        //when on click on cropRect the initial position is stored here and we calculate distance of this initial position - current position
        this.initialPosition = {x: 0, y: 0};

        // store value of previous translate value, used to calculate new translate value
        this.translate = {x: 0, y: 0};

        // translate value of previous onmousedown session(changed on onmouseup)
        this.offset = {x: 0, y: 0};

        // dimention of previous onmousedown session 
        this.dimentionOffset = {width: 0, height: 0};

        this.cropRectRef = React.createRef();
    }

    isNearEdge = ({clientX: mouseX, clientY: mouseY})=> {

		let {left: cropRectLeft, top: cropRectTop, bottom: cropRectBottom, right: cropRectRight} = this.cropRectRef.current.getBoundingClientRect();

		this.nearEdge = '';
		if(Math.abs(mouseX - cropRectLeft) < 10) {
			this.nearEdge += 'l';
		}
		else if(Math.abs(mouseX - cropRectRight) < 10) {
			this.nearEdge += 'r';
		}

		if(Math.abs(mouseY - cropRectTop) < 10) {
			this.nearEdge += 't';
		}
		else if(Math.abs(mouseY - cropRectBottom) < 10) {
			this.nearEdge += 'b';
		}

		if(this.nearEdge.length > 0) {
			return true;
		}

		return false;
    }
    
    cropRectOnClickHandler = (e)=> {

        this.initialPosition = {x: e.clientX, y: e.clientY};

        if(this.isNearEdge(e)) {
            window.onmousemove = this.changeCropRectDimention;
        }
        else {
            window.onmousemove = this.changeCropRectPosition;
        }
        window.onmouseup = ()=> {
            this.offset = {x: this.translate.x, y: this.translate.y};
            this.dimentionOffset ={height: this.cropRectRef.current.getBoundingClientRect().height, width: this.cropRectRef.current.getBoundingClientRect().width};
            window.onmousemove = null;
        }
    }

    changeCropRectDimention = (e)=> {
        
        let cropRect = this.cropRectRef.current;
        let widthChange = 0;
        let heightChange = 0;

		if(this.nearEdge.indexOf('l') !== -1) {
			this.translate.x = this.offset.x + (e.clientX - this.initialPosition.x);
			widthChange= e.clientX - this.initialPosition.x;
		}
		else if(this.nearEdge.indexOf('r') !== -1) {
			widthChange = this.initialPosition.x - e.clientX;
		}
		
		if(this.nearEdge.indexOf('t') !== -1) {
			this.translate.y = this.offset.y+ (e.clientY - this.initialPosition.y);
			heightChange = e.clientY - this.initialPosition.y;
		}
		else if(this.nearEdge.indexOf('b') !== -1) {
			heightChange = this.initialPosition.y - e.clientY;
		}
		cropRect.style.width = `${this.dimentionOffset.width - widthChange}px`;
		cropRect.style.height = `${this.dimentionOffset.height - heightChange}px`;
		cropRect.style.transform = `translateX(${this.translate.x}px) translateY(${this.translate.y}px)`;
    }

    changeCropRectPosition = ({clientX, clientY})=> {

        let newTraslateX = this.offset.x + (clientX - this.initialPosition.x);
        let newTraslateY = this.offset.y + (clientY - this.initialPosition.y);

        let cropRect = this.cropRectRef.current;
        
        // container left right (boundaries crop rect should not exceed these values)
        let containerRect = this.props.canvasElements.canvasContainer.current.getBoundingClientRect();

        let newLeft = newTraslateX + parseInt(cropRect.style.left);
        let newRight = newLeft + parseInt(cropRect.style.width);
        let newTop = newTraslateY + parseInt(cropRect.style.top);
        let newBottom = newTop + parseInt(cropRect.style.height);

        if(newLeft < containerRect.left) {
            // console.log("wrong")
            // = left most
            this.translate.x = containerRect.left - parseInt(cropRect.style.left);
        }
        else if(newRight > containerRect.right) {
            // console.log("wrong");
            // = right most
            this.translate.x = containerRect.right - parseInt(cropRect.style.width);
        }
        else {
            this.translate.x = newTraslateX
        }

        if(newTop < containerRect.top) {
            // console.log("wrong")
            // top most
            this.translate.y = containerRect.top - parseInt(cropRect.style.top);
        }
        else if(newBottom > containerRect.bottom) {
            // console.log("wrong")
            // = bottom most
            this.translate.y = containerRect.bottom - parseInt(cropRect.style.height);
        }
        else {
            this.translate.y = newTraslateY;
        }

        cropRect.style.transform = `translateX(${this.translate.x}px) translateY(${this.translate.y}px)`;
        
    }

    enableCrop = ()=> {
        let canvasContainer = this.props.canvasElements.canvasContainer.current;
        let canvasRect = canvasContainer.getBoundingClientRect();
        let cropRect = this.cropRectRef.current;

        cropRect.style.width = canvasRect.width/2+'px';
		cropRect.style.height = canvasRect.height/2+'px';
		cropRect.style.position = 'absolute';
        cropRect.style.top = '0px';
        cropRect.style.left = '0px';
        cropRect.style.border = '1px solid white';

        this.translate = {x: (canvasRect.left + canvasRect.width/4), y: (canvasRect.top + canvasRect.height/4)};
        cropRect.style.transform = `translateX(${this.translate.x}px) translateY(${this.translate.y}px)`;
        this.offset = {x: (canvasRect.left + canvasRect.width/4), y: (canvasRect.top + canvasRect.height/4)};
        
        
        cropRect.onmousedown = this.cropRectOnClickHandler;

        this.dimentionOffset = {height: canvasRect.height/2, width: canvasRect.width/2};

        this.setState({cropEnabled: true, needToEnableCrop: false});

        console.log("crop enabled");
    }

    disableCrop = ()=> {
        window.onmousemove = null;
        window.onmouseup = null;    
        this.cropRectRef.current.onmousedown = null;
        console.log("disable Crop");
    }

    confirmCrop = ()=> {
        
        if(!this.props.isImageLoaded)
            return;

        let {left, top, width, height} = this.cropRectRef.current.getBoundingClientRect();
        let {left: canvasLeft, top: canvasTop} = this.props.canvasElements.canvasContainer.current.getBoundingClientRect();
      
        // dimentions of original crop rect
        left = left - canvasLeft;
        top = top - canvasTop;
        width = width;
        height = height;

        let image = this.props.canvasFunctions.getEditedImage();
        let fullResImage = this.props.canvasFunctions.getFullResEditedImage();


        // ------------------------------------SCALING------------------------------------------
        let scaleX = fullResImage.width/image.width;
        let scaleY = fullResImage.height/image.height;

        let scaledWidth = width * scaleX;
        let scaledHeight = height * scaleY;

        let scaledTop = top * scaleY;
        let scaledLeft = left * scaleX;

        // ------------------------------------SCALING------------------------------------------

        let cropImage = new ImageData(parseInt(scaledWidth), parseInt(scaledHeight));

        let index = 0;

        let imageWidth = parseInt(fullResImage.width);

        for(let i=parseInt(scaledTop); i<parseInt(scaledTop) + parseInt(scaledHeight); i++) {
        
            for(let j=parseInt(scaledLeft); j<parseInt(scaledLeft) + parseInt(scaledWidth); j++) {
        
                let index2 = (i*imageWidth + j)*4;
                cropImage.data[index] = fullResImage.data[index2];
                cropImage.data[index+1] = fullResImage.data[index2+1];
                cropImage.data[index+2] = fullResImage.data[index2+2];
                cropImage.data[index+3] = fullResImage.data[index2+3];
                
                index+=4;
            }

        }
        this.props.canvasFunctions.setFullResEditedImage(cropImage);
        history.push("/");
    }

    static getDerivedStateFromProps(props, state) {
        if(props.isImageLoaded === true && !state.cropEnabled && !state.needToEnableCrop) {
            return {needToEnableCrop: true};
        }
        return null;
    }

    componentDidMount() {
        if(this.state.cropEnabled === false && this.state.needToEnableCrop === true) {
            this.enableCrop();
        }
    }

    componentDidUpdate() {
        if(this.state.cropEnabled === false && this.state.needToEnableCrop === true) {
            this.enableCrop();
        }
    }

    componentWillUnmount() {
        this.disableCrop();
    }   

    render() {

        return <div>
            <div>{this.state.cropEnabled ? "crop component": "First select Image to enable Crop"}</div>
            <div className="text-center"><button onClick={this.confirmCrop} className="btn btn-primary">confirm</button></div>
            <div ref={this.cropRectRef} style={{position: "absolute"}}></div>
        </div>;
    }
}

export default Crop;