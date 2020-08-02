import React, {Component} from 'react';
import history from "./../../history.js";

class FeatureButtons extends Component {
    constructor(props) {
        super(props);
        this.features = ['adjustments', 'crop', 'rotate', 'select']
    }

    handleClick = (feature)=> {
        history.push(`/${feature}`);
    }

    render() {

        let buttons = this.features.map((feature, index)=> {
            return <button key={index} className="btn btn-primary ml-5" onClick={(e)=> {this.handleClick(feature)}}>
                {feature}
            </button>
        })

        return <div className="d-flex flex-row flex-wrap">
            {buttons}
        </div>
    }
}

export default FeatureButtons;