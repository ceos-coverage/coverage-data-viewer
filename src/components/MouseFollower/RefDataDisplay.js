/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import MapUtil from "utils/MapUtil";
import styles from "components/MouseFollower/RefDataDisplay.scss";

export class RefDataDisplay extends Component {
    render() {
        let coords = this.props.data.get("coords");
        let displayCoords = MapUtil.formatLatLon(coords.get(0), coords.get(1), true, "");

        let params = this.props.data.get("properties").reduce((acc, val, key) => {
            acc.push({ key, val });
            return acc;
        }, []);

        return (
            <div className={styles.root}>
                {params.map(entry => (
                    <Grid
                        key={"data_" + this.props.data.get("layerId") + "_" + entry.key}
                        container
                        spacing={0}
                    >
                        <Grid item xs={4}>
                            {entry.key}:
                        </Grid>
                        <Grid item xs={8}>
                            {entry.val}
                        </Grid>
                    </Grid>
                ))}
            </div>
        );
    }
}

RefDataDisplay.propTypes = {
    data: PropTypes.object.isRequired
};

export default RefDataDisplay;
