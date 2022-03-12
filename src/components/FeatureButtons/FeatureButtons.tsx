import React from 'react';
import history from "../../history.js";
import features from "./Features.json";
import { connect } from "react-redux";
import { setShowDisableSelectionTooltip } from "../../redux/actions";
import { RootState } from '../../redux/store.js';


type props = {
    selectionEnabled: boolean,
    setShowDisableSelectionTooltip?: (arg: boolean) => void
}


function FeatureButtons(props: props) {

    function handleClick(feature: string): void {
        history.push(`/${feature}`);
    }

    function disabledButtonClickHandler(e: any): void {
        console.log(props.setShowDisableSelectionTooltip);
        props.setShowDisableSelectionTooltip?.(true);
        e.stopPropagation();
    }

    console.log(features);
    let buttons = features.map((feature, index) => {
        if (props.selectionEnabled === true && feature.supportSelectionMapping === false)
            return <span onClickCapture={disabledButtonClickHandler} className="d-inline-block" tabIndex={0} data-toggle="tooltip" title="do not support edit with selection">
                <button key={index} className="btn btn-secondary ml-5" onClick={(e) => { handleClick(feature.name) }}>
                    {feature.name}
                </button>
            </span>
        else
            return <button key={index} className="btn btn-primary ml-5" onClick={(e) => { handleClick(feature.name) }}>
                {feature.name}
            </button>
    })

    return <div className="d-flex flex-row flex-wrap">
        {buttons}
    </div>
}

const mapStateToProps = (state: RootState): props => ({
    selectionEnabled: state.selectionInfo.selectionEnabled
})


export default connect(
    mapStateToProps,
    { setShowDisableSelectionTooltip })(FeatureButtons);
