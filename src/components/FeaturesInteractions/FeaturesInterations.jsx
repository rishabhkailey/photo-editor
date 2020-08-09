import React, {Component} from "react";
import {Router, Switch, Route} from "react-router-dom";
import history from './../../history.js';

import AdjustmentInteractoins from "./../AdjustmentInteractions/AdjustmentInteractions.jsx";
import Crop from "./../Crop/Crop.jsx";

class FeaturesInteractions extends Component {
    render() {
        let globalState = this.props;
        return <div>
            <Router history={history}>
                <Switch>
                    <Route exact={true} path="/" render={()=> <div></div>}/>
                    <Route path="/adjustments" render={()=> <AdjustmentInteractoins {...globalState} />}/>
                    <Route path="/crop" render={()=> <Crop {...globalState} /> }/>
                    <Route path="/select" render={()=> <div>select</div>}/>
                    <Route path="/rotate" render={()=> <div>rotate</div>}/>
                </Switch>
            </Router>
        </div>
    }
}

export default FeaturesInteractions;