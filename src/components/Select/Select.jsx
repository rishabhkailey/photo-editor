import React, {Component} from "react";

class Select extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectMode: "+", 
            isImageLoaded: false
        }
        this.selectMapping = null;
        this.lastShape = null;
    }

    drawShapeFunction = null;
    startPosition = {x: 0, y: 0};
    prevPosition = {x: 0, y: 0};

    drawRectangle = (e)=> {

        let position = {x: e.clientX, y: e.clientY};
        let image = this.props.canvasFunctions.getEditedImage();
        let data = image.data;
        let boundingRect = this.props.canvasElements.canvas.current.getBoundingClientRect();

        if(position.x < boundingRect.left) {
            position.x = boundingRect.left;
        }
        else if(position.x > boundingRect.right) {
            position.x = boundingRect.right;
        }

        if(position.y < boundingRect.top) {
            position.y = boundingRect.top;
        }
        else if(position.y > boundingRect.bottom) {
            position.y = boundingRect.bottom;
        }

        let x1 = this.startPosition.x - boundingRect.left;
        let y1 = this.startPosition.y - boundingRect.top;

        let x2 = position.x - boundingRect.left;
        let y2 = position.y - boundingRect.top;

        // console.log(x1, y1);
        // console.log(x2, y2);

        let smallX, largeX, largeY, smallY;
        if(x1 < x2) {
            smallX = parseInt(x1);
            largeX = parseInt(x2);
        }
        else {
            smallX = parseInt(x2);
            largeX = parseInt(x1);
        }

        if(y1 < y2) {
            largeY = parseInt(y2);
            smallY = parseInt(y1);
        }
        else {
            largeY = parseInt(y1);
            smallY = parseInt(y2);
        }

        console.log(smallX, smallY, largeX, largeY);

        console.log(this.selectMapping.length, this.selectMapping[0].length);

        console.log(this.state.selectMode === "+");

        for(let i=0; i<this.selectMapping.length; i++) {
            for(let j=0; j<this.selectMapping[i].length; j++) {

                let isInside = false;
                if(i >= smallY && i <= largeY && j > smallX && j <= largeX) {
                    isInside = true;
                }
                
                if(isInside) {   
                    data[(i*image.width + j)*4 + 3] = this.state.selectMode === "+" ? 255: 127;
                }
                else {
                    data[(i*image.width + j)*4 + 3] = this.selectMapping[i][j] ? 255: 127;
                }
            }
        }
        // console.log(image, image.width);
        this.props.canvasFunctions.setDisplayImage(image);
        this.lastShape = {shape: "rectangle", coordinates: {smallX, smallY, largeX, largeY}}
        this.prevPosition = position;
    }

    updateSelectMapping = ()=> {
        if(this.lastShape.shape === "rectangle") {
            console.log("updating select mapping rectangle")
            let {smallX, smallY, largeX, largeY} = this.lastShape.coordinates;
            let count = 0;
            let count0 = 0;
            for(let i=0; i<this.selectMapping.length; i++) {
                for(let j=0; j<this.selectMapping[i].length; j++) {
                    if(this.selectMapping[i][j])
                        count0++;
                }
            }
            for(let i=smallX; i<largeX; i++) {
                for(let j=smallY; j<largeY; j++) {
                    count++;
                    this.selectMapping[j][i] = this.state.selectMode === "+";
                }
            }
            let count1 = 0;
            for(let i=0; i<this.selectMapping.length; i++) {
                for(let j=0; j<this.selectMapping[i].length; j++) {
                    if(this.selectMapping[i][j])
                        count1++;
                }
            }
            console.log(count, count0, count1)
            console.log(this.lastShape.coordinates);
        }
    }

    static getDerivedStateFromProps(props) {
        if(props.isImageLoaded) {
            return {isImageLoaded: true}
        }
        return null;
    }

    startTracking = (e)=> {
        console.log("start tracking");
        this.startPosition = {x: e.clientX, y: e.clientY};
        window.onmousemove = (e)=> { this.drawShapeFunction(e) };
    }

    rectangleSelection = ()=> {
        let {canvasFunctions, canvasElements} = this.props;
        let canvas = canvasElements.canvas.current;
        
        this.drawShapeFunction = this.drawRectangle;

        canvas.onmousedown = this.startTracking;

        window.onmouseup = this.disableTracking;
        window.onblur = this.disableTracking;
    }

    disableTracking = ()=> {
        this.updateSelectMapping();
        console.log("disabled tracking");
        window.onmousemove = null;
    }

    
    componentDidUpdate() {
        if(this.selectMapping === null && this.props.isImageLoaded) {
            let {width, height} = this.props.canvasFunctions.getEditedImage();
            // this.selectMapping = Array(height).fill(Array(width).fill(false));
            this.selectMapping = this.generateArray(height, width);
        }
    }
    
    componentDidMount() {
        if(this.selectMapping === null && this.props.isImageLoaded) {
            let {width, height} = this.props.canvasFunctions.getEditedImage();
            this.selectMapping = this.generateArray(height, width);

        }
    }

    generateArray(rows, cols) {
        let arr = [];
        for(let i=0; i<rows; i++) {
            let row = []
            for(let j=0; j<cols; j++) {
                row.push(false);
            }
            arr.push(row);
        }
        return arr;
    }

    render() {
        let {selectMode, isImageLoaded} = this.state;
        console.log(isImageLoaded);
        return <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>

            {!isImageLoaded && <div className="alert alert-danger">
                Select image First to start editing
            </div>}

            <h4>Select</h4>
            <hr />

            <div>
                <h5>select mode</h5>
                <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around"}} >
                    <button 
                        className={selectMode === "+" ? "btn btn-success": "btn btn-warning"}
                        onClick={() => {this.setState({selectMode: "+"})}}>
                        
                        <h5>+</h5>
                    
                    </button>

                    <button 
                        className={selectMode === "-" ? "btn btn-success": "btn btn-warning"}
                        onClick={() => {this.setState({selectMode: "-"})}}>
                        
                        <h4>-</h4>

                    </button>
                </div>
            </div>
            <hr />

            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <h5>select shape</h5>
                <button className="btn btn-primary" onClick={this.rectangleSelection}>Rectangle</button> 
            </div>

        </div>
    }
}

export default Select;