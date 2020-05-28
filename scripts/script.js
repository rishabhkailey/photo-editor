class Main {
	fileReader = null;
	imageFile = null;
	image = null;
	ctx = null;
	aspectRatio = null;
	screenAspectRatio = null;
	originalImageData = null;
	changes = {}
	imageLoaded = false;

	constructor() { 
		this.fileReader = new FileReader();
		this.image = new Image();

		// eventListeners
        this.fileReader.onload = this.handleFileReader
		this.image.onload = this.reRenderCanvas;
		window.addEventListener('resize', this.reRenderCanvas);
		window.addEventListener('load', (e) => {
			brightness_input.onchange = this.onChange;
			contrast_input.onchange = this.onChange;
			image_input.addEventListener('change', (e) => {
				// console.log(e, e.target.result);
				this.imageFile = e.target.files[0];
				this.fileReader.readAsDataURL(e.target.files[0]);
			})
		})
	}

	onChange = (e) => {
		this.changes[e.target.name] = e.target.value;
		console.log(this.changes);
		if(this.imageLoaded)
			this.applyChangesToCanvas();
	}


	applyChangesToCanvas = (change) => {
		console.log('apply changes to canvas', this.changes);
		let imageData = new ImageData(new Uint8ClampedArray(this.originalImageData.data), this.originalImageData.width);
		let data = imageData.data;
		let brightnessValue = parseInt(this.changes.brightness) || 0;
		let contrastValue = parseInt(this.changes.contrast) || 0;

		for(let i=0; i<data.length; i+=4) {
			// brightness
			data[i] += brightnessValue;
			data[i+1] += brightnessValue;
			data[i+2] += brightnessValue;

			// contrast
			let avg = (data[i]+data[i+1]+data[i+2])/3;
			if(avg > 122.5) {
				// bright pixel
				data[i] += contrastValue;
				data[i+1] += contrastValue;
				data[i+2] += contrastValue;
			}
			else {
				// dark pixel
				data[i] -= contrastValue;
				data[i+1] -= contrastValue;
				data[i+2] -= contrastValue;	
			}
		}
		this.ctx.putImageData(imageData, 0, 0);
	}

	changeCanvasDimensions = () => {
		let {height: availableHeight, width: availableWidth} = photo_container.getBoundingClientRect();

		let ratio = availableWidth/this.image.width;
		if((this.image.height*ratio) > availableHeight) {
			ratio = availableHeight/this.image.height;
		}

		canvas.width = ratio*this.image.width;
		canvas.height = ratio*this.image.height;

		console.log(canvas.width/canvas.height);
	}

	reRenderCanvas = (e) => {
		if(e.type === 'load'){
			this.imageLoaded = true;
		}
		this.changeCanvasDimensions();
		if(!this.imageLoaded) 
			return;
		
		this.ctx = canvas.getContext('2d');
		this.ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
		let imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
		this.originalImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width);
	}

	handleFileReader = (e) => {
		this.image.src = e.target.result;
	}

}

let obj = new Main();

