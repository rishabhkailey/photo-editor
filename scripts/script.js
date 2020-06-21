"use strict"

class SelectRect {
	constructor({setImage, getImage, setDisplayImageData, getDisplayImageData}) {
		this.setImage = setImage;
		this.getImage = getImage;
		this.setDisplayImageData = setDisplayImageData;
		this.getDisplayImageData = getDisplayImageData;

		this.position = null;
		this.canvasOffset = null;

		this.topLeft = null;
		this.bottomRight = null;

		this.currSelectionRect = null;
	}

	drawSelectionArea = (e)=> {
		let {x: x1, y: y1} = this.position;
		let {clientX: x2, clientY: y2} = e;

		let topLeft = {};
		let bottomRight = {};

		if(x1 < x2) {

			bottomRight.x = x2;
			topLeft.x = x1;

			if(y1 < y2) {
				topLeft.y = y1;
				bottomRight.y = y2;
			}
			else {
				topLeft.y = y2;
				bottomRight.y = y1;
			}
		}
		else {
			topLeft.x = x2;
			bottomRight.x = x1;

			if(y1 < y2) {
				topLeft.y = y1;
				bottomRight.y = y2;
			}
			else {
				topLeft.y = y2;
				bottomRight.y = y1;
			}
		}

		this.topLeft = topLeft;
		this.bottomRight = bottomRight;

		this.markSelection(topLeft, bottomRight);

	}

	markSelection = ({x: x1, y: y1}, {x: x2, y: y2})=> {
		
		x1 = parseInt(x1 - this.canvasOffset.x);
		x2 = parseInt(x2 - this.canvasOffset.x);
		y1 = parseInt(y1 - this.canvasOffset.y);
		y2 = parseInt(y2 - this.canvasOffset.y);

		if(!this.currSelectionRect) {
			this.currSelectionRect = this.createSelectionRect();
		}

		this.currSelectionRect.style.transform = `translate(${x1}px, ${y1}px)`;
		this.currSelectionRect.style.width = `${x2 - x1}px`;
		this.currSelectionRect.style.height = `${y2 - y1}px`;

	}

	createSelectionRect = ()=> {
		let div = document.createElement('div');
		div.style.position = 'absolute';
		div.style.zIndex = '12';
		div.style.border = '1px solid white';
		div.style.top = '0px';
		div.style.left = '0px';	

		canvas_container.appendChild(div);
		
		return div;
	}

	finaliseSelction = ()=> {
		let x1 = parseInt(this.topLeft.x - this.canvasOffset.x);
		let y1 = parseInt(this.topLeft.y - this.canvasOffset.y);
		let x2 = parseInt(this.bottomRight.x - this.canvasOffset.x);
		let y2 = parseInt(this.bottomRight.y - this.canvasOffset.y);

		console.log(x1, y1, x2, y2);
		
		let image = new ImageData(new Uint8ClampedArray(this.getDisplayImageData().data), this.getDisplayImageData().width);
		let data = image.data;

		console.log(data);
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

		for(let i=0; i<image.height; i++) {
			for(let j=0; j<image.width; j++) {
				if(!(i>y1 && j>x1 && i<y2 && j<x2)) {
					// data[(i*image.width + j)*4 + 0] = 255;
					// data[(i*image.width + j)*4 + 1] = 255;
					// data[(i*image.width + j)*4 + 2] = 255;
					data[(i*image.width + j)*4 + 3] = 127;
				}
			}
		}

		console.log(data);
		canvas.getContext('2d').putImageData(image, 0, 0);

		this.setDisplayImageData(image);

	}

	init = ()=> {
		this.canvasOffset = {x: canvas.getBoundingClientRect().left, y: canvas.getBoundingClientRect().top};
		
		canvas.onmousedown = (e)=> {
			this.position = {x: e.clientX, y: e.clientY};
			window.onmousemove = this.drawSelectionArea;
		}
		window.onmouseup = (e)=> {
			window.onmousemove = null;
			this.finaliseSelction();
		}
	}

}

class Crop {
	constructor({setImage}) {
		this.setImage = setImage;
		this.ctx = null;
		this.cropRect = null;	
		this.position = null;
		this.nearEdge = '';
		this.translate = {x: 0, y: 0};
		this.offset = {x: 0, y: 0};
		this.dimention = {width: 100, height: 100};
		this.dimentionTranslate = {width: 0, height: 0};
	}

	
	resetConfirmButton() {
		bottom_confirm_button.style.display = 'none';
		bottom_confirm_button.name = null;
	}

	showConfirmButton(name) {
		bottom_confirm_button.style.display = 'block';
		bottom_confirm_button.name = name;
		bottom_confirm_button.onclick = this.confirmCrop;
	}

	showCropRect= ()=> {
		if(this.cropRect) {
			return;
		}
		this.cropRect = document.createElement('div');
		this.cropRect.style.width = canvas.width/2+'px';
		this.cropRect.style.height = canvas.height/2+'px';
		this.cropRect.style.position = 'absolute';
		this.cropRect.style.left = canvas.width/4 + 'px';
		this.cropRect.style.top = canvas.height/4 + 'px';
		this.cropRect.style.border = '1px solid white';
		canvas_container.appendChild(this.cropRect);

		this.dimention = {width: canvas.width/2, height: canvas.height/2};

		this.showConfirmButton('crop');

	}
	hideCropRect = () => {
		canvas_container.removeChild(this.cropRect);
		this.cropRect = null;
	}

	isNearEdge = ({clientX: mouseX, clientY: mouseY})=> {

		let {left: cropRectLeft, top: cropRectTop, bottom: cropRectBottom, right: cropRectRight} = this.cropRect.getBoundingClientRect();

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

	changeDimention = (e)=> {

		if(this.nearEdge.indexOf('l') !== -1) {
			this.translate.x = e.clientX - this.position.x + this.offset.x;
			this.dimentionTranslate.width = e.clientX - this.position.x;
		}
		else if(this.nearEdge.indexOf('r') !== -1) {
			this.dimentionTranslate.width = this.position.x - e.clientX;
		}
		
		if(this.nearEdge.indexOf('t') !== -1) {
			this.translate.y = e.clientY - this.position.y + this.offset.y;
			this.dimentionTranslate.height = e.clientY - this.position.y;
		}
		else if(this.nearEdge.indexOf('b') !== -1) {
			console.log('b', this.position.y - e.clienty);
			this.dimentionTranslate.height = this.position.y - e.clientY;
		}
		
		this.cropRect.style.width = `${this.dimention.width - this.dimentionTranslate.width}px`;
		this.cropRect.style.height = `${this.dimention.height - this.dimentionTranslate.height}px`;
		this.cropRect.style.transform = `translateX(${this.translate.x}px) translateY(${this.translate.y}px)`;
	}

	changePosition = (e)=> {
		
		let container = canvas_container.getBoundingClientRect();
		let crop = this.cropRect.getBoundingClientRect();

		// new tranlate - old (to get change for this function call)
		let xChange = (this.offset.x + e.clientX - this.position.x) - this.translate.x;
		let yChange = (this.offset.y + e.clientY - this.position.y) - this.translate.y;

		// xChange < 0 means moving left && it will go beyond container then no
		if(!((crop.left + xChange < container.left && xChange < 0) || (xChange > 0 && crop.right + xChange > container.right)))
			this.translate.x = this.offset.x + e.clientX - this.position.x;
		
		if(!((crop.top + yChange < container.top && yChange < 0) || (yChange > 0 && crop.bottom + yChange > container.bottom))) 
			this.translate.y = this.offset.y + e.clientY - this.position.y;

		this.cropRect.style.transform = `translateX(${this.translate.x}px) translateY(${this.translate.y}px)`;
	}
	
	onCropClick = () => {
		
		this.showCropRect();

		this.cropRect.onmousedown = (e)=>{
			this.offset = {x: this.translate.x, y: this.translate.y};
			this.dimention.width -= this.dimentionTranslate.width;
			this.dimention.height -= this.dimentionTranslate.height;
			this.dimentionTranslate = {width: 0, height: 0};

			this.position = {x: e.clientX, y: e.clientY};

			if(this.isNearEdge(e)) {
				window.onmousemove = this.changeDimention;
			}
			else {
				window.onmousemove = this.changePosition;
			}

		}
		window.onmouseup = (e)=>{
			window.onmousemove = null;
		}
		// console.log(this.showCropRect);
		// this.showCropRect();
		// this.cropRect.addEventListener('mousedown', this.startTrackingMouse);
		// window.addEventListener('mouseup', this.stopTrackingMouse);
	}

	confirmCrop = () => {
		let ctx = canvas.getContext('2d');
		let {left, top, width, height} = this.cropRect.getBoundingClientRect();
		let canvasRect = canvas.getBoundingClientRect();
		let imageData = ctx.getImageData(left-canvasRect.left, top-canvasRect.top, width, height);

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		this.setImage(getImageSrcFromImageData(imageData));
		this.hideCropRect();
		this.resetConfirmButton();
	}

}

class ImageAdjustments {
	constructor({getDisplayImageData, setDisplayImageData}) {
		this.getDisplayImageData = getDisplayImageData;
		this.setDisplayImageData = setDisplayImageData;
	}
	changeBrightNess(data, i, brightnessValue) {		
		// brightness
		data[i] += brightnessValue;
		data[i+1] += brightnessValue;
		data[i+2] += brightnessValue;
	}
	changeSatruration(data, i, saturationValue) {
		// saturation (increase the value of color which is more lol)
		// at -100 saturation image should be b/w i.e. rgb = avg,
		// if saturation is decreasing the gap between r, g, b values and avg should be decreasing, if saturation is -50 gap now should be half as it was before
		// if saturation is increasing the gap betweem r, g, b values and avg should be increasing
		// using saturation as percentage of diff increased or decreased as compared to original difference 
		let avg = (data[i]+data[i+1]+data[i+2])/3;
		data[i] += (((data[i]-avg)/100)*saturationValue);
		data[i+1] += (((data[i+1]-avg)/100)*saturationValue);
		data[i+2] += (((data[i+2]-avg)/100)*saturationValue);

	}
	changeContrast(data, i, contrastValue) {
		let avg = (data[i]+data[i+1]+data[i+2])/3;
		// bright pixel
		// equaly increase else color will change
		// bright to more bright, further for two bright pixels increase in brightness of less bright pixel should be less than that of more bright pixel, so it can create contrast even in between two bright pixels
		// to do so the value increased or decreased should depends on brightness of pixel
		let value = contrastValue*((avg-122.5)/100)
		data[i] += value;
		data[i+1] += value;
		data[i+2] += value;
	}
	applyChangesToCanvas = (changes) => {

		let imageData = new ImageData(new Uint8ClampedArray(this.getDisplayImageData().data), this.getDisplayImageData().width);
		let data = imageData.data;
		let brightnessValue = parseInt(changes.brightness) || 0;
		let contrastValue = parseInt(changes.contrast) || 0;
		let saturationValue = parseInt(changes.saturation) || 0;
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

		for(let i=0; i<data.length; i+=4) {
			this.changeBrightNess(data, i, brightnessValue);
			this.changeContrast(data, i, contrastValue);
			this.changeSatruration(data, i, saturationValue);
		}

		canvas.getContext('2d').putImageData(imageData, 0, 0);
	}
}

class Rotate {
	
	constructor({getDisplayImageData, setDisplayImageData, getImage, setImage, ctx}) {
		console.log(ctx);
		this.getDisplayImageData = getDisplayImageData;
		this.setDisplayImageData = setDisplayImageData;
		this.getImage = getImage;
		this.setImage = setImage;
		this.ctx = null;
	}

	initializeCtx(ctx) {
		this.ctx = ctx;
	}

	rotateImage(changes) {
		// this.ctx = canvas.getContext('2d');
		let rotateValue = parseInt(changes.rotate) || 0;
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		this.ctx.save(); //save the initial transformation (translation)
		this.ctx.translate(canvas.width/2, canvas.height/2); // (move to the center so image rotates from center not from top-left corner)
		
		// rotate the canvas
		this.ctx.rotate((Math.PI / 180) * rotateValue);
		// rotating the context will clear the image so we need to draw image (drawImage is more efficent then putImageData(use put imageData only when working with pixels))

		// draw image on canvas (image will be drawn on canvas as it is not rotated (its like tranform of the html element but that will not effect the drawing)) (think of it as frame(canvas) and photo(context), it is rotating the context but not canvas)
		this.ctx.drawImage(this.getImage(), -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
		
		// changing the imageData because putImageData used in applyChangesToCanvas(for adjustment) doesnot depends on rotaion of ctx (its an array for whole canvas, we need rotated arry for it to show rotated image), now we are changing the orginalImageData (array) to rotated image array 
		let imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
		// above we just rotate the canvas, now get the image data of rotated canvas and save the data
		this.setDisplayImageData(new ImageData(new Uint8ClampedArray(imageData.data), imageData.width));

		// restore's the translate we done to move to center

		// console.log('called from rotate');
		// this.setImage(this.getImage(), -canvas.width/2, -canvas.height/2);


		this.ctx.restore();
	}
}

class Main {
	imageFile = null;
	imageData = null;
	imageLoaded = false;
	prevChangeName = null;


	constructor() {
		window.addEventListener('load', (e) => {

			this.ctx = canvas.getContext('2d');	
			this.changes = {};
			this.fileReader = new FileReader();
			// this.image = new Image();
			this.image = new Image();
			this.imageOffset = {left: 0, top: 0};
			this.selectRectObject = new SelectRect({setImage: this.setImage, getImage: this.getImage, getDisplayImageData: this.getDisplayImageData, setDisplayImageData: this.setDisplayImageData});
			this.cropObject = new Crop({setImage: this.setImage});
			this.imageAdjustmentObject = new ImageAdjustments({setDisplayImageData: this.setDisplayImageData, getDisplayImageData: this.getDisplayImageData});
			this.rotateObject = new Rotate({setDisplayImageData: this.setDisplayImageData, getDisplayImageData: this.getDisplayImageData, getImage: this.getImage, setImage: this.setImage, ctx: this.ctx});
			this.rotateObject.initializeCtx(this.ctx);
		
			// eventListeners
			this.fileReader.onload = this.handleFileReader
			// first time
			// this.image.onload = () => {
				// this.originalImage.src = this.image.src;
			// };
			// first time and after editing
			this.image.onload = this.reRenderCanvas;


			brightness_input.onchange = this.onChange;
			contrast_input.onchange = this.onChange;
			saturation_input.onchange = this.onChange;
			bottom_option_input.onchange = this.onChange;
			crop_button.onclick = this.cropObject.onCropClick;
			select_rect.onclick = this.selectRectObject.init; 
			rotate_button.onclick = () => {this.bottomOption('rotate')}
			image_input.addEventListener('change', (e) => {
				// console.log(e, e.target.result);
				this.imageFile = e.target.files[0];
				this.fileReader.readAsDataURL(e.target.files[0]);
			})
		})
		window.addEventListener('resize', this.reRenderCanvas);
	}

	// change this on confirm button (change the image)
	setImage = (input, left, top)=> {
		// this.imageOffset.left = left|0;
		// this.imageOffset.top = top|0;
		console.log(typeof(input), input);
		if(input instanceof Image) {
			console.log('image');
			this.image.src = input.src;
		}
		else if(typeof(input) === "string") { // instance of string doesnot work until the object is created using new String() constructor
			console.log('src');
			this.image.src = input; // data:base64 image/png .......
		}
		else if(input instanceof ImageData) {
			console.log('imageData');
			this.input.src = getImageSrcFromImageData(input)
		}
			// this.imageDimentions = {left: left|0, top: top|0, width: width|this.image.width ,height: height|this.image.height}
	}
	
	getImage = ()=> {
		return this.image;
	}

	// return image data (not displaying image data) (image data without confirmed chnages (with only confirmed changes))
	getImageData = ()=> {
		return this.ctx.getImageData(0, 0, canvas.width, canvas.height);
	}

	getDisplayImageData = () => {
		return this.imageData;
	}

	// use this to show updating data (temp change display image)
	setDisplayImageData = (data) => {
		// this new data's reference is different(create by " new ImageData(data, width) ") ,referene is changed
		this.imageData = data;
	}

	bottomOption(button) {
		bottom_option_input.style.display = 'block';
		bottom_option_input.name = "rotate";
	}

	showConfirmButton(name) {
		bottom_confirm_button.style.display = 'block';
		bottom_confirm_button.name = name;
		bottom_confirm_button.onclick = this.confirmCrop;
	}

	resetConfirmButton() {
		bottom_confirm_button.style.display = 'none';
		bottom_confirm_button.name = null;
	}

	onChange = (e) => {
		if(e.target.name === '') {
			return;
		}
		this.changes[e.target.name] = e.target.value;
		if(this.imageLoaded)
			if(e.target.name === 'rotate') {
				// only once for rotate
				if(this.prevChangeName !== 'rotate') {
					this.image.src = canvas.toDataURL('image/png');
				}
				this.prevChangeName = 'rotate';
				this.rotateObject.rotateImage(this.changes);
			}
			else {
				this.prevChangeName = 'adjustment';
				this.imageAdjustmentObject.applyChangesToCanvas(this.changes);
			}
	}

	changeCanvasDimensions = (imageHeight, imageWidth) => {
		let {height: availableHeight, width: availableWidth} = photo_container.getBoundingClientRect();
		imageHeight = imageHeight || this.image.height;
		imageWidth = imageWidth || this.image.width;

		let ratio = availableWidth/imageWidth;
		if((imageHeight*ratio) > availableHeight) {
			ratio = availableHeight/imageHeight;
		}

		canvas.width = ratio*imageWidth;
		canvas.height = ratio*imageHeight;
		canvas_container.style.width = ratio*imageWidth+'px';
		canvas_container.style.height = ratio*imageHeight+'px';

	}

	reRenderCanvas = (e) => {
		if(e.type === 'load'){
			this.imageLoaded = true;
		}
		if(!this.imageLoaded)
			return;
		
		console.log('rerender');
		
		this.changeCanvasDimensions();
		
		// this.ctx = canvas.getContext('2d');
		
		// let left = this.imageDimentions.left|0;
		// let top = this.imageDimentions.top|0;
		// let width = this.imageDimentions.width|canvas.width;
		// let height = this.imageDimentions.height|canvas.height;
		this.ctx.drawImage(this.image, this.imageOffset.left, this.imageOffset.top, canvas.width, canvas.height);
		let imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
		this.imageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width);
		// this.rotateObject.initializeCtx(this.ctx);
	}

	handleFileReader = (e) => {
		this.image.src = e.target.result;
		// this.imageDimentions = {left: 0, top: 0, width: this.image.width, heihgt: this.image.height}
	}

}


let obj = new Main();

const getImageSrcFromImageData = (imageData) => {
	let canvas = document.createElement('canvas');
	canvas.width = imageData.width;
	canvas.height = imageData.height;
	let ctx = canvas.getContext('2d');
	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL('image/png');
}
const getImageSrcFromImage = (image) => {
	let canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	let ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0, image.width, image.height);
	return canvas.toDataURL('image/png');
}
