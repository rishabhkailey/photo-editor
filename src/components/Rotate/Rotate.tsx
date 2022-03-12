import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { GlobalState } from "../../type";
import { imageDataToImageSrc } from "../../utils/imageConversion";


type props = Partial<RootState> & {
    globalState: GlobalState
}

function Rotate(props: props) {

    const [value, setValue] = React.useState(0)


    function calculateAngleInRadian(x1: number, y1: number, x2: number, y2: number): number {

        // Math.pi will only give ans between 0 - 90 and -90 to 0 (math.abs() = 0 to 90)

        // math.abs is important below conditions are for absolute angle (- or + is decided by the coordinates) (we don't need sign below)
        let angle = Math.abs(Math.atan((y2 - y1) / (x2 - x1)));

        if (x2 < x1) {
            if (y2 > y1) {
                // 4th quad 
                angle = (angle === 0) ? 0 : (2 * (Math.PI) - angle);
            }
            else {
                //  (1st quad 0 - 90)
                angle = angle;
            }
        }
        else {
            if (y2 > y1) {
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

    function inputHandler(e: any): void {
        setValue(Number(e.target.value))
        rotateImage(Number(e.target.value));
    }

    function rotateImage(value: number): void {
        
        if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
            // TODO - display message to user
            console.debug("either Image is not loaded or imageHelper is not intialized yet")
            return;
        }

        let { canvasFunctions, isImageLoaded } = props;

        if (!isImageLoaded)
            return;

        // let { width, height, data } = image;
        console.log(value);
        if (value === 0 || value === 360 || value === -360) {
            console.log("inside if");
            let image = props.globalState.imageHelper.editedImageData;
            canvasFunctions.setDisplayImage(image);
            return;
        }


        // let rotatedImage = new ImageData(width, height);
        let angle_in_radian = (Math.PI / 180 * value);

        let canvas = props.globalState.imageHelper.canvasHelper.canvasElement;
        let ctx = canvas.getContext("2d");

        if (!ctx) {
            // TODO - display message to user
            console.debug("Unable to get canvas context")
            return;
        }

        let imageElement = props.globalState.imageHelper.editedImageElement;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save(); //save the initial transformation (translation)
        ctx.translate(canvas.width / 2, canvas.height / 2); // (move to the center so image rotates from center not from top-left corner)

        // rotate the canvas
        ctx.rotate(angle_in_radian);
        // rotating the context will clear the image so we need to draw image (drawImage is more efficent then putImageData(use put imageData only when working with pixels))

        // draw image on canvas (image will be drawn on canvas as it is not rotated (its like tranform of the html element but that will not effect the drawing)) (think of it as frame(canvas) and photo(context), it is rotating the context but not canvas)
        ctx.drawImage(imageElement, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

        // changing the imageData because putImageData used in applyChangesToCanvas(for adjustment) doesnot depends on rotaion of ctx (its an array for whole canvas, we need rotated arry for it to show rotated image), now we are changing the orginalImageData (array) to rotated image array 
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // above we just rotate the canvas, now get the image data of rotated canvas and save the data

        // restore's the translate we done to move to center
        ctx.restore();

    }

    function applyChanges(){
        if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
            // TODO - display message to user
            console.debug("either Image is not loaded or imageHelper is not intialized yet")
            return;
        }
        let imageData = getFullResRotatedImage(value)
        if (imageData)
            props.globalState.imageHelper.fullResImageData = imageData
    }

    // used for saving the changes
    function getFullResRotatedImage(value: number) {
        
        if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
            // TODO - display message to user
            console.debug("either Image is not loaded or imageHelper is not intialized yet")
            return;
        }

        let { canvasFunctions, isImageLoaded } = props;

        if (!isImageLoaded)
            return;

        let image = props.globalState.imageHelper.fullResEditedImageData;

        if (value === 0 || value === 360 || value === -360) {
            return image;
        }

        let angle_in_radian = (Math.PI / 180 * value);

        let imageElement = props.globalState.imageHelper.fullResImageElement;
        let canvas = document.createElement("canvas");
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        let ctx = canvas.getContext("2d");
        if (!ctx) {
            // TODO - display message to user
            console.debug("Unable to get canvas context")
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save(); //save the initial transformation (translation)
        ctx.translate(canvas.width / 2, canvas.height / 2); // (move to the center so image rotates from center not from top-left corner)

        // rotate the canvas
        ctx.rotate(angle_in_radian);
        // rotating the context will clear the image so we need to draw image (drawImage is more efficent then putImageData(use put imageData only when working with pixels))

        // draw image on canvas (image will be drawn on canvas as it is not rotated (its like tranform of the html element but that will not effect the drawing)) (think of it as frame(canvas) and photo(context), it is rotating the context but not canvas)
        ctx.drawImage(imageElement, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

        // changing the imageData because putImageData used in applyChangesToCanvas(for adjustment) doesnot depends on rotaion of ctx (its an array for whole canvas, we need rotated arry for it to show rotated image), now we are changing the orginalImageData (array) to rotated image array 
        let imageData = ctx.getImageData(0, 0, imageElement.width, imageElement.height);
        // above we just rotate the canvas, now get the image data of rotated canvas and save the data

        // restore's the translate we done to move to center
        ctx.restore();

        return imageData;

    }

    // componentDidMount() {
    //     if (props.isImageLoaded && props.selectionInfo.selectionEnabled) {
    //         props.canvasFunctions.resetDisplayImage();
    //     }
    // }

    // componentDidUpdate() {

    //     // if (props.isImageLoaded && props.selectionInfo.selectionEnabled) {
    //     //     props.canvasFunctions.resetDisplayImage();
    //     // }

    // }

    React.useEffect(()=>{
        if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
            // TODO - display message to user
            console.debug("either Image is not loaded or imageHelper is not intialized yet")
            return;
        }

        if (props.selectionInfo?.selectionEnabled) {
            props.globalState.imageHelper.resetDisplayImage();
        }
    }, [])

    React.useEffect(()=>{
        return () => {
            if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
                // TODO - display message to user
                console.debug("either Image is not loaded or imageHelper is not intialized yet")
                return;
            }
            props.globalState.imageHelper.resetDisplayImage();
        };
    }, [])

    
        console.log(props.globalState)
        let { isImageLoaded, selectionInfo } = props;
        console.log(isImageLoaded)
        return <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>

            {!isImageLoaded && <div className="alert alert-danger">
                Select image First to start editing
            </div>}

            {selectionInfo?.selectionEnabled && <div className="alert alert-danger">
                this feature does not support editing with selection
            </div>}

            <div>Rotate</div>
            <hr />
            <input style={{ width: "100%" }} type="range" defaultValue="0" min="-360" max="360" step="1" onChange={inputHandler} />
            <hr />
            <button onClick={applyChanges} className="btn btn-primary">Apply</button>
        </div>
}


const mapStateToProps = (state: RootState) => {
    console.log(state);
    return { ...state };
}


export default connect(mapStateToProps)(Rotate);