/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Tooltip from "@material-ui/core/Tooltip";
import PlusIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import HomeIcon from "@material-ui/icons/Home";
import Paper from "@material-ui/core/Paper";
import * as appActions from "actions/appActions";
import * as appActionsCore from "_core/actions/appActions";
import * as mapActions from "_core/actions/mapActions";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import { MapButton } from "_core/components/Reusables";
import {
    BasemapPicker,
    MapToolsButton,
    ExtraToolsButton,
    ReferenceLayerPicker
} from "components/Map";
import { HelpControl } from "components/Help";
import { ShareControl } from "components/Share";
import stylesCore from "_core/components/Map/MapControlsContainer.scss";
import styles from "components/Map/MapControlsContainer.scss";
import displayStyles from "_core/styles/display.scss";

export class MapControlsContainer extends Component {
    componentDidMount() {
        this.hideMapControlsTimeout = null;
        this.mouseMovementTimeThreshold = 2000;
        this.hideMapControlsEnabled = false;
        this._isInDistractionFreeMode = false;
    }
    componentWillUpdate(nextProps, nextState) {
        // If we're not going to be in distractionFreeMode we can stop everything
        if (!nextProps.distractionFreeMode) {
            this.stopListeningToMouseMovement();
            this._isInDistractionFreeMode = false;
        } else if (!this.props.distractionFreeMode && nextProps.distractionFreeMode) {
            // If we are transitioning to distractionFreeMode
            this._isInDistractionFreeMode = true;
        }
    }
    startListeningToMouseMovement() {
        this.hideMapControlsTimeout = setTimeout(() => {
            this.hideMapControls();
        }, this.mouseMovementTimeThreshold);
        window.onmousemove = () => {
            // Clear the timeout
            clearTimeout(this.hideMapControlsTimeout);
            this.hideMapControlsTimeout = null;
            this.hideMapControlsEnabled = false;
            this.startListeningToMouseMovement();
            this.props.appActionsCore.hideMapControls(false);
        };
    }
    stopListeningToMouseMovement() {
        clearTimeout(this.hideMapControlsTimeout);
        this.hideMapControlsTimeout = null;
        this.hideMapControlsEnabled = false;
        window.onmousemove = null;
        this.props.appActionsCore.hideMapControls(false);
    }
    hideMapControls() {
        if (!this.hideMapControlsEnabled) {
            this.hideMapControlsEnabled = true;
            this.hideMapControlsTimeout = null;
            this.props.appActionsCore.hideMapControls(true);
        }
    }
    onMapControlsMouseEnter() {
        if (this.props.distractionFreeMode) {
            this.stopListeningToMouseMovement();
        }
    }
    onMapControlsMouseLeave() {
        if (this.props.distractionFreeMode) {
            this.startListeningToMouseMovement();
        }
    }
    setViewMode() {
        if (this.props.in3DMode) {
            this.props.mapActions.setMapViewMode(appStrings.MAP_VIEW_MODE_2D);
        } else {
            this.props.mapActions.setMapViewMode(appStrings.MAP_VIEW_MODE_3D);
        }
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [displayStyles.hiddenFadeOut]:
                this.props.mapControlsHidden && this.props.distractionFreeMode,
            [displayStyles.hiddenFadeIn]:
                !this.props.mapControlsHidden && this.props.distractionFreeMode,
            [this.props.className]: typeof this.props.className !== "undefined"
            // [stylesCore.mapControlsContainer]: true
        });
        return (
            <div
                className={containerClasses}
                onMouseLeave={() => this.onMapControlsMouseLeave()}
                onMouseEnter={() => this.onMapControlsMouseEnter()}
            >
                <Paper elevation={2} className={stylesCore.buttonGroup}>
                    <HelpControl className={stylesCore.lineButton} />
                    <ShareControl className={stylesCore.lineButton} />
                </Paper>
                <Paper elevation={2} className={stylesCore.buttonGroup}>
                    <MapToolsButton
                        isOpen={this.props.mapControlsToolsOpen}
                        className={stylesCore.lineButton}
                        setOpen={isOpen =>
                            this.props.appActionsCore.setMapControlsToolsOpen(isOpen)
                        }
                    />
                    <ExtraToolsButton
                        isOpen={this.props.extraToolsOpen}
                        className={stylesCore.lineButton}
                        setOpen={isOpen => this.props.appActions.setExtraToolsOpen(isOpen)}
                    />
                </Paper>
                <Paper elevation={2} className={stylesCore.buttonGroup}>
                    <BasemapPicker className={styles.basemapPicker} />
                    <ReferenceLayerPicker />
                </Paper>
                <Paper elevation={2} className={stylesCore.buttonGroup}>
                    <Tooltip disableFocusListener={true} title="Home" placement="right">
                        <MapButton
                            onClick={() => {
                                this.props.mapActions.setMapView(
                                    { extent: appConfig.DEFAULT_BBOX_EXTENT },
                                    true
                                );
                            }}
                            aria-label="Home"
                            className={`${stylesCore.firstButton} ${stylesCore.lineButton}`}
                        >
                            <HomeIcon />
                        </MapButton>
                    </Tooltip>
                    <Tooltip disableFocusListener={true} title="Zoom In" placement="right">
                        <MapButton
                            onClick={this.props.mapActions.zoomIn}
                            aria-label="Zoom in"
                            className={stylesCore.lineButton}
                        >
                            <PlusIcon />
                        </MapButton>
                    </Tooltip>
                    <Tooltip disableFocusListener={true} title="Zoom Out" placement="right">
                        <MapButton
                            onClick={this.props.mapActions.zoomOut}
                            aria-label="Zoom out"
                            className={stylesCore.lastButton}
                        >
                            <RemoveIcon />
                        </MapButton>
                    </Tooltip>
                </Paper>
            </div>
        );
    }
}

MapControlsContainer.propTypes = {
    in3DMode: PropTypes.bool.isRequired,
    distractionFreeMode: PropTypes.bool.isRequired,
    mapControlsHidden: PropTypes.bool.isRequired,
    mapControlsToolsOpen: PropTypes.bool.isRequired,
    extraToolsOpen: PropTypes.bool.isRequired,
    mapActions: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    appActionsCore: PropTypes.object.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        in3DMode: state.map.getIn(["view", "in3DMode"]),
        distractionFreeMode: state.view.get("distractionFreeMode"),
        mapControlsToolsOpen: state.view.get("mapControlsToolsOpen"),
        extraToolsOpen: state.view.get("extraToolsOpen"),
        mapControlsHidden: state.view.get("mapControlsHidden")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
        appActionsCore: bindActionCreators(appActionsCore, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MapControlsContainer);
