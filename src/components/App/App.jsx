import React, {Component} from 'react';
import CanvasAndImage from './../CanvasAndImage/CanvasAndImage.jsx';
import FeatureButtons from './../FeatureButtons/FeatureButtons.jsx';
import FeatureInteractions from './../FeaturesInteractions/FeaturesInterations.jsx';

class App extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            canvasFunctions: null,
            isImageLoaded: false,
            canvasElements: null
        }
    }
    
    setGlobalState = (obj)=> {
        this.setState(obj);
    }

    render() {
        // state properties which we want to send to all feature interaction components
        // for now = state of global component
        let globalState = this.state;

        return <div className="d-flex flex-column justify-content-center align-items-stretch vw-100 vh-100">
            <div className="d-flex flex-row border" style={{flex: 3}}>
                <div className="border" style={{flex: 3}}>
                    <CanvasAndImage setGlobalState={this.setGlobalState} />
                </div>

                <div className="border" style={{flex: 1}}>
                    <FeatureInteractions {...globalState} />
                </div>
            </div>
            <div className="border" style={{flex: 1}}>
                <FeatureButtons />
            </div>
        </div>
    }
}

export default App;