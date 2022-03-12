import React from "react";
import { connect } from "react-redux";
import { setSelectionInfo } from "../../redux/actions";
import { RootState } from "../../redux/store";
import { GlobalState } from "../../type";

let nearBy = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]]

let count = 0
let total = 0


type Point = {
    x: number,
    y: number
}

type shapeData = {
    shape: "rectangle" | "circle" | "edge",
    coordinates: {
        smallX: number,
        smallY: number,
        largeX: number,
        largeY: number
    }
}

type props = Partial<RootState> & {
    globalState: GlobalState,
    setSelectionInfo: any
}

function Select(props: props) {

    const [selectMode, setSelectMode] = React.useState("+")
    const [isImageLoaded, setIsImageLoaded] = React.useState(false)

    let selectionEnabled = false; // if anything selected yet
    let selectionMapping: Array<Array<boolean>> = [];
    let lastShape: (shapeData | null) = null;
    let edgePoints = [];
    let drawShapeFunction: any = null;
    let startPosition: Point = { x: 0, y: 0 };
    let prevPosition: (Point | null) = null;
    let editedImage: any = null;

    function drawRectangle (e: any) {

        let position: Point = { x: e.clientX, y: e.clientY };
        let image = editedImage;
        let data = image.data;
        console.log(props);
        let boundingRect = props.globalState.canvasRef.current.getBoundingClientRect();

        if (position.x < boundingRect.left) {
            position.x = boundingRect.left;
        }
        else if (position.x > boundingRect.right) {
            position.x = boundingRect.right;
        }

        if (position.y < boundingRect.top) {
            position.y = boundingRect.top;
        }
        else if (position.y > boundingRect.bottom) {
            position.y = boundingRect.bottom;
        }

        let x1 = startPosition.x - boundingRect.left;
        let y1 = startPosition.y - boundingRect.top;

        let x2 = position.x - boundingRect.left;
        let y2 = position.y - boundingRect.top;

        // console.log(x1, y1);
        // console.log(x2, y2);

        let smallX, largeX, largeY, smallY;
        if (x1 < x2) {
            smallX = Math.floor(x1);
            largeX = Math.floor(x2);
        }
        else {
            smallX = Math.floor(x2);
            largeX = Math.floor(x1);
        }

        if (y1 < y2) {
            largeY = Math.floor(y2);
            smallY = Math.floor(y1);
        }
        else {
            largeY = Math.floor(y1);
            smallY = Math.floor(y2);
        }

        // console.log(smallX, smallY, largeX, largeY);

        // console.log(selectionMapping.length, selectionMapping[0].length);

        // console.log(selectMode === "+");

        for (let i = 0; i < selectionMapping.length; i++) {
            for (let j = 0; j < selectionMapping[i].length; j++) {

                let isInside = false;
                if (i >= smallY && i <= largeY && j >= smallX && j <= largeX) {
                    isInside = true;
                }

                if (isInside) {
                    data[(i * image.width + j) * 4 + 3] = selectMode === "+" ? 255 : 127;
                }
                else {
                    data[(i * image.width + j) * 4 + 3] = selectionMapping[i][j] ? 255 : 127;
                }
            }
        }
        // console.log(image, image.width);
        props.canvasFunctions.setDisplayImage(image);
        lastShape = { shape: "rectangle", coordinates: { smallX, smallY, largeX, largeY } }
        prevPosition = position;
    }

    function updateselectionMapping () {
        if (!props.isImageLoaded)
            return;

        if (lastShape) {
            switch (lastShape.shape) {
                case "rectangle":
                    {
                        console.log("updating select mapping rectangle")
                        let smallX = lastShape.coordinates?.smallX
                        let smallY = lastShape.coordinates?.smallY
                        let largeX = lastShape.coordinates?.largeX
                        let largeY = lastShape.coordinates?.largeY
                        
                        // let { smallX, smallY, largeX, largeY } = lastShape.coordinates;

                        for (let i = smallX; i <= largeX; i++) {
                            for (let j = smallY; j <= largeY; j++) {
                                selectionMapping[j][i] = selectMode === "+";
                            }
                        }
                        break;
                    }
                case "circle":
                    {
                        const isInsideCircle = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {

                            // center 
                            let a = (x1 + x2) / 2;
                            let b = (y1 + y2) / 2;

                            let radiusSquare = Math.pow(x1 - a, 2) + Math.pow(y1 - b, 2);

                            return Math.pow(x - a, 2) + Math.pow(y - b, 2) <= radiusSquare;

                        }

                        let { smallX: x1, smallY: y1, largeX: x2, largeY: y2 } = lastShape.coordinates;

                        for (let i = 0; i < selectionMapping.length; i++) {
                            for (let j = 0; j < selectionMapping[i].length; j++) {

                                if (isInsideCircle(i, j, x1, y1, x2, y2)) {
                                    selectionMapping[j][i] = selectMode === "+";
                                }
                            }
                        }
                        break;
                    }
                case "edge":
                    {
                        applyEgdeDetectionLogic()
                    }

            }

        }
        prevPosition = null;
        selectionEnabled = true;
        props.setSelectionInfo({ selectionEnabled: true, selectionMapping: selectionMapping, fullResSelectionMapping: null })
    }


    // static getDerivedStateFromProps(props) {
    //     if (props.isImageLoaded) {
    //         return { isImageLoaded: true }
    //     }
    //     return null;
    // }

    function startTracking(e: any) {
        console.log("start tracking");
        let startPosition: Point = { x: e.clientX, y: e.clientY };
        window.onmousemove = (e: any) => { drawShapeFunction(e) };
        window.onmouseup = disableTracking;
        window.onblur = disableTracking;
        count = 0;
        total = 0;
    }

    function rectangleSelection() {
        let canvas = props.globalState.canvasRef.current;

        drawShapeFunction = drawRectangle;

        canvas.onmousedown = startTracking;
    }
    // circle -----------------------------------------------------------------------------------------------------------
    function drawCircle(e: any) {

        let position = { x: e.clientX, y: e.clientY };
        let image = editedImage;
        let data = image.data;
        console.log(props);
        let boundingRect = props.globalState.canvasRef.current.getBoundingClientRect();

        if (position.x < boundingRect.left) {
            position.x = boundingRect.left;
        }
        else if (position.x > boundingRect.right) {
            position.x = boundingRect.right;
        }

        if (position.y < boundingRect.top) {
            position.y = boundingRect.top;
        }
        else if (position.y > boundingRect.bottom) {
            position.y = boundingRect.bottom;
        }

        // start position is set by onMouseDown event
        // x1, y1, x2, y2 are relative postions to the canvas
        let x1 = startPosition.x - boundingRect.left;
        let y1 = startPosition.y - boundingRect.top;

        let x2 = position.x - boundingRect.left;
        let y2 = position.y - boundingRect.top;

        // console.log(x1, y1);
        // console.log(x2, y2);

        let smallX, largeX, largeY, smallY;
        if (x1 < x2) {
            smallX = Math.floor(x1);
            largeX = Math.floor(x2);
        }
        else {
            smallX = Math.floor(x2);
            largeX = Math.floor(x1);
        }

        if (y1 < y2) {
            largeY = Math.floor(y2);
            smallY = Math.floor(y1);
        }
        else {
            largeY = Math.floor(y1);
            smallY = Math.floor(y2);
        }

        // console.log(smallX, smallY, largeX, largeY);

        // console.log(selectionMapping.length, selectionMapping[0].length);

        // console.log(selectMode === "+");

        function isInsideCircle(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {

            // center 
            let a = (x1 + x2) / 2;
            let b = (y1 + y2) / 2;

            let radiusSquare = Math.pow(x1 - a, 2) + Math.pow(y1 - b, 2);

            return Math.pow(x - a, 2) + Math.pow(y - b, 2) <= radiusSquare;

        }

        for (let i = 0; i < selectionMapping.length; i++) {
            for (let j = 0; j < selectionMapping[i].length; j++) {

                let isInside = false;
                if (isInsideCircle(j, i, x1, y1, x2, y2)) {
                    isInside = true;
                }

                if (isInside) {
                    data[(i * image.width + j) * 4 + 3] = selectMode === "+" ? 255 : 127;
                }
                else {
                    data[(i * image.width + j) * 4 + 3] = selectionMapping[i][j] ? 255 : 127;
                }
            }
        }
        // console.log(image, image.width);
        props.canvasFunctions.setDisplayImage(image);
        lastShape = { shape: "circle", coordinates: { smallX, smallY, largeX, largeY } }
        prevPosition = position;
    }

    function circleSelection () {
        let canvas = props.globalState.canvasRef.current;

        drawShapeFunction = drawCircle;

        canvas.onmousedown = startTracking;
    }
    // circle-end ---------------------------------------------------------------------------------------------------------

    // edge-------------------------------------------------------------------------------------------------------
    function drawEgde (e: any) {

        let position = { x: e.clientX, y: e.clientY };
        let image = props.canvasFunctions.getDisplayImage();
        let data = image.data;
        let boundingRect = props.globalState.canvasRef.current.getBoundingClientRect();

        if (position.x < boundingRect.left) {
            position.x = boundingRect.left;
        }
        else if (position.x > boundingRect.right) {
            position.x = boundingRect.right;
        }

        if (position.y < boundingRect.top) {
            position.y = boundingRect.top;
        }
        else if (position.y > boundingRect.bottom) {
            position.y = boundingRect.bottom;
        }

        // x1, y1, x2, y2 are relative postions to the canvas
        if (!prevPosition) {
            prevPosition = Object.assign({}, position)
        }
        let x1 = prevPosition.x - boundingRect.left;
        let y1 = prevPosition.y - boundingRect.top;

        let x2 = position.x - boundingRect.left;
        let y2 = position.y - boundingRect.top;

        x1 = Math.floor(x1)
        y1 = Math.floor(y1)
        x2 = Math.floor(x2)
        y2 = Math.floor(y2)

        edgePoints.push({ x: x2, y: y2 });

        while (x1 !== x2 || y1 !== y2) {
            data[(y1 * image.width + x1) * 4] = 255;

            if (x1 < x2) {
                x1++;
            }
            else if (x1 > x2) {
                x1--;
            }

            if (y1 < y2) {
                y1++;
            }
            else if (y1 > y2) {
                y1--;
            }
        }

        console.log(image, image.width);
        props.canvasFunctions.setDisplayImage(image);
        lastShape = { shape: "edge", coordinates: {smallX: 0, smallY: 0, largeX: 0, largeY: 0}}
        prevPosition = position;
    }

    function edgeSelection()  {
        let canvas = props.globalState.canvasRef.current;

        drawShapeFunction = drawEgde;

        canvas.onmousedown = startTracking;
    }
    function applyEgdeDetectionLogic() {
        return 
        // check this 
        // let edgePoints = new Set(edgePoints);
        // let selectionMapping = selectionMapping;
        // let visited = generateArray(selectionMapping.length, selectionMapping[0].length, false);

        // console.log(edgePoints);
        // edgePoints.forEach(({ x, y }) => {


        //     if (y >= visited.length || y < 0 || x >= visited[y].length || y < 0 || visited[y][x] === true)
        //         return;

        //     let image = editedImage;
        //     let data = image.data;
        //     let index = (y * image.width + x) * 4;
        //     let color = data.slice(index, index + 4)

        //     if (visited[y][x] === false) {
        //         selectionMapping[y][x] = true;
        //         checkNearByPixels(x, y, visited, color);
        //     }
        // })
        // console.log(`total pixel included: ${count} \ntotal pixel checked: ${total}`)
        // props.canvasFunctions.setDisplayImage(showSelection(editedImage, selectionMapping));
    }
    function checkNearByPixels(x: number, y: number, visited: Array<Array<boolean>>, color: [number, number, number, number]) {
        if (total % 1000 === 0) {
            console.log(`${total} pixel checked`)
        }
        total++;
        if (y >= visited.length || y < 0 || x >= visited[y].length || y < 0 || visited[y][x] === true)
            return;

        // if (visited[y][x] === true)
        //     return

        visited[y][x] = true

        let image = editedImage;
        let data = image.data;
        let index = (y * image.width + x) * 4;
        let color2 = data.slice(index, index + 4)

        if (colorDiff(color, color2) < 30) {
            count++;
            selectionMapping[y][x] = true;
            nearBy.forEach(([moveX, moveY]) => {
                checkNearByPixels(x + moveX, y + moveY, visited, color);
            })
        }
        else {
            selectionMapping[y][x] = false;
        }

    }
    function colorDiff(color: [number, number, number, number], color2: [number, number, number, number]) {

        if (color.length !== 4 || color2.length !== 4)
            return 99999;

        let diff = 0
        color.forEach((value, index) => {
            diff += Math.abs(value - color2[index]);
        })

        return diff;

    }
    // edge end----------------------------------------------------------------------------
    function disableTracking() {
        updateselectionMapping();
        console.log("disabled tracking");
        window.onmousemove = null;
    }

    function resetselectionMapping() {
        selectionEnabled = false;
        let { width, height } = editedImage;
        selectionMapping = generateArray(height, width);
    }

    React.useEffect(()=>{

        setIsImageLoaded(props.isImageLoaded ? true : false)
        if (!editedImage) {
            editedImage = props.canvasFunctions.getEditedImage();
        }

        if (selectionMapping === null && props.isImageLoaded) {
            resetselectionMapping();

            // default selectiong mode
            rectangleSelection();
        }
        console.log(selectionEnabled, props.selectionInfo?.selectionEnabled);
        if (props.selectionInfo?.selectionEnabled === false && selectionEnabled === true) {
            console.log("condition met");
            resetselectionMapping();
        }

    }, [editedImage, selectionMapping, props.isImageLoaded, props.selectionInfo?.selectionEnabled, selectionEnabled])
    // componentDidUpdate() {

        // if (!editedImage) {
        //     editedImage = props.canvasFunctions.getEditedImage();
        // }

        // if (selectionMapping === null && props.isImageLoaded) {
        //     resetselectionMapping();

        //     // default selectiong mode
        //     rectangleSelection();
        // }
        // console.log(selectionEnabled, props.selectionInfo.selectionEnabled);
        // if (props.selectionInfo.selectionEnabled === false && selectionEnabled === true) {
        //     console.log("condition met");
        //     resetselectionMapping();
        // }

    // }

    React.useEffect(()=>{
        editedImage = props.canvasFunctions.getEditedImage();

        if (selectionMapping === null && props.isImageLoaded) {
            let { width, height } = props.canvasFunctions.getEditedImage();
            selectionMapping = generateArray(height, width);


            // default selectiong mode
            rectangleSelection();
        }
    }, [])
    // componentDidMount() {

    //     editedImage = props.canvasFunctions.getEditedImage();

    //     if (selectionMapping === null && props.isImageLoaded) {
    //         let { width, height } = props.canvasFunctions.getEditedImage();
    //         selectionMapping = generateArray(height, width);


    //         // default selectiong mode
    //         rectangleSelection();
    //     }

    // }

    function generateArray(rows: number, cols: number, defaultValue = false) {
        let arr = [];
        for (let i = 0; i < rows; i++) {
            let row = []
            for (let j = 0; j < cols; j++) {
                row.push(defaultValue);
            }
            arr.push(row);
        }
        return arr;
    }

    function generateFullResSelectionMapping () {
        let { width, height } = props.canvasFunctions.getFullResEditedImage();
        let { width: width2, height: height2 } = editedImage;

        let fullResSelectionMapping = generateArray(height, width);

        let xScale = width2 / width;
        let yScale = height2 / height;

        for (let i = 0; i < fullResSelectionMapping.length; i++) {
            for (let j = 0; j < fullResSelectionMapping[i].length; j++) {

                let i2 = Math.floor(i * xScale);
                let j2 = Math.floor(j * yScale);

                if (i2 > selectionMapping.length)
                    i2 = selectionMapping.length;

                if (j2 > selectionMapping[i2].length)
                    j2 = selectionMapping[i2].length

                fullResSelectionMapping[i][j] = selectionMapping[i2][j2]
            }
        }
        return fullResSelectionMapping
    }

    // componentWillUnmount() {
    //     let canvas = globalState.canvasRef.current;
    //     canvas.onmousedown = null;
    //     window.onmousemove = null;
    //     window.onmouseup = null;
    //     window.onblur = null;

    //     props.setSelectionInfo({ selectionEnabled: true, selectionMapping: selectionMapping, fullResSelectionMapping: generateFullResSelectionMapping() })
    // }

        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            {!isImageLoaded && <div className="alert alert-danger">
                Select image First to start editing
            </div>}

            <h4>Select</h4>
            <hr />

            <div>
                <h5>select mode</h5>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }} >
                    <button
                        className={selectMode === "+" ? "btn btn-success" : "btn btn-warning"}
                        onClick={() => { setSelectMode("+") }}>

                        <h5>+</h5>

                    </button>

                    <button
                        className={selectMode === "-" ? "btn btn-success" : "btn btn-warning"}
                        onClick={() => { setSelectMode("-") }}>

                        <h4>-</h4>

                    </button>
                </div>
            </div>
            <hr />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h5>select method</h5>
                <button className="btn btn-primary" onClick={rectangleSelection}>Rectangle</button>
                <hr />
                <button className="btn btn-primary" onClick={circleSelection}>circle</button>
                <hr />
                <button className="btn btn-primary" onClick={edgeSelection}>edge detection</button>
            </div>

        </div>
}


const mapStateToProps = (state: RootState) => {
    console.log(state);
    return { ...state };
}


export default connect(
    mapStateToProps,
    { setSelectionInfo })(Select);


