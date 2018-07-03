/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import StepOverIcon from "mdi-material-ui/DebugStepOver";
import Typography from "@material-ui/core/Typography";
import appConfig from "constants/appConfig";
import styles from "components/DatePicker/StepIcon.scss";

export class StepIcon extends Component {
    render() {
        let scale = appConfig.DATE_INTERVAL.SCALES.reduce((acc, el) => {
            if (el.value === this.props.dateIntervalScale) {
                return el;
            }
            return acc;
        }, undefined);

        return (
            <div className={styles.root}>
                <StepOverIcon className={styles.icon} />
                <Typography variant="caption" className={styles.label}>
                    {this.props.dateIntervalSize} {scale.abbr}
                </Typography>
            </div>
        );
    }
}

StepIcon.propTypes = {
    dateIntervalSize: PropTypes.number.isRequired,
    dateIntervalScale: PropTypes.string.isRequired
};

export default StepIcon;
