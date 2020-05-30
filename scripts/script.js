class Main {
	fileReader = null;
	imageFile = null;
	image = null;
	editedImage = null; // used by rotation (so it don't have to iterate over every pixel)
	ctx = null;
	aspectRatio = null;
	screenAspectRatio = null;
	originalImageData = null;
	changes = {};
	imageLoaded = false;
	prevChangeName = null;

	constructor() { 
		this.fileReader = new FileReader();
		this.image = new Image();
		this.editedImage = new Image();

		// eventListeners
        this.fileReader.onload = this.handleFileReader
		// first time
		this.image.onload = () => {
			this.editedImage.src = this.image.src;
		};
		// after editing
		this.editedImage.onload = this.reRenderCanvas;

		window.addEventListener('resize', this.reRenderCanvas);
		window.addEventListener('load', (e) => {
			brightness_input.onchange = this.onChange;
			contrast_input.onchange = this.onChange;
			saturation_input.onchange = this.onChange;
			bottom_option_input.onchange = this.onChange;
			crop_button.onclick = this.onCropClick;
			rotate_button.onclick = () => {this.bottomOption('rotate')}
			image_input.addEventListener('change', (e) => {
				// console.log(e, e.target.result);
				this.imageFile = e.target.files[0];
				this.fileReader.readAsDataURL(e.target.files[0]);
			})
		})
	}

	// crop
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

		this.canvasContainerBoundingRect = canvas_container.getBoundingClientRect();
		this.showConfirmButton('crop');

	}
	hideCropRect = () => {
		canvas_container.removeChild(this.cropRect);
		this.cropRect = null;
	}
	changeCropRectPosition = (e) => {
		// e.offsetX is effected by its children so use clientX 

		// mouse position relative to canvas 
		let mouse = {x: e.clientX - this.canvasContainerBoundingRect.left, y: e.clientY - this.canvasContainerBoundingRect.top};
		// distance from center(original position of cropRect)
		let x =  mouse.x - canvas.width/2;
		let y = mouse.y - canvas.height/2;

		if((x<(-1*canvas.width/4) || x>(canvas.width/4)) && (y<(-1*canvas.height/4) || y>(canvas.height/4)))
			return

		if(x<(-1*canvas.width/4)) {
			x = -1*canvas.width/4;
		}
		else if(x>(canvas.width)/4) {
			x = canvas.width/4;
		}

		if(y<(-1*canvas.height/4)) {
			y = -1*canvas.height/4;
		}
		else if(y>(canvas.height)/4) {
			y = canvas.width/4;
		}
		this.cropRect.style.transform = `translate(${x}px, ${y}px)`;
	}

	stopTrackingMouse = () => {
		canvas_container.removeEventListener('mousemove', this.changeCropRectPosition);
	}
	startTrackingMouse = ()=> {
	    canvas_container.addEventListener('mousemove', this.changeCropRectPosition);
	}
	onCropClick = () => {
		console.log(this.showCropRect);
		this.showCropRect();

		this.cropRect.addEventListener('mousedown', this.startTrackingMouse);
		this.cropRect.addEventListener('mouseup', this.stopTrackingMouse);
	}

	confirmCrop = () => {
		let {left, top, width, height} = this.cropRect.getBoundingClientRect();
		let imageData = this.ctx.getImageData(left, top, width, height);
		console.log(left, top, width, height, imageData);
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		// let scaleX = canvas.width/width;
		// let scaleY = canvas.height/height;
		// console.log(scaleX, scaleY);
		// this.ctx.scale(scaleX, scaleY);

		this.editedImage.src = getImageFromImageData(imageData, width, height);
		console.log(this.editedImage);

		// this.ctx.putImageData(imageData, 0, 0);
		this.hideCropRect();
		this.resetConfirmButton();
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
				this.rotateImage();
			}
			else {
				this.prevChangeName = 'adjustment';
				this.applyChangesToCanvas();
			}
	}

	rotateImage() {
		let rotateValue = parseInt(this.changes.rotate) || 0;
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.ctx.save();
		this.ctx.translate(canvas.width/2, canvas.height/2);
		this.ctx.rotate((Math.PI / 180) * rotateValue);
		this.ctx.drawImage(this.editedImage, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
		this.ctx.restore();


		// changing the imageData because putImageData used in applyChangesToCanvas(for adjustment) doesnot depends on rotaion of ctx (its an array for whole canvas, we need rotated arry for it to show rotated image), now we are changing the orginalImageData (array) to rotated image array 
		let imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
		this.originalImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width);
		// to apply rest of the updates like brightness, contrast, saturation
		// this.applyChangesToCanvas();
	}

	applyChangesToCanvas = () => {
		let imageData = new ImageData(new Uint8ClampedArray(this.originalImageData.data), this.originalImageData.width);
		let data = imageData.data;
		let brightnessValue = parseInt(this.changes.brightness) || 0;
		let contrastValue = parseInt(this.changes.contrast) || 0;
		let saturationValue = parseInt(this.changes.saturation) || 0;
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);

		for(let i=0; i<data.length; i+=4) {
			// brightness
			data[i] += brightnessValue;
			data[i+1] += brightnessValue;
			data[i+2] += brightnessValue;

			// contrast
			let avg = (data[i]+data[i+1]+data[i+2])/3;
			if(avg > 122.5) {
				// bright pixel
				// equaly increase else color will change
				// bright to more bright, further for two bright pixels increase in brightness of less bright pixel should be less than that of more bright pixel, so it can create contrast even in between two bright pixels
				// to do so the value increased or decreased should depends on brightness of pixel
				let value = contrastValue*((avg-122.5)/100)
				data[i] += value;
				data[i+1] += value;
				data[i+2] += value;
			}
			else {
				// dark pixel
				// dark to more dark, less the avg value =  more dark 
				let value = contrastValue*((122.5-avg)/100);
				data[i] -= value;
				data[i+1] -= value;
				data[i+2] -= value;
			}

			// saturation (increase the value of color which is more lol)
			// at -100 saturation image should be b/w i.e. rgb = avg,
		 	// if saturation is decreasing the gap between r, g, b values and avg should be decreasing, if saturation is -50 gap now should be half as it was before
		 	// if saturation is increasing the gap betweem r, g, b values and avg should be increasing
		 	// using saturation as percentage of diff increased or decreased as compared to original difference 
			avg = (data[i]+data[i+1]+data[i+2])/3;
			data[i] += (((data[i]-avg)/100)*saturationValue);
			data[i+1] += (((data[i+1]-avg)/100)*saturationValue);
			data[i+2] += (((data[i+2]-avg)/100)*saturationValue);

		}

		this.ctx.putImageData(imageData, 0, 0);
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
		this.originalImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width);
	}

	handleFileReader = (e) => {
		this.image.src = e.target.result;
	}

}


let obj = new Main();

const getImageFromImageData = (imageData, height, width) => {
	let canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');
	canvas.width = width;
	canvas.height = height;
	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL('image/png');
}
