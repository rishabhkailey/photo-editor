import React, {Component} from "react";

class Rotate extends Component {
    
    // calculateAngleInRadian = (x1, y1, x2, y2) => {
        
    //     // 

    //     let angle = Math.atan((y2-y1)/(x2-x1));
        
    //     if(x2 > x1) {
    //         if(y2 > y1) {
    //             // console.log("first quad");
    //             // no change
    //         }
    //         else {
    //             // console.log("4th quad");
    //             angle = (2*Math.PI) + angle;
    //         }
    //     }
    //     else {
    //         if(y2 > y1) {
    //             // console.log("2nd quad");
    //             angle += Math.PI;
    //         }
    //         else {
    //             // console.log("3rd quad");
    //             angle += Math.PI;
    //         }
    //     }
    //     return angle;
    //     // return angle*180 / Math.PI;
    
    // }
    
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
    
        let {canvasFunctions, isImageLoaded} = this.props;

        if(!isImageLoaded)
            return;
    
        let image = canvasFunctions.getEditedImage();

        if(e.target.value === "0" || e.target.value === "360" || e.target.value === "-360") {
            canvasFunctions.setDisplayImage(image);
            return;
        }

        let {width, height, data} = image;
        
        let center = {x: parseInt(width/2), y: parseInt(height/2)};
        let rotatedImage = new ImageData(width, height);
        let angle_in_radian = (Math.PI/180 * e.target.value);

        // finding the right quadrant

        let index = 0;
        let bool = false;
        // console.log(center);
        for(let i=0; i<height; i++) {
            for(let j=0; j<width; j++) {

                // diff = length (line from center to that pixel)
                let diff = Math.sqrt( Math.pow(i-center.y, 2) + Math.pow(j-center.x , 2) );
                
                // current angle 
                // let angle = Math.atan((i - center.y)/(j - center.x));
                let angle = this.calculateAngleInRadian(center.x, center.y, j, i);

                // if(!bool) {
                //     console.log(`${i - center.y}/${j - center.x}) = `, angle * 180 / Math.PI);
                // }

                // angle after rotating (final angle)
                angle += angle_in_radian;

                // assuming center to be 0, 0 relative value of pixel position after rotating will be diff * cos(angle_in_radian), diff * sin(angle_in_radian)
                let x = diff * Math.cos(angle);
                let y = diff * Math.sin(angle);
                
                
                // position relative to center (not 0, 0)
                x = center.x - x;
                y = center.y - y;

                if(parseInt(x) >= width || parseInt(x) <= 0 || parseInt(y) >= height || parseInt(y) <= 0){ 
                    continue;
                }

                // if x = 1.7 that pixel is on 1 (30%) and on 2(70%) we have to color both accordingly else we will have some pixel left (without color) so for x, y total 4 combinations
                let x1 = parseInt(x);
                let x2 = x1 + 1;
                let proportionX = x%1; // after decimal (if = .7 then x1 proprtion = 1 - .7 and x2's proportion is .7)

                let y1 = parseInt(y);
                let y2 = y1 + 1;
                let proportionY = y%1; // y to y1 

                this.colorProportionaly(rotatedImage.data, x1, y1, data, i, j, (proportionX) * (proportionY), width);
                this.colorProportionaly(rotatedImage.data, x1, y2, data, i, j, (proportionX) * (1 - proportionY), width);
                this.colorProportionaly(rotatedImage.data, x2, y1, data, i, j, (1 - proportionX) * (proportionY), width);
                this.colorProportionaly(rotatedImage.data, x2, y2, data, i, j, (1 - proportionX) * (1 - proportionY), width);
                
                // let index = (y*width + x)*4;
                // let index1 = (i*width + j)*4;
                
                // rotatedImage.data[index++] = data[index1++];
                // rotatedImage.data[index++] = data[index1++];
                // rotatedImage.data[index++] = data[index1++];
                // rotatedImage.data[index++] = data[index1++];
            }
        }

        // console.log(rotatedImage, index);        
        canvasFunctions.setDisplayImage(rotatedImage);
    }

    colorProportionaly = (rotatedImageData, x, y, data, i, j, proportion, width) => {

        let index = (y*width + x)*4;
        let index1 = (i*width + j)*4;
        
        // rotatedImageData[index] = rotatedImageData[index] + (data[index1++] * proportion);
        // rotatedImageData[index + 1] = rotatedImageData[index + 1] + (data[index1++] * proportion);
        // rotatedImageData[index + 2] = rotatedImageData[index + 2] + (data[index1++] * proportion);
        // rotatedImageData[index + 3] = rotatedImageData[index + 3] + (data[index1++] * proportion);
    
        // rotatedImageData[index] = (rotatedImageData[index] * (1 - proportion)) + (data[index1++] * proportion);
        // rotatedImageData[index + 1] = (rotatedImageData[index + 1] * (1 - proportion)) + (data[index1++] * proportion);
        // rotatedImageData[index + 2] = (rotatedImageData[index + 2] * (1 - proportion)) + (data[index1++] * proportion);
        // rotatedImageData[index + 3] = (rotatedImageData[index + 3] * (1 - proportion)) + (data[index1++] * proportion);
    
        rotatedImageData[index] = data[index1++];
        rotatedImageData[index + 1] = data[index1++];
        rotatedImageData[index + 2] = data[index1++];
        rotatedImageData[index + 3] = data[index1++];
    }

    render() {
        return <div style={{display: "flex", flexDirection: "column", justifyContent: "center" ,alignItems: "center"}}>
          
            <div>Rotate</div>
            <hr />
            <input style={{width: "100%"}} type="range" defaultValue="0" min="-360" max="360" step="10" onChange={this.inputHandler} />

        </div>
    }
}

export default Rotate;