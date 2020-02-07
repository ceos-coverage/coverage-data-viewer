/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import MapUtil from "utils/MapUtil";
import styles from "components/MouseFollower/DataDisplay.scss";

export class TrackDataDisplay extends Component {
    render() {
        const properties = this.props.data.get("properties");
        const layer = this.props.data.get("layer");
        const displayProps = layer.getIn(["metadata", "hoverDisplayProps"]).toJS();

        const displayCoords = MapUtil.formatLatLon(
            properties.get(displayProps.location.lon),
            properties.get(displayProps.location.lat),
            true,
            ""
        );

        return (
            <div className={styles.root}>
                <div className={styles.labelRow}>
                    <div className={styles.color} />
                    <Typography variant="body1" className={styles.label}>
                        {properties.get(displayProps.title.value) || layer.get("title")}
                    </Typography>
                    <div className={styles.subtitle}>
                        <Typography
                            variant="body1"
                            color="inherit"
                            className={styles.mouseCoordinatesRoot}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{ __html: displayCoords }}
                        />
                    </div>
                </div>
                {displayProps.altProps.map(p => {
                    const val = properties.get(p.value);
                    return (
                        <Grid key={`prop_${p.value}`} container spacing={0}>
                            <Grid item xs={5}>
                                <Typography variant="caption" className={styles.paramLabel}>
                                    {p.label}:
                                </Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <Typography variant="caption" className={styles.dateLabel}>
                                    {!isNaN(parseFloat(val)) ? parseFloat(val).toFixed(3) : val}
                                </Typography>
                            </Grid>
                        </Grid>
                    );
                })}
            </div>
        );
    }
}

TrackDataDisplay.propTypes = {
    data: PropTypes.object.isRequired
};

export default TrackDataDisplay;
