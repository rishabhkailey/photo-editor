import React, { Component } from 'react';
import { connect } from "react-redux";
import { setImageLoaded, setShowDisableSelectionTooltip, setSelectionInfo } from "../../redux/actions";

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import { RootState } from '../../redux/store';
import { WidthHeight } from '../../type';
import CanvasHelper from '../../utils/CanvasHelper/canvasHelper'
import ImageHelper from '../../utils/ImageHelper/imageHelper'

// input image file -> image data url(by image reader) -> image (new Image(data url)) -> imageData (by image -> canvas -> imageData)
// originalImage, displayImage, editedImage represent image data(array and width) not image html element

interface props extends RootState {
    setImageLoaded: any,
    setSelectionInfo: any,
    canvasRef: any,
    canvasContainerRef: any,
    setShowDisableSelectionTooltip: any,
    setCanvasRef: any,
    setCanvasFunctions: any,
    setCanvasContainerRef: any
}

function CanvasAndImage(props: any) {
    
    let canvasHelper: CanvasHelper;
    let imageHelper: ImageHelper;
    let canvasRef: any = React.useRef();
    let canvasContainerRef: any = React.useRef();
    let canvasAvailableSpaceRef: any = React.useRef();
    let disableSelectionTooltipRef: any = React.useRef();
    
    let imageFile = null;

    // contains all funtions required by the features
    let canvasFunctions: any = {};

    // contains all elements(refs) which can be used e.g. canvasRef, canvasContainerRef
    let canvasElements: any = {};

    let maxCanvasSize: WidthHeight = { width: 0, height: 0 };

    const [isImageLoaded, setIsImageLoaded] = React.useState(false)

    // ??
    // function resetDisplayImage() {
    //     if (!isImageLoaded)
    //         return;

    //     console.log("reset image");
    //     setDisplayImage(getEditedImage());
    // }

    // ??
    const setImageLoaded = () => {
        setIsImageLoaded(true)
        // ??
        // props.setGlobalState({ isImageLoaded: true });
        props.setImageLoaded(true);
    }

    const imageInput = (e: any) => {
        if (e.target.files && e.target.files.length === 0)
            return;

        imageFile = e.target.files[0];
        imageHelper = new ImageHelper(imageFile, canvasHelper)
        props.setImageHelper(imageHelper)
        setImageLoaded()
    }
    React.useEffect(() => {
        canvasElements = { canvas: canvasRef, canvasContainer: canvasContainerRef };

        maxCanvasSize = canvasAvailableSpaceRef.current.getBoundingClientRect()
        canvasHelper = new CanvasHelper(canvasRef.current, canvasContainerRef.current, maxCanvasSize)


        // props.setGlobalState({ canvasFunctions: canvasFunctions, canvasElements: canvasElements })
        // props.setCanvasElements(canvasElements);
        props.setCanvasRef(canvasRef)
        props.setCanvasContainerRef(canvasContainerRef)

        props.setShowDisableSelectionTooltip(false)

        if (disableSelectionTooltipRef.current)
            disableSelectionTooltipRef.current.focus();
    }, []);

    React.useEffect(() => {
        console.log("here ................................................................................................");
        console.log(props.showDisableSelectionTooltip);
        if (props.showDisableSelectionTooltip === true) {
            setTimeout((() => { props.setShowDisableSelectionTooltip(false) }), 2000);
        }
    }, [props.showDisableSelectionTooltip])

    const disableSelection = () => {
        // resetDisplayImage();
        props.setSelectionInfo({ selectionEnabled: false, selectMapping: null })
    }
    let { selectionEnabled } = props.selectionInfo;
    // let { canvasRef, canvasContainerRef } = props;
    let selection = null;

    if (selectionEnabled) {
        selection = <div className="">
            <Tooltip title="disable selection mode" open={props.showDisableSelectionTooltip}>
                <div className="border rounded" >
                    <IconButton aria-label="" color="secondary" size="small" onClick={disableSelection}>
                        <SelectAllIcon color="secondary" />
                    </IconButton>
                </div>
            </Tooltip>
        </div>;
    }
    return <div className="d-flex flex-column align-items-stretch h-100">
        <div className="d-flex flex-row justify-content-around">
            <div className="d-flex flex-row flex-grow-1 justify-content-center">
                <input className="border" type='file' accept="images" onChange={imageInput} />
            </div>
            {selection}
        </div>
        <div className="flex-grow-1 d-flex flex-row justify-content-center align-items-center" ref={canvasAvailableSpaceRef}>
            <div style={{ height: "100%", width: "100%", position: "relative" }} ref={canvasContainerRef}>
                <div className="flex-grow-1" style={{ position: "relative" }} >
                    <canvas ref={canvasRef}></canvas>
                </div>
            </div>
        </div>
    </div>
}

const mapStateToProps = (state: any) => ({
    selectionInfo: state.selectionInfo,
    showDisableSelectionTooltip: state.showDisableSelectionTooltip
})


export default connect(
    mapStateToProps,
    { setImageLoaded, setShowDisableSelectionTooltip, setSelectionInfo })(CanvasAndImage);