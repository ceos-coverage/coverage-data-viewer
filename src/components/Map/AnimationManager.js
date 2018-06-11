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
import * as mapActions from "_core/actions/mapActions";
import * as appActions from "_core/actions/appActions";
import * as appStrings from "_core/constants/appStrings";
import displayStyles from "_core/styles/display.scss";

export class BasemapPicker extends Component {
    constructor(props) {
        super(props);

        // use instance var to control the animation loop without
        // having to involve state unnecessarily
        this.animationLoopInterval = null;
        this.tileLoadBatchDelay = null;
    }

    shouldComponentUpdate(nextProps) {
        // check the initial buffer has loaded and we should being the animation loop
        if (
            nextProps.animation.get("initiated") &&
            nextProps.animation.get("isPlaying") &&
            nextProps.animation.get("initialBufferLoaded") &&
            !this.props.animation.get("initialBufferLoaded")
        ) {
            // begin loop with a reset
            this.beginAnimationLoop(true);
        }

        return (
            nextProps.animation.get("startDate") !== this.props.animation.get("startDate") ||
            nextProps.animation.get("endDate") !== this.props.animation.get("endDate")
        );
        // return nextProps.animation !== this.props.animation;
    }

    handleStepFrame() {
        window.requestAnimationFrame(() => {
            if (this.props.animation.get("isPlaying")) {
                this.stepFrame(true);
            }
            this.handleAnimationLoop();
        });
    }

    handleAnimationLoop() {
        // clear the timeout so we do not have two animations running at once
        if (this.animationLoopInterval !== null) {
            clearTimeout(this.animationLoopInterval);
        }

        // check that we are playing
        if (this.props.animation.get("isPlaying") && this.props.animation.get("nextFrameLoaded")) {
            // check if we are at the end of the loop
            let stepSize = this.props.animation.get("stepSize").split("/");
            if (
                moment
                    .utc(this.props.date)
                    .add(stepSize[0], stepSize[1])
                    .isAfter(moment.utc(this.props.animation.get("endDate")))
            ) {
                // give a 1 sec pause at the end of the animation loop
                this.animationLoopInterval = setTimeout(() => {
                    // step forward
                    this.handleStepFrame();
                }, Math.max(1000, this.props.animation.get("speed")));
            } else {
                // set the loop again dynamically to catch speed changes
                this.animationLoopInterval = setTimeout(() => {
                    // step forward
                    this.handleStepFrame();
                }, this.props.animation.get("speed"));
            }
        } else {
            // check the next frame again in 1 sec
            this.animationLoopInterval = setTimeout(() => this.handleAnimationLoop(), 1000);
        }
    }

    beginAnimationLoop(forceReset = false) {
        // reset the loop if requested
        if (forceReset) {
            this.endAnimationLoop();
        }

        // verify the loop is not already running
        if (this.animationLoopInterval === null) {
            // this.handleAnimationLoop();
            this.handleStepFrame();
        }
    }

    endAnimationLoop() {
        // end the loop
        clearTimeout(this.animationLoopInterval);
        // clear the reference
        this.animationLoopInterval = null;
    }

    stepFrame(forward) {
        // step the animation forward
        this.props.actions.stepAnimation(forward);
    }

    loadAnimation() {
        let start = this.props.animation.get("startDate");
        let end = this.props.animation.get("endDate");
        let resolution = this.props.animation.get("stepSize");

        // define a callback that will run whenever a layer is loaded in openlayers map or when all layers are loaded in cesium map
        let callback = () => {
            // add a 500ms delay to create a batch update for tile loads to reduce computation costs
            if (this.tileLoadBatchDelay === null) {
                this.tileLoadBatchDelay = setTimeout(() => {
                    window.requestAnimationFrame(() => {
                        if (this.props.animation.get("initiated")) {
                            // until the buffer is initially loaded
                            if (!this.props.animation.get("initialBufferLoaded")) {
                                this.props.actions.checkInitialBuffer();
                            } else {
                                this.props.actions.checkBuffer();
                            }
                        }
                        clearTimeout(this.tileLoadBatchDelay);
                        this.tileLoadBatchDelay = null;
                    });
                }, 1000);
            }
        };

        // begin filling the buffer on the maps
        this.props.actions.fillAnimationBuffer(start, end, resolution, callback);
    }

    togglePlayPause() {
        // check that we have loaded the buffer at least once
        if (this.props.animation.get("initialBufferLoaded")) {
            // update the play state
            this.props.actions.setAnimationPlaying(!this.props.animation.get("isPlaying"));
            // set the loop running (will do nothing if already running)
            this.beginAnimationLoop();
        }
    }

    stopAnimation() {
        // end the animation
        this.endAnimationLoop();
        // clear buffer, etc
        this.props.actions.stopAnimation();
    }

    handleClose() {
        this.stopAnimation();
        this.props.actions.setAnimationExportOpen(false);
        this.props.actions.setAnimationOpen(false);
    }
    render() {
        return <div className={displayStyles.hidden} />;
    }
}

BasemapPicker.propTypes = {
    basemaps: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    mapControlsBasemapPickerOpen: PropTypes.bool.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        basemaps: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_BASEMAP]),
        mapControlsBasemapPickerOpen: state.view.get("mapControlsBasemapPickerOpen")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BasemapPicker);
