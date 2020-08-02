import React, {Component} from 'react';
import CanvasAndImage from './../CanvasAndImage/CanvasAndImage.jsx';
import FeatureButtons from './../FeatureButtons/FeatureButtons.jsx';
import FeatureInteractions from './../FeaturesInteractions/FeaturesInterations.jsx';

class App extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            canvasFunctions: null,
            isImageLoaded: false
        }
    }
    
    setGlobalState = (obj)=> {
        this.setState(obj);
    }

    render() {
        return <div className="d-flex flex-column justify-content-center align-items-stretch vw-100 vh-100">
            <div className="d-flex flex-row border" style={{flex: 3}}>
                <div className="border" style={{flex: 3}}>
                    <CanvasAndImage setGlobalState={this.setGlobalState} />
                </div>

                <div className="border" style={{flex: 1}}>
                    <FeatureInteractions isImageLoaded={this.state.isImageLoaded} canvasFunctions={this.state.canvasFunctions}/>
                </div>
            </div>
            <div className="border" style={{flex: 1}}>
                <FeatureButtons />
            </div>
        </div>
    }
}

export default App;