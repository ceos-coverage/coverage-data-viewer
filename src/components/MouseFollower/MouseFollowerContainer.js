/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Immutable from "immutable";
import MiscUtil from "_core/utils/MiscUtil";
import {
    DrawingTooltip,
    MouseCoordinates as MouseCoordinatesCore
} from "_core/components/MouseFollower";
import { MouseCoordinates, DataDisplayContainer } from "components/MouseFollower";
import styles from "_core/components/MouseFollower/MouseFollowerContainer.scss";
import displayStyles from "_core/styles/display.scss";

export class MouseFollowerContainer extends Component {
    shouldComponentUpdate(nextProps) {
        let nextDraworMeasure =
            nextProps.drawing.get("isDrawingEnabled") ||
            nextProps.measuring.get("isMeasuringEnabled");
        let currDrawOrMeasure =
            this.props.drawing.get("isDrawingEnabled") ||
            this.props.measuring.get("isMeasuringEnabled");

        let currShowData =
            this.props.pixelCoordinate.get("isValid") && this.props.pixelCoordinate.get("showData");
        let nextShowData =
            nextProps.pixelCoordinate.get("isValid") && nextProps.pixelCoordinate.get("showData");

        return (
            nextDraworMeasure ||
            nextDraworMeasure !== currDrawOrMeasure ||
            (nextShowData || nextShowData !== currShowData)
        );
    }

    renderCoordinates(data) {
        if (data.size > 0) {
            let coords = data.getIn([0, "coords"]);
            return (
                <MouseCoordinates
                    pixelCoordinate={Immutable.fromJS({
                        lat: coords.get(0),
                        lon: coords.get(1),
                        isValid: true
                    })}
                />
            );
        } else {
            return <MouseCoordinatesCore />;
        }
    }

    render() {
        let maxLeft = window.innerWidth - 300;
        let maxTop = window.innerHeight;

        let top = parseInt(this.props.pixelCoordinate.get("y"));
        let left = parseInt(this.props.pixelCoordinate.get("x"));

        let style = { top, left };

        let drawOrMeasure =
            this.props.drawing.get("isDrawingEnabled") ||
            this.props.measuring.get("isMeasuringEnabled");
        let dataAvailable = this.props.pixelCoordinate.get("data").size > 0;

        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.mouseFollowerContainer]: true,
            [styles.active]:
                this.props.pixelCoordinate.get("isValid") &&
                (this.props.pixelCoordinate.get("showData") || drawOrMeasure),
            [styles.right]: left > maxLeft,
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        let drawClasses = MiscUtil.generateStringFromSet({
            [displayStyles.hidden]: !drawOrMeasure
        });

        let dataClasses = MiscUtil.generateStringFromSet({
            [displayStyles.hidden]: !this.props.pixelCoordinate.get("showData") || drawOrMeasure
        });

        // TODO - make a data display component
        return (
            <div className={containerClasses} style={style}>
                <div className={styles.content}>
                    <DrawingTooltip
                        drawing={this.props.drawing}
                        measuring={this.props.measuring}
                        className={drawClasses}
                    />
                    <DataDisplayContainer
                        className={dataClasses}
                        data={this.props.pixelCoordinate.get("data")}
                    />
                </div>
                <div className={styles.footer}>
                    {this.renderCoordinates(this.props.pixelCoordinate.get("data"))}
                </div>
            </div>
        );
    }
}

MouseFollowerContainer.propTypes = {
    pixelCoordinate: PropTypes.object.isRequired,
    drawing: PropTypes.object.isRequired,
    measuring: PropTypes.object.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        pixelCoordinate: state.map.getIn(["view", "pixelHoverCoordinate"]),
        drawing: state.map.get("drawing"),
        measuring: state.map.get("measuring")
    };
}

export default connect(mapStateToProps, null)(MouseFollowerContainer);
