import * as React from "react";
import { connect } from "react-redux";

import history from "../../history.js";
import { RootState } from "../../redux/store";
import { GlobalState } from "../../type.js";

type props = Partial<RootState> & {
    globalState: GlobalState
}

function AdjustmentInteractions(props: props): JSX.Element {

    let { isImageLoaded } = props

    const [brightness, setBrightness] = React.useState<number>(0)
    const [contrast, setContrast] = React.useState<number>(0)
    const [saturation, setSaturation] = React.useState<number>(0)
    const [temparature, setTemparature] = React.useState<number>(0)
    const [shadows, setShadows] = React.useState<number>(0)
    const [highlights, setHighlights] = React.useState<number>(0)
    const [sharpness, setSharpness] = React.useState<number>(0)

    // to reduce complexity, we can reuse this object instant of creating new object everytime
    let localImageData: ImageData | undefined = undefined

    // display any change in brightness, contrast, saturation 
    React.useEffect(
        () => {
            if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
                // TODO - display message to user
                console.debug("either Image is not loaded or imageHelper is not intialized yet")
                return;
            }

            displayChanges()
            // console.log("update called",props.isImageLoadedbrightness, contrast, saturation)
        }, [brightness, contrast, saturation]
    )

    // React.useEffect(() => {
    //     if (props.globalState.imageHelper !== undefined && props.globalState.imageHelper.loaded) {
    //         console.log(`localImageData before ${localImageData.data}`)
    //         localImageData = new ImageData(new Uint8ClampedArray(props.globalState.imageHelper.imageData.data), props.globalState.imageHelper.imageData.width, props.globalState.imageHelper.imageData.height)
    //         console.debug(`localImageData loaded=${props.globalState.imageHelper.loaded}`)
    //         console.debug("localImageData initialized to", localImageData, "from", props.globalState.imageHelper.imageData)
    //     }
    //     console.debug(props.globalState.imageHelper?.loaded)
    // }, [props.globalState.imageHelper?.loaded])

    // it updates the incoming image data reference, it does not return the updated image data
    function changeBrightNess(imageData: Uint8ClampedArray, i: number, sourceImageData?: Uint8ClampedArray): void {
        imageData[i] = sourceImageData === undefined ? imageData[i] + brightness : sourceImageData[i] + brightness;
        imageData[i + 1] = sourceImageData === undefined ? imageData[i + 1] + brightness : sourceImageData[i + 1] + brightness;
        imageData[i + 2] = sourceImageData === undefined ? imageData[i + 2] + brightness : sourceImageData[i + 2] + brightness;
    }

    // it updates the incoming image data reference, it does not return the updated image data
    function changeSatruration(imageData: Uint8ClampedArray, i: number, sourceImageData?: Uint8ClampedArray): void {
        // saturation (increase the value of color which is more lol)
        // at -100 saturation image should be b/w i.e. rgb = avg,
        // if saturation is decreasing the gap between r, g, b values and avg should be decreasing, if saturation is -50 gap now should be half as it was before
        // if saturation is increasing the gap betweem r, g, b values and avg should be increasing
        // using saturation as percentage of diff increased or decreased as compared to original difference 

        if (sourceImageData === undefined) {
            let avg = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
            imageData[i] += (((imageData[i] - avg) / 100) * saturation);
            imageData[i + 1] += (((imageData[i + 1] - avg) / 100) * saturation);
            imageData[i + 2] += (((imageData[i + 2] - avg) / 100) * saturation);
        }
        else {
            let avg = (sourceImageData[i] + sourceImageData[i + 1] + sourceImageData[i + 2]) / 3;
            imageData[i] = sourceImageData[i] + (((sourceImageData[i] - avg) / 100) * saturation);
            imageData[i + 1] = sourceImageData[i + 1] + (((sourceImageData[i + 1] - avg) / 100) * saturation);
            imageData[i + 2] = sourceImageData[i + 2] + (((sourceImageData[i + 2] - avg) / 100) * saturation);
        }
    }

    function changeContrast(imageData: Uint8ClampedArray, i: number, sourceImageData?: Uint8ClampedArray): void {
        // bright pixel
        // equaly increase else color will change
        // bright to more bright, further for two bright pixels increase in brightness of less bright pixel should be less than that of more bright pixel, so it can create contrast even in between two bright pixels
        // to do so the value increased or decreased should depends on brightness of pixel
        if (sourceImageData === undefined) {
            let avg = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
            let value = contrast * ((avg - 122.5) / 100)
            imageData[i] += value;
            imageData[i + 1] += value;
            imageData[i + 2] += value;
        }
        else {
            let avg = (sourceImageData[i] + sourceImageData[i + 1] + sourceImageData[i + 2]) / 3;
            let value = contrast * ((avg - 122.5) / 100)
            imageData[i] = sourceImageData[i] + value;
            imageData[i + 1] = sourceImageData[i + 1] + value;
            imageData[i + 2] = sourceImageData[i + 2] + value;
        }
    }

    function changeTemparature(imageData: Uint8ClampedArray, i: number, sourceImageData?: Uint8ClampedArray): void {
    }
 

    function displayChanges(): void {

        // redundand code but required, we have the smae check before displayChanges.
        if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
            // TODO - display message to user
            console.debug("either Image is not loaded or imageHelper is not intialized yet")
            return;
        }

        if (localImageData === undefined) {
            localImageData = new ImageData(new Uint8ClampedArray(props.globalState.imageHelper.imageData.data), props.globalState.imageHelper.imageData.width, props.globalState.imageHelper.imageData.height)
        }

        let imageData = props.globalState.imageHelper.imageData;
        // let localImageData = new ImageData(new Uint8ClampedArray(props.globalState.imageHelper.imageData.data), props.globalState.imageHelper.imageData.width, props.globalState.imageHelper.imageData.height)
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (!checkForSelection(i))
                continue;
            changeBrightNess(localImageData.data, i, imageData.data);
            changeContrast(localImageData.data, i);
            changeSatruration(localImageData.data, i);
        }
        // todo - fix this
        console.debug(props.globalState.imageHelper.loaded, localImageData.data, imageData.data)
        props.globalState.imageHelper.displayImageData = localImageData;
    }

    function applyChangesToFullResImage(): void {

        // redundand code but required, we have the smae check before displayChanges
        if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
            // TODO - display message to user
            console.debug("either Image is not loaded or imageHelper is not intialized yet")
            return;
        }

        // console.log(image);
        let image = props.globalState.imageHelper.fullResEditedImageData;
        let imageData = image.data;

        for (let i = 0; i < imageData.length; i += 4) {
            if (!checkForSelection(i, true))
                continue;
            changeBrightNess(imageData, i);
            changeContrast(imageData, i);
            changeSatruration(imageData, i);
        }

        props.globalState.imageHelper.fullResImageData = image;

    }

    function checkForSelection(index: number, fullRes: boolean = false) {

        if (!(props.selectionInfo?.selectionEnabled ?? false))
            return true;

        index = index / 4
        let selectionMapping = fullRes ? props.selectionInfo?.fullResSelectionMapping : props.selectionInfo?.selectionMapping;

        let i = index / selectionMapping[0].length
        let j = index % selectionMapping[0].length

        // console.log(selectionMapping.length, selectionMapping[4].length);

        // return true;
        try {
            if (selectionMapping[i][j]) {
                return true;
            }
        }
        catch (error) {
            console.log(i, j);
        }

        return false;

    }

    function saveChanges(): void {
        applyChangesToFullResImage();
        history.push("/");
    }

    return <div className="flex-column justify-content-start align-items-center">
        {!isImageLoaded && <div className="alert alert-danger">
            Select image First to start editing
        </div>}
        <div className="flex-column">
            <div className="text-center">
                Brightness
            </div>
            <div>
                <input style={{ width: "100%" }} type='range' min="-100" max="100" step="3" name='brightness' defaultValue="0" onInput={(e: any): void => { setBrightness(parseInt(e.target.value)) }} />
                {/* <input type='number' name='brightness' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>

        <hr />

        <div className="flex-column">
            <div className="text-center">
                Contrast
            </div>
            <div>
                <input style={{ width: "100%" }} type='range' min="-100" max="100" step="3" name='contrast' defaultValue="0" onInput={(e: any): void => { setContrast(parseInt(e.target.value)) }} />
                {/* <input type='number' name='contrast' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>

        <hr />

        <div className="flex-column">
            <div className="text-center">
                Saturation
            </div>
            <div>
                <input style={{ width: "100%" }} type='range' min="-100" max="100" step="3" name="saturation" defaultValue="0" onInput={(e: any): void => { setSaturation(parseInt(e.target.value)) }} />
                {/* <input type='number' name='saturation' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>

        <hr />

        <div className="flex-column">
            <div className="text-center">
                Temprature
            </div>
            <div>
                <input style={{ width: "100%" }} type='range' min="-100" max="100" step="3" name="temarature" defaultValue="0" onInput={(e: any): void => { setTemparature(parseInt(e.target.value)) }} />
                {/* <input type='number' name='saturation' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>

        <hr />

        <div className="flex-column">
            <div className="text-center">
                Shadows
            </div>
            <div>
                <input style={{ width: "100%" }} type='range' min="-100" max="100" step="3" name="shadows" defaultValue="0" onInput={(e: any): void => { setShadows(parseInt(e.target.value)) }} />
                {/* <input type='number' name='saturation' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>

        <hr />

        <div className="flex-column">
            <div className="text-center">
                Highlights
            </div>
            <div>
                <input style={{ width: "100%" }} type='range' min="-100" max="100" step="3" name="highlights" defaultValue="0" onInput={(e: any): void => { setHighlights(parseInt(e.target.value)) }} />
                {/* <input type='number' name='saturation' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>

        <hr />

        <div className="flex-column">
            <div className="text-center">
                Sharpness
            </div>
            <div>
                <input style={{ width: "100%" }} type='range' min="-100" max="100" step="3" name="sharpness" defaultValue="0" onInput={(e: any): void => { setSharpness(parseInt(e.target.value)) }} />
                {/* <input type='number' name='saturation' defaultValue="0" onChange={this.onChange} /> */}
            </div>
        </div>

        <hr />

        <div className="text-center">
            <button className="btn border" onClick={saveChanges}>
                apply
            </button>
        </div>
    </div>
}

const mapStateToProps = (state: RootState): any => {
    console.log(state);
    return { ...state };
}


export default connect(mapStateToProps)(AdjustmentInteractions);