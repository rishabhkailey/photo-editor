import React, {Component} from "react";
import {Router, Switch, Route} from "react-router-dom";
import history from './../../history.js';

import AdjustmentInteractoins from "./../AdjustmentInteractions/AdjustmentInteractions.jsx";
import Crop from "./../Crop/Crop.jsx";
import Rotate from "./../Rotate/Rotate.jsx";
import Select from "./../Select/Select.jsx";

class FeaturesInteractions extends Component {
    render() {
        let globalState = this.props;
        return <div>
            <Router history={history}>
                <Switch>
                    <Route exact={true} path="/" render={()=> <div></div>}/>
                    <Route path="/adjustments" render={()=> <AdjustmentInteractoins {...globalState} />}/>
                    <Route path="/crop" render={()=> <Crop {...globalState} /> }/>
                    <Route path="/select" render={()=> <Select {...globalState} />} />
                    <Route path="/rotate" render={()=> <Rotate {...globalState} /> }/>
                </Switch>
            </Router>
        </div>
    }
}

export default FeaturesInteractions;