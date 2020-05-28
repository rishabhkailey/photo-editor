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
			saturation_input.onchange = this.onChange;
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
		let imageData = new ImageData(new Uint8ClampedArray(this.originalImageData.data), this.originalImageData.width);
		let data = imageData.data;
		let brightnessValue = parseInt(this.changes.brightness) || 0;
		let contrastValue = parseInt(this.changes.contrast) || 0;
		let saturationValue = parseInt(this.changes.saturation) || 0;

		for(let i=0; i<data.length; i+=4) {
			// brightness
			data[i] += brightnessValue;
			data[i+1] += brightnessValue;
			data[i+2] += brightnessValue;

			// contrast
			let avg = (data[i]+data[i+1]+data[i+2])/3;
			if(avg > 122.5) {
				// bright pixel
				// * data[i]/avg canbe anything like data[i]/100 or data[i]/255 just need to be dependent on current rgb value (to make change in rgb value dependent on current rgb value) (else for two bright pixels it will increase brightness equally so it will not increase contrast in between two bright pixels)
				data[i] += (contrastValue*(data[i]/avg));
				data[i+1] += (contrastValue*(data[i+1]/avg));
				data[i+2] += (contrastValue*(data[i+2]/avg));
			}
			else {
				// dark pixel
				data[i] -= (contrastValue*(data[i]/avg));
				data[i+1] -= (contrastValue*(data[i+1]/avg));
				data[i+2] -= (contrastValue*(data[i+2]/avg));
			}

			// saturation (increase the value of color which is more lol)
			// at -100 saturation image should be b/w i.e. rgb = avg,
		 	// if saturation is decreasing the gap between r, g, b values and avg should be decreasing, if saturation is -50 gap now should be half as it was before
		 	// if saturation is increasing the gap betweem r, g, b values and avg should be increasing
		 	// using saturation as percentage of diff increased or decreased as compared to original difference 
			avg = (data[i]+data[i+1]+data[i+2])/3;
			data[i] += (((data[i]-avg)/100)*saturationValue)
			data[i+1] += (((data[i+1]-avg)/100)*saturationValue)
			data[i+2] += (((data[i+2]-avg)/100)*saturationValue)

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

