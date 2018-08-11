/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import MiscUtil from "utils/MiscUtil";
import styles from "components/Map/RefDataDisplay.scss";
import displayStyles from "_core/styles/display.scss";

export class RefDataDisplay extends Component {
    render() {
        let label = "Area";
        let val = "Unknown";
        if (this.props.data.size > 0) {
            let data = this.props.data.get(0);
            let coords = this.props.data.get("coords");

            if (typeof data.getIn(["properties", "GeoName"]) !== "undefined") {
                label = "EEZ Region";
                val = data.getIn(["properties", "GeoName"]);
            } else if (typeof data.getIn(["properties", "F_CODE"]) !== "undefined") {
                label = "FAO Region";
                val = data.getIn(["properties", "F_CODE"]);
            } else if (typeof data.getIn(["properties", "NAME"]) !== "undefined") {
                label = "IHO Region";
                val = data.getIn(["properties", "NAME"]);
            }
        }

        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [displayStyles.hidden]: this.props.data.size === 0
        });

        return (
            <Paper elevation={2} className={containerClasses}>
                <div className={styles.label}>{label}:</div>
                <div className={styles.val}>{val}</div>
            </Paper>
        );
    }
}

RefDataDisplay.propTypes = {
    data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        data: state.map.getIn(["view", "refHoverData"])
    };
}

export default connect(mapStateToProps, null)(RefDataDisplay);
