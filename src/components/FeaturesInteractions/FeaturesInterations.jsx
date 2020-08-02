import React, {Component} from "react";
import {Router, Switch, Route} from "react-router-dom";
import history from './../../history.js';

import AdjustmentInteractoins from "./../AdjustmentInteractions/AdjustmentInteractions.jsx";

class FeaturesInteractions extends Component {
    render() {
        return <div>
            <Router history={history}>
                <Switch>
                    <Route exact={true} path="/" render={()=> <div></div>}/>
                    <Route path="/adjustments" render={()=> <AdjustmentInteractoins isImageLoaded={this.props.isImageLoaded} canvasFunctions={this.props.canvasFunctions} />}/>
                    <Route path="/crop" render={()=> <div>crop</div>}/>
                    <Route path="/select" render={()=> <div>select</div>}/>
                    <Route path="/rotate" render={()=> <div>rotate</div>}/>
                </Switch>
            </Router>
        </div>
    }
}

export default FeaturesInteractions;