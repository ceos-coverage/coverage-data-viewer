/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Paper from "@material-ui/core/Paper";
import { MouseCoordinates as MouseCoordinatesCore } from "_core/components/MouseFollower";
import { SatDataEntry } from "components/MouseFollower";
import MiscUtil from "utils/MiscUtil";
import styles from "components/MouseFollower/SatDataDisplay.scss";

export class SatDataDisplay extends Component {
    render() {
        const containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [styles.noData]: this.props.data.size === 0,
        });

        return (
            <Paper elevation={2} className={containerClasses}>
                {this.props.data.size > 0 ? (
                    <Paper elevation={1} className={styles.dataContainer}>
                        {this.props.data.map((entry, i) => (
                            <SatDataEntry key={"mouse-follow-data-" + i} data={entry} />
                        ))}
                    </Paper>
                ) : null}
                <div className={styles.coordsContainer}>
                    <MouseCoordinatesCore className={styles.coords} />
                </div>
            </Paper>
        );
    }
}

SatDataDisplay.propTypes = {
    data: PropTypes.object.isRequired,
    pixelIsValid: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    return {
        data: state.map.getIn(["view", "satHoverData"]),
        pixelIsValid: state.map.getIn(["view", "pixelHoverCoordinate", "isValid"]),
    };
}

export default connect(mapStateToProps, null)(SatDataDisplay);
