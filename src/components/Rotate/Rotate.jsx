import React, {Component} from "react";

class Rotate extends Component {
    
    state = {
        value: 0
    }

    calculateAngleInRadian = (x1, y1, x2, y2) => {
        
        // Math.pi will only give ans between 0 - 90 and -90 to 0 (math.abs() = 0 to 90)

        // math.abs is important below conditions are for absolute angle (- or + is decided by the coordinates) (we don't need sign below)
        let angle = Math.abs(Math.atan((y2-y1)/(x2-x1)));
        
        if(x2 < x1) {
            if(y2 > y1) {
                // 4th quad 
                angle = (angle === 0) ? 0 : (2 * (Math.PI) - angle);
            }
            else {
                //  (1st quad 0 - 90)
                angle = angle;
            }
        }
        else {
            if(y2 > y1) {
                // 3rd 180 - 270
                angle = Math.PI + angle;
            }
            else {
                // 2nd quad 
                angle = Math.PI - angle;
            }
        }
        return angle;
        // return angle*180 / Math.PI;
    
    }

    inputHandler = (e)=> {
        this.setState({value: e.target.value});
        this.rotateImage(e.target.value);
    }

    rotateImage = (value)=> {
    
        let {canvasFunctions, isImageLoaded} = this.props;

        if(!isImageLoaded)
            return;
    
        let image = canvasFunctions.getEditedImage();

        if(value === "0" || value === "360" || value === "-360") {
            canvasFunctions.setDisplayImage(image);
            return;
        }

        let {width, height, data} = image;
        
        let rotatedImage = new ImageData(width, height);
        let angle_in_radian = (Math.PI/180 * value);

        let canvas = this.props.canvasElements.canvas.current;
        let ctx = canvas.getContext("2d");

        let imageElement = this.props.canvasFunctions.getEditedImageElement();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.save(); //save the initial transformation (translation)
		ctx.translate(canvas.width/2, canvas.height/2); // (move to the center so image rotates from center not from top-left corner)
		
		// rotate the canvas
		ctx.rotate(angle_in_radian);
		// rotating the context will clear the image so we need to draw image (drawImage is more efficent then putImageData(use put imageData only when working with pixels))

		// draw image on canvas (image will be drawn on canvas as it is not rotated (its like tranform of the html element but that will not effect the drawing)) (think of it as frame(canvas) and photo(context), it is rotating the context but not canvas)
		ctx.drawImage(imageElement, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
		
		// changing the imageData because putImageData used in applyChangesToCanvas(for adjustment) doesnot depends on rotaion of ctx (its an array for whole canvas, we need rotated arry for it to show rotated image), now we are changing the orginalImageData (array) to rotated image array 
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		// above we just rotate the canvas, now get the image data of rotated canvas and save the data
        
		// restore's the translate we done to move to center
		ctx.restore();

    }

    applyChanges = ()=> {
        this.props.canvasFunctions.setFullResEditedImage(this.getFullResRotatedImage(this.state.value));
    }

    // used for saving the changes
    getFullResRotatedImage = (value)=> {
    
        let {canvasFunctions, isImageLoaded} = this.props;

        if(!isImageLoaded)
            return;
    
        let image = canvasFunctions.getFullResEditedImage();

        if(value === "0" || value === "360" || value === "-360") {
            return image;
        }

        let angle_in_radian = (Math.PI/180 * value);

        let imageElement = this.props.canvasFunctions.getFullResEditedImageElement();

        let canvas = document.createElement("canvas");
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        let ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.save(); //save the initial transformation (translation)
		ctx.translate(canvas.width/2, canvas.height/2); // (move to the center so image rotates from center not from top-left corner)
		
		// rotate the canvas
		ctx.rotate(angle_in_radian);
		// rotating the context will clear the image so we need to draw image (drawImage is more efficent then putImageData(use put imageData only when working with pixels))

		// draw image on canvas (image will be drawn on canvas as it is not rotated (its like tranform of the html element but that will not effect the drawing)) (think of it as frame(canvas) and photo(context), it is rotating the context but not canvas)
		ctx.drawImage(imageElement, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
		
		// changing the imageData because putImageData used in applyChangesToCanvas(for adjustment) doesnot depends on rotaion of ctx (its an array for whole canvas, we need rotated arry for it to show rotated image), now we are changing the orginalImageData (array) to rotated image array 
		let imageData = ctx.getImageData(0, 0, imageElement.width, imageElement.height);
		// above we just rotate the canvas, now get the image data of rotated canvas and save the data
        
		// restore's the translate we done to move to center
		ctx.restore();

        return imageData;

    }

    render() {
        return <div style={{display: "flex", flexDirection: "column", justifyContent: "center" ,alignItems: "center"}}>
          
            <div>Rotate</div>
            <hr />
            <input style={{width: "100%"}} type="range" defaultValue="0" min="-360" max="360" step="1" onChange={this.inputHandler} />
            <hr />
            <button onClick={this.applyChanges} className="btn btn-primary">Apply</button>
        </div>
    }
}

export default Rotate;