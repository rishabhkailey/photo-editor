import React, {Component} from "react";

class Select extends Component {

    // enableSelection = ()=> {
    //     let {canvasFunctions, canvasElements} = this.props;
    //     let canvas = canvasElements.canvas.current;
        
    // }

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

        for(let i=smallX; i<largeX; i++) {
            for(let j=smallY; j<largeY; j++) {
                data[(j*image.width + i)*4 + 3] = 127;
            }
        }

        // console.log(image, image.width);
        this.props.canvasFunctions.setDisplayImage(image);
        
        this.prevPosition = position;
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
        console.log("disabled tracking");
        window.onmousemove = null;
    }

    render() {
        return <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h4>Select</h4>
            <hr />

            <button className="btn btn-primary" onClick={this.rectangleSelection}>Rectangle</button> 

        </div>
    }
}

export default Select;