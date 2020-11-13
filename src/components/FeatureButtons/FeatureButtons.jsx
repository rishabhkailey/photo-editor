import React, { Component } from 'react';
import history from "./../../history.js";
import features from "./Features.json";
import { connect } from "react-redux";
import { setShowDisableSelectionTooltip } from "./../../redux/actions.js";

class FeatureButtons extends Component {
    constructor(props) {
        super(props);
    }

    handleClick = (feature) => {
        history.push(`/${feature}`);
    }

    disabledButtonClickHandler = (e) => {
        console.log(this.props.setShowDisableSelectionTooltip);
        this.props.setShowDisableSelectionTooltip(true);
        e.stopPropagation();
    }

    render() {
        console.log(features);
        let buttons = features.map((feature, index) => {
            if (this.props.selectionEnabled === true && feature.supportSelectionMapping === false)
                return <span onClickCapture={this.disabledButtonClickHandler} class="d-inline-block" tabindex="0" data-toggle="tooltip" title="do not support edit with selection">
                    <button key={index} className="btn btn-secondary ml-5" onClick={(e) => { this.handleClick(feature.name) }}>
                        {feature.name}
                    </button>
                </span>
            else
                return <button key={index} className="btn btn-primary ml-5" onClick={(e) => { this.handleClick(feature.name) }}>
                    {feature.name}
                </button>
        })

        return <div className="d-flex flex-row flex-wrap">
            {buttons}
        </div>
    }
}

const mapStateToProps = state => ({
    selectionEnabled: state.selectionInfo.selectionEnabled
})


export default connect(
    mapStateToProps,
    { setShowDisableSelectionTooltip })(FeatureButtons);
