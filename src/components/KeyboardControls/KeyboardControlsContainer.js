/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import * as mapActions from "actions/mapActions";
import * as mapActionsCore from "_core/actions/mapActions";
import * as dateSliderActions from "_core/actions/dateSliderActions";
import appConfig from "constants/appConfig";
import * as appStrings from "_core/constants/appStrings";
import KeyHandler, { KEYUP, KEYDOWN } from "react-key-handler";
import displayStyles from "_core/styles/display.scss";
import { KeyboardControlsContainer as KeyboardControlsContainerCore } from "_core/components/KeyboardControls/KeyboardControlsContainer.js";

export class KeyboardControlsContainer extends KeyboardControlsContainerCore {
    handleKeyUp_Escape() {
        KeyboardControlsContainerCore.prototype.handleKeyUp_Escape.call(this);

        if (this.props.isAreaSelectionEnabled) {
            this.props.disableAreaSelection();
        }
    }
}

KeyboardControlsContainer.propTypes = {
    maps: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    dateSliderActions: PropTypes.object.isRequired,
    isDrawingEnabled: PropTypes.bool.isRequired,
    isMeasuringEnabled: PropTypes.bool.isRequired,
    isAreaSelectionEnabled: PropTypes.bool.isRequired,
    dateSliderTimeResolution: PropTypes.object.isRequired,
    disableAreaSelection: PropTypes.func.isRequired,
    date: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        maps: state.map.get("maps"),
        date: state.map.get("date"),
        dateSliderTimeResolution: state.dateSlider.get("resolution"),
        isDrawingEnabled: state.map.getIn(["drawing", "isDrawingEnabled"]),
        isMeasuringEnabled: state.map.getIn(["measuring", "isMeasuringEnabled"]),
        isAreaSelectionEnabled: state.map.getIn(["areaSelection", "isAreaSelectionEnabled"])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActionsCore, dispatch),
        dateSliderActions: bindActionCreators(dateSliderActions, dispatch),
        disableAreaSelection: bindActionCreators(mapActions.disableAreaSelection, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(KeyboardControlsContainer);
