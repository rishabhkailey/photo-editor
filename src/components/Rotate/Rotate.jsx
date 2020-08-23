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
                let x = parseInt(diff * Math.cos(angle));
                let y = parseInt(diff * Math.sin(angle));
                
                
                // position relative to center (not 0, 0)
                x = center.x - x;
                y = center.y - y;

                
                // if(!bool)
                //     console.log(i , j , "to", x, y, angle, angle_in_radian * 180 / Math.PI);
                   
                bool = true;
                
                if(x >= width || x <= 0 || y >= height || y<= 0){ 
                    continue;
                }

                let index = (y*width + x)*4;
                let index1 = (i*width + j)*4;
                
                rotatedImage.data[index++] = data[index1++];
                rotatedImage.data[index++] = data[index1++];
                rotatedImage.data[index++] = data[index1++];
                rotatedImage.data[index++] = data[index1++];
            }
        }

        // console.log(rotatedImage, index);        
        canvasFunctions.setDisplayImage(rotatedImage);
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