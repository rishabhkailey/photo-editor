import React, { Component } from "react";
import { Router, Switch, Route } from "react-router-dom";
import { connect } from "react-redux";
import history from './../../history.js';

import AdjustmentInteractoins from "./../AdjustmentInteractions/AdjustmentInteractions.jsx";
import Crop from "./../Crop/Crop.jsx";
import Rotate from "./../Rotate/Rotate.jsx";
import Select from "./../Select/Select.jsx";

class FeaturesInteractions extends Component {
    render() {
        return <div>
            <Router history={history}>
                <Switch>
                    <Route exact={true} path="/" render={() => <div></div>} />
                    <Route path="/adjustments" render={() => <AdjustmentInteractoins />} />
                    <Route path="/crop" render={() => <Crop />} />
                    <Route path="/select" render={() => <Select />} />
                    <Route path="/rotate" render={() => <Rotate />} />
                </Switch>
            </Router>
        </div>
    }
}


const mapStateToProps = state => {
    return { ...state };
}


export default connect(mapStateToProps)(FeaturesInteractions);