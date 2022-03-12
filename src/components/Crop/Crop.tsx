import React from "react";
import history from "../../history.js";
import { connect } from "react-redux";
import { RootState } from "../../redux/store.js";
import { GlobalState, WidthHeight, Point } from "../../type.js";

// only those properties which are required
type mouseEvent = {
    clientX: number,
    clientY: number
}

type props = Partial<RootState> & {
    globalState: GlobalState
}


function Crop(props: props) {
    const [cropEnabled, setCropEnabled] = React.useState(false);
    const [needToEnableCrop, setNeedToEnableCrop] = React.useState(false);
    
    

    React.useEffect(() => {
        if (props.isImageLoaded === true && !cropEnabled && !needToEnableCrop) {
            setNeedToEnableCrop(true)
        }
    }, [props.isImageLoaded])

    React.useEffect(() => disableCrop, [])

    React.useEffect(() => {
        if (cropEnabled === false && needToEnableCrop === true) {
            enableCrop();

            if (props.selectionInfo?.selectionEnabled) {
                props.globalState.imageHelper?.resetDisplayImage();
            }
        }
        console.log(cropRectRef)
    
    })

    // this is used by crop rect on click handler, clicked near left edge its value = l, if top left then = lr, if in center = ''
    let nearEdge: string = '';

    //when on click on cropRect the initial position is stored here and we calculate distance of this initial position - current position
    let initialPosition: Point = { x: 0, y: 0 };

    // store value of previous translate value, used to calculate new translate value
    let translate: Point = { x: 0, y: 0 };

    // translate value of previous onmousedown session(changed on onmouseup)
    let offset: Point = { x: 0, y: 0 };

    // dimension of previous onmousedown session 
    let dimensionOffset: WidthHeight = { width: 0, height: 0 };

    let cropRectRef: React.RefObject<any> = React.useRef();
    console.log("value reseted")
    React.useEffect(() => {
        console.log(`value reset to ${cropRectRef}`)
    }, [cropRectRef])

    const isNearEdge = ({ clientX: mouseX, clientY: mouseY }: mouseEvent): boolean => {

        let { left: cropRectLeft, top: cropRectTop, bottom: cropRectBottom, right: cropRectRight } = cropRectRef.current.getBoundingClientRect();

        nearEdge = '';
        if (Math.abs(mouseX - cropRectLeft) < 10) {
            nearEdge += 'l';
        }
        else if (Math.abs(mouseX - cropRectRight) < 10) {
            nearEdge += 'r';
        }

        if (Math.abs(mouseY - cropRectTop) < 10) {
            nearEdge += 't';
        }
        else if (Math.abs(mouseY - cropRectBottom) < 10) {
            nearEdge += 'b';
        }

        if (nearEdge.length > 0) {
            return true;
        }

        return false;
    }

    const cropRectOnClickHandler = (e: mouseEvent): void => {
        console.log(cropRectRef)
        initialPosition = { x: e.clientX, y: e.clientY };

        if (isNearEdge(e)) {
            window.onmousemove = changeCropRectDimension;
        }
        else {
            window.onmousemove = changeCropRectPosition;
        }
        window.onmouseup = () => {
            offset = { x: translate.x, y: translate.y };
            dimensionOffset = { height: cropRectRef.current.getBoundingClientRect().height, width: cropRectRef.current.getBoundingClientRect().width };
            window.onmousemove = null;
        }
    }

    function changeCropRectDimension(e: mouseEvent): void {

        let cropRect = cropRectRef.current;
        let widthChange = 0;
        let heightChange = 0;

        if (nearEdge.indexOf('l') !== -1) {
            translate.x = offset.x + (e.clientX - initialPosition.x);
            widthChange = e.clientX - initialPosition.x;
        }
        else if (nearEdge.indexOf('r') !== -1) {
            widthChange = initialPosition.x - e.clientX;
        }

        if (nearEdge.indexOf('t') !== -1) {
            translate.y = offset.y + (e.clientY - initialPosition.y);
            heightChange = e.clientY - initialPosition.y;
        }
        else if (nearEdge.indexOf('b') !== -1) {
            heightChange = initialPosition.y - e.clientY;
        }
        cropRect.style.width = `${dimensionOffset.width - widthChange}px`;
        cropRect.style.height = `${dimensionOffset.height - heightChange}px`;
        cropRect.style.transform = `translateX(${translate.x}px) translateY(${translate.y}px)`;
    }

    function changeCropRectPosition({ clientX, clientY }: mouseEvent) {
        
        if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
            // TODO - display message to user
            console.debug("either Image is not loaded or imageHelper is not intialized yet")
            return;
        }

        let newTraslateX = offset.x + (clientX - initialPosition.x);
        let newTraslateY = offset.y + (clientY - initialPosition.y);

        let cropRect = cropRectRef.current;

        // container left right (boundaries crop rect should not exceed these values)
        let containerRect = props.globalState.imageHelper.canvasHelper.canvasContainerElement.getBoundingClientRect();

        let newLeft = newTraslateX + Math.floor(cropRect.style.left);
        let newRight = newLeft + Math.floor(cropRect.style.width);
        let newTop = newTraslateY + Math.floor(cropRect.style.top);
        let newBottom = newTop + Math.floor(cropRect.style.height);

        if (newLeft < containerRect.left) {
            // console.log("wrong")
            // = left most
            translate.x = containerRect.left - Math.floor(cropRect.style.left);
        }
        else if (newRight > containerRect.right) {
            // console.log("wrong");
            // = right most
            translate.x = containerRect.right - Math.floor(cropRect.style.width);
        }
        else {
            translate.x = newTraslateX
        }

        if (newTop < containerRect.top) {
            // console.log("wrong")
            // top most
            translate.y = containerRect.top - Math.floor(cropRect.style.top);
        }
        else if (newBottom > containerRect.bottom) {
            // console.log("wrong")
            // = bottom most
            translate.y = containerRect.bottom - Math.floor(cropRect.style.height);
        }
        else {
            translate.y = newTraslateY;
        }

        cropRect.style.transform = `translateX(${translate.x}px) translateY(${translate.y}px)`;

    }

    function enableCrop() {
        if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
            // TODO - display message to user
            console.debug("either Image is not loaded or imageHelper is not intialized yet")
            return;
        }
        let canvasContainer = props.globalState.imageHelper.canvasHelper.canvasContainerElement;
        let canvasRect = canvasContainer.getBoundingClientRect();
        let cropRect = cropRectRef.current;

        cropRect.style.width = canvasRect.width / 2 + 'px';
        cropRect.style.height = canvasRect.height / 2 + 'px';
        cropRect.style.position = 'absolute';
        cropRect.style.top = '0px';
        cropRect.style.left = '0px';
        cropRect.style.border = '1px solid white';

        translate = { x: (canvasRect.left + canvasRect.width / 4), y: (canvasRect.top + canvasRect.height / 4) };
        cropRect.style.transform = `translateX(${translate.x}px) translateY(${translate.y}px)`;
        offset = { x: (canvasRect.left + canvasRect.width / 4), y: (canvasRect.top + canvasRect.height / 4) };


        cropRect.onmousedown = cropRectOnClickHandler;

        dimensionOffset = { height: canvasRect.height / 2, width: canvasRect.width / 2 };

        setCropEnabled(true)
        setNeedToEnableCrop(false)

        console.log("crop enabled");
    }

    function disableCrop() {
        window.onmousemove = null;
        window.onmouseup = null;
        cropRectRef.current.onmousedown = null;
        console.debug("disable Crop");
    }

    function confirmCrop() {

        if (!props.isImageLoaded || props.globalState.imageHelper === undefined) {
            // TODO - display message to user
            console.debug("either Image is not loaded or imageHelper is not intialized yet")
            return;
        }

        let { left, top, width, height } = cropRectRef.current.getBoundingClientRect();
        let { left: canvasLeft, top: canvasTop } = props.globalState.imageHelper.canvasHelper.canvasContainerElement.getBoundingClientRect();

        // dimensions of original crop rect
        left = left - canvasLeft;
        top = top - canvasTop;

        let image = props.globalState.imageHelper.editedImageData;
        console.log(props)
        let fullResImage = props.globalState.imageHelper.fullResEditedImageData;

        console.log(`image = ${image} and fullResImage = ${fullResImage}`)
        // ------------------------------------SCALING------------------------------------------
        let scaleX = fullResImage.width / image.width;
        let scaleY = fullResImage.height / image.height;

        let scaledWidth = width * scaleX;
        let scaledHeight = height * scaleY;

        let scaledTop = top * scaleY;
        let scaledLeft = left * scaleX;

        // ------------------------------------SCALING------------------------------------------

        let cropImage = new ImageData(Math.floor(scaledWidth), Math.floor(scaledHeight));

        let index = 0;

        let imageWidth = Math.floor(fullResImage.width);

        for (let i = Math.floor(scaledTop); i < Math.floor(scaledTop) + Math.floor(scaledHeight); i++) {

            for (let j = Math.floor(scaledLeft); j < Math.floor(scaledLeft) + Math.floor(scaledWidth); j++) {

                let index2 = (i * imageWidth + j) * 4;
                cropImage.data[index] = fullResImage.data[index2];
                cropImage.data[index + 1] = fullResImage.data[index2 + 1];
                cropImage.data[index + 2] = fullResImage.data[index2 + 2];
                cropImage.data[index + 3] = fullResImage.data[index2 + 3];

                index += 4;
            }

        }
        props.globalState.imageHelper.fullResImageData = cropImage;
        history.push("/");
    }

    console.log(props)
    let { isImageLoaded, selectionInfo } = props;
    console.log("rerendered")

    return <div>

        {!isImageLoaded && <div className="alert alert-danger">
            Select image First to start editing
        </div>}

        {selectionInfo?.selectionEnabled && <div className="alert alert-danger">
            this feature does not support editing with selection
        </div>}

        <div className="text-center"><button onClick={confirmCrop} className="btn btn-primary">confirm</button></div>
        <div ref={cropRectRef} style={{ position: "absolute" }}></div>
    </div>;
}

const mapStateToProps = (state: RootState) => {
    console.log(state);
    return { ...state };
}


export default connect(mapStateToProps)(Crop);