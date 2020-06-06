"use strict"

class Crop {
	
	constructor({setImageDataSrc}) {
		this.setImageDataSrc = setImageDataSrc;
		this.ctx = null;
		this.cropRect = null;
		this.canvasContainerBoundingRect = null;
		this.cropRectBoundingRect = null;

		// used to avoid checking for change type (changeType is same for one session(onMouseDown to onMouseUp))
		this.cropRectChangeType = null;

		this.cropRectTranslate = {x: 0, y: 0, scaleX: 1, scaleY: 1};
		this.prevMousePosition = null;
		this.width = null;
		this.height = null;
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
		this.cropRectTranslate = {x: 0, y: 0, scaleX: 1, scaleY: 1}; 
		this.cropRect.style.width = canvas.width/2+'px';
		this.cropRect.style.height = canvas.height/2+'px';
		this.cropRect.style.position = 'absolute';
		this.cropRect.style.left = canvas.width/4 + 'px';
		this.cropRect.style.top = canvas.height/4 + 'px';
		this.cropRect.style.border = '1px solid white';
		canvas_container.appendChild(this.cropRect);

		this.canvasContainerBoundingRect = canvas_container.getBoundingClientRect();
		this.cropRectBoundingRect = this.cropRect.getBoundingClientRect();
		this.showConfirmButton('crop');

	}
	hideCropRect = () => {
		canvas_container.removeChild(this.cropRect);
		this.cropRect = null;
		this.cropRectTranslate = null;
		this.height = null;
		this.width = null;
		this.prevMousePosition = null;
	}
	changeCropRectPosition = (e) => {
		let mouse = {x: e.clientX, y: e.clientY};
		
		// left, right, top, b of changing element are not correct they're value is not constant use (canvasLeft + (canvas.width/2), (canvasLeft + (canvas.height/2) for center
		let {width, height} = this.cropRectBoundingRect;
		let {left: canvasLeft, top: canvasTop, right: canvasRight, bottom: canvasBottom, height: canvasHeight, width: canvasWidth} = this.canvasContainerBoundingRect;
		
		
		// calculating translate values needed (we want cropRect's center on mouse cursor, so calculating translate value needed from center)
		let x = mouse.x - (canvasLeft + (canvas.width/2));
		let y = mouse.y - (canvasTop + (canvas.height/2));

		// new left and top of crop rect
		let left = (canvasLeft + (canvas.width/2)) + x - width/2;
		let top = (canvasTop + (canvas.height/2)) + y - height/2;
		let right = canvasRight + (canvasWidth - (left - canvasLeft) - width);
		let bottom = canvasBottom + (canvasHeight - (top - canvasTop) - height);

		console.log(width, left);

		if(left < canvasLeft || right < canvasRight) {
			// reset the value to prev
			x = this.cropRectTranslate.x;
		}

		if(top < canvasTop || bottom < canvasBottom) {
			y = this.cropRectTranslate.y;
		}

		this.cropRectTranslate.x = x;
		this.cropRectTranslate.y = y;
		
		this.cropRect.style.transform = `translate(${x}px, ${y}px) scaleX(${this.cropRectTranslate.scaleX}) scaleY(${this.cropRectTranslate.scaleY})`;
	}
	changeCropRectDimensions(e) {
		if(!this.prevMousePosition) {
			this.prevMousePosition = {x: e.clientX, y: e.clientY};
		}
		let mouse = {x: e.clientX, y: e.clientY};
		let {width, height} = this.cropRectBoundingRect;
		let {left: canvasLeft, top: canvasTop, right: canvasRight, bottom: canvasBottom, height: canvasHeight, width: canvasWidth} = this.canvasContainerBoundingRect;
		
		if(!this.width) {
			this.width = width;
		}
		if(!this.height) {
			this.height = height;
		}

		let {x, y} = this.cropRectTranslate;
		
		let cropRectLeft = (canvasLeft + (canvas.width/2)) + x - this.width/2;
		let cropRectTop = (canvasTop + (canvas.height/2)) + y - this.height/2;
		// right and bottom are just name but their distance is from top and left edge
		let cropRectRight = cropRectLeft + this.width;
		let cropRectBottom = cropRectTop + this.height;

		if(this.cropRectChangeType.indexOf('l') !== -1) {
			this.width -= (mouse.x - cropRectLeft);
			this.cropRectTranslate.x += (mouse.x - cropRectLeft);
			this.cropRect.style.width = `${this.width}px`;
			this.cropRect.style.transform = `translate(${this.cropRectTranslate.x}px, ${this.cropRectTranslate.y}px) scaleX(${this.cropRectTranslate.scaleX})`;
		}
		else if(this.cropRectChangeType.indexOf('r') !== -1) {
			this.width += (mouse.x - cropRectRight);
			this.cropRect.style.width = `${this.width}px`;
		}

		if(this.cropRectChangeType.indexOf('t') !== -1) {	
			this.height -= (mouse.y - cropRectTop);
			this.cropRectTranslate.y += (mouse.y - cropRectTop);
			this.cropRect.style.height = `${this.height}px`;
			this.cropRect.style.transform = `translate(${this.cropRectTranslate.x}px, ${this.cropRectTranslate.y}px) scaleX(${this.cropRectTranslate.scaleX})`;
		}
		else if(this.cropRectChangeType.indexOf('b') !== -1) {
			this.height += (mouse.y - cropRectBottom);
			this.cropRect.style.height = `${this.height}px`;
		}
		this.prevMousePosition = {x: e.clientX, y: e.clientY};
	}
	changeCropRect = (e) => {
		if(!this.cropRectChangeType) {
			// calculate change type, runs only once (for mouseDown event), value of cropRectChangeType remains same as long as mouse is down, on mouse up its value is changed to null so for next mouse down it will recalculate it 
			let {clientX: mouseX, clientY: mouseY} = e;
			let {left: cropRectLeft, top: cropRectTop, bottom: cropRectBottom, right: cropRectRight} = this.cropRect.getBoundingClientRect();
			
			this.cropRectChangeType = '';
			if(Math.abs(mouseX - cropRectLeft) < 10) {
				this.cropRectChangeType += 'l';
			}
			else if(Math.abs(mouseX - cropRectRight) < 10) {
				this.cropRectChangeType += 'r';
			}

			if(Math.abs(mouseY - cropRectTop) < 10) {
				this.cropRectChangeType += 't';
			}
			else if(Math.abs(mouseY - cropRectBottom) < 10) {
				this.cropRectChangeType += 'b';
			}

			if(this.cropRectChangeType === '') {
				this.cropRectChangeType = 'c';
			}
		}
		
		if(this.cropRectChangeType === 'c')
			this.changeCropRectPosition(e);
		else 
			this.changeCropRectDimensions(e);
	}

	stopTrackingMouse = () => {
		console.log('event removed');
		this.cropRectChangeType = null;
		canvas_container.removeEventListener('mousemove', this.changeCropRect);
	}
	startTrackingMouse = ()=> {
	    canvas_container.addEventListener('mousemove', this.changeCropRect);
	}
	onCropClick = () => {
		console.log(this.showCropRect);
		this.showCropRect();
		this.cropRect.addEventListener('mousedown', this.startTrackingMouse);
		window.addEventListener('mouseup', this.stopTrackingMouse);
	}

	confirmCrop = () => {
		let ctx = canvas.getContext('2d');
		let {left, top, width, height} = this.cropRect.getBoundingClientRect();
		let canvasRect = canvas.getBoundingClientRect();
		let imageData = ctx.getImageData(left-canvasRect.left, top-canvasRect.top, width, height);

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		this.setImageDataSrc(getImageFromImageData(imageData, width, height));
		this.hideCropRect();
		this.resetConfirmButton();
	}

}

class ImageAdjustments {
	constructor({getImageData, setImageData}) {
		this.getImageData = getImageData;
		this.setImageData = setImageData;
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

		let imageData = new ImageData(new Uint8ClampedArray(this.getImageData().data), this.getImageData().width);
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
	
	constructor({getImageData, setImageData, getImage}) {
		this.getImageData = getImageData;
		this.setImageData = setImageData;
		this.getImage = getImage;
		this.ctx = null;
	}

	initializeCtx(ctx) {
		this.ctx = ctx;
	}

	rotateImage(changes) {
		this.ctx = canvas.getContext('2d');
		let rotateValue = parseInt(changes.rotate) || 0;
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.ctx.save();
		this.ctx.translate(canvas.width/2, canvas.height/2);
		this.ctx.rotate((Math.PI / 180) * rotateValue);
		this.ctx.drawImage(this.getImage(), -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
		this.ctx.restore();


		// changing the imageData because putImageData used in applyChangesToCanvas(for adjustment) doesnot depends on rotaion of ctx (its an array for whole canvas, we need rotated arry for it to show rotated image), now we are changing the orginalImageData (array) to rotated image array 
		let imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
		// above we just rotate the canvas, now get the image data of rotated canvas and save the data
		this.setImageData(new ImageData(new Uint8ClampedArray(imageData.data), imageData.width));
	}
}

class Main {
	imageFile = null;
	imageData = null;
	imageLoaded = false;
	prevChangeName = null;

	constructor() {
		this.changes = {};
		this.fileReader = new FileReader();
		this.image = new Image();
		this.editedImage = new Image();
		this.ctx = null;
		this.cropObject = new Crop({setImageDataSrc: this.setImage});
		this.imageAdjustmentObject = new ImageAdjustments({setImageData: this.setImageData, getImageData: this.getImageData});
		this.rotateObject = new Rotate({setImageData: this.setImageData, getImageData: this.getImageData, getImage: this.getImage});
		// eventListeners
        this.fileReader.onload = this.handleFileReader
		// first time
		this.image.onload = () => {
			this.editedImage.src = this.image.src;
		};
		// first time and after editing
		this.editedImage.onload = this.reRenderCanvas;

		window.addEventListener('resize', this.reRenderCanvas);
		window.addEventListener('load', (e) => {
			brightness_input.onchange = this.onChange;
			contrast_input.onchange = this.onChange;
			saturation_input.onchange = this.onChange;
			bottom_option_input.onchange = this.onChange;
			crop_button.onclick = this.cropObject.onCropClick;
			rotate_button.onclick = () => {this.bottomOption('rotate')}
			image_input.addEventListener('change', (e) => {
				// console.log(e, e.target.result);
				this.imageFile = e.target.files[0];
				this.fileReader.readAsDataURL(e.target.files[0]);
			})
		})
	}

	setImage = (src)=> {
		this.editedImage.src = src; // data:base64 image/png .......
	}
	
	getImage = ()=> {
		return this.editedImage;
	}

	getImageData = () => {
		return this.imageData;
	}

	setImageData = (data) => {
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
					this.editedImage.src = canvas.toDataURL('image/png');
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
		imageHeight = imageHeight || this.editedImage.height;
		imageWidth = imageWidth || this.editedImage.width;

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
		this.changeCanvasDimensions();
		if(!this.imageLoaded) 
			return;
		
		this.ctx = canvas.getContext('2d');
		this.ctx.drawImage(this.editedImage, 0, 0, canvas.width, canvas.height);
		let imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
		this.imageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width);
		this.rotateObject.initializeCtx(this.ctx);
	}

	handleFileReader = (e) => {
		this.image.src = e.target.result;
	}

}


let obj = new Main();

const getImageFromImageData = (imageData, width, height) => {
	let canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');
	canvas.width = width;
	canvas.height = height;
	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL('image/png');
}
