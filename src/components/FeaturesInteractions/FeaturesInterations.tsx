import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import { connect } from "react-redux";
import history from '../../history.js';

import AdjustmentInteractoins from "../AdjustmentInteractions/AdjustmentInteractions";
import Crop from "../Crop/Crop";
import Rotate from "../Rotate/Rotate";
import Select from "../Select/Select";
import { GlobalState } from "../../type.js";
import { RootState } from "../../redux/store.js";

interface props {
    globalState: GlobalState
}

function FeaturesInteractions(props: props) {
    console.log(props.globalState)
    return <div>
        <Router history={history}>
            <Switch>
                <Route exact={true} path="/" render={() => <div></div>} />
                <Route path="/adjustments" render={() => <AdjustmentInteractoins globalState={props.globalState} />} />
                <Route path="/crop" render={() => <Crop globalState={props.globalState} />} />
                {/* <Route path="/select" render={() => <Select globalState={props.globalState} />} /> */}
                <Route path="/rotate" render={() => <Rotate globalState={props.globalState} />} /> 
            </Switch>
        </Router>
    </div>
}


const mapStateToProps = (state: RootState) => {
    return { ...state };
}


export default connect(mapStateToProps)(FeaturesInteractions);