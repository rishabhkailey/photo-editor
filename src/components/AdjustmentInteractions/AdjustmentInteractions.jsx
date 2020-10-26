import React, {Component} from "react";
import { connect } from "react-redux";

import history from "./../../history.js";

class AdjustmentInteractions extends Component {
    
    constructor(props) {
        super(props);

        // not declared in state as setstate has its lifecycle it will check if dom needs to be updated or not so it will cause performance issues
        this.changes = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            extra: 0 // useless
        }
    }

	changeBrightNess(data, i) {

        let {brightness: brightnessValue} = this.changes;

		// brightness
		data[i] += brightnessValue;
		data[i+1] += brightnessValue;
		data[i+2] += brightnessValue;
    }
    
	changeSatruration(data, i) {

        let {saturation: saturationValue} = this.changes;

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
    
	changeContrast(data, i) {

        let {contrast: contrastValue} = this.changes;

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

    displayChanges = ()=> {

        let image = this.props.canvasFunctions.getEditedImage();
        let imageData = image.data;

        for(let i=0; i<imageData.length; i+=4) {
            this.changeBrightNess(imageData, i);
            this.changeContrast(imageData, i);
            this.changeSatruration(imageData, i);
        }

        this.props.canvasFunctions.setDisplayImage(image);
    }

    applyChangesToFullResImage = ()=> {  
        // console.log(image);
        let image = this.props.canvasFunctions.getFullResEditedImage();
        let imageData = image.data;

        for(let i=0; i<imageData.length; i+=4) {
            this.changeBrightNess(imageData, i);
            this.changeContrast(imageData, i);
            this.changeSatruration(imageData, i);
        }

        
        this.props.canvasFunctions.setFullResEditedImage(image);
         
    }

    onChange = (e)=> {
        if(!this.props.isImageLoaded)
            return

        this.changes[e.target.name] = parseInt(e.target.value)|0;
        this.displayChanges()
    }

    saveChanges = ()=> {
        this.applyChangesToFullResImage();
        history.push("/");
    }

    render() {
        
        let { isImageLoaded } = this.props;

        return <div className="flex-column justify-content-start align-items-center">
        {!isImageLoaded && <div className="alert alert-danger">
            Select image First to start editing
        </div>}
        <div className="flex-column">
            <div className="text-center">
                Brightness
            </div>
            <div>
                <input style={{width: "100%"}} type='range' min="-100" max="100" step="3" name='brightness' defaultValue="0" onInput={this.onChange} />
                {/* <input type='number' name='brightness' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>
        
        <hr />

        <div className="flex-column">
            <div className="text-center">
                Contrast
            </div>
            <div>
                <input style={{width: "100%"}} type='range' min="-100" max="100" step="3" name='contrast' defaultValue="0" onInput={this.onChange} />
                {/* <input type='number' name='contrast' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>
        
        <hr />
        
        <div className="flex-column">
            <div className="text-center">
                Saturation
            </div>
            <div>
                <input style={{width: "100%"}} type='range' min="-100" max="100" step="3" name="saturation" defaultValue="0" onInput={this.onChange} />
                {/* <input type='number' name='saturation' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>
        
        <hr />
        
        <div className="text-center">
            <button className="btn border" onClick={this.saveChanges}>
                apply
            </button>
        </div>
    </div>
    }
}

const mapStateToProps = state => {
    console.log(state);
    return {...state};
}


export default connect(mapStateToProps)(AdjustmentInteractions);