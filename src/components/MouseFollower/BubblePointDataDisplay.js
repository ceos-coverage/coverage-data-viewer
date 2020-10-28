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

export class BubblePointDataDisplay extends Component {
    render() {
        const featureSet = this.props.data.getIn(["properties", "oiipFeatureCollection"]);
        const dataSet = featureSet.map(feature => {
            const properties = feature.get("properties");
            const variable = this.props.data.getIn(["layer", "insituMeta", "variables", 0]);
            return {
                dateStr: moment.utc(properties.get("dates")).format("MMM DD, YYYY"),
                dataStr: `${(properties.get(variable.get("label")) || 0).toFixed(2)} ${variable.get(
                    "units"
                )}`
            };
        });

        const coords = this.props.data.get("coords");
        const displayCoords = MapUtil.formatLatLon(coords.get(0), coords.get(1), true, "", 2);

        const title =
            this.props.data.getIn(["layer", "title"]).size > 0
                ? this.props.data.getIn(["layer", "title", 0])
                : this.props.data.getIn(["layer", "title"]);

        const instrument =
            this.props.data.getIn(["layer", "insituMeta", "instrument"]).size > 0
                ? this.props.data.getIn(["layer", "insituMeta", "instrument", 0])
                : this.props.data.getIn(["layer", "insituMeta", "instrument"]);

        const platform =
            this.props.data.getIn(["layer", "insituMeta", "platform"]).size > 0
                ? this.props.data.getIn(["layer", "insituMeta", "platform", 0])
                : this.props.data.getIn(["layer", "insituMeta", "platform"]);

        const subtitle = title === instrument ? platform : instrument;

        return (
            <div className={styles.root}>
                <div className={styles.labelRow}>
                    <div
                        className={styles.color}
                        style={{ background: this.props.data.getIn(["layer", "vectorColor"]) }}
                    />
                    <Typography variant="body1" className={styles.label}>
                        {title}
                    </Typography>
                    <div className={styles.subtitle}>
                        <Typography variant="caption" className={styles.label}>
                            {`${subtitle} (id: ${this.props.data.getIn(["layer", "shortId"])})`}
                        </Typography>
                    </div>
                </div>
                <Grid container spacing={0}>
                    <Grid item xs={4}>
                        <Typography variant="caption" className={styles.paramLabel}>
                            Location:
                        </Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <Typography
                            variant="body1"
                            color="inherit"
                            className={styles.mouseCoordinatesRoot}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{ __html: displayCoords }}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs={3}>
                        <Typography variant="caption" className={styles.paramLabel}>
                            Data:
                        </Typography>
                    </Grid>
                    <Grid item xs={8}>
                        {dataSet.map((d, i) => (
                            <Typography key={i} variant="caption" className={styles.dateLabel}>
                                {d.dateStr} · {d.dataStr}
                            </Typography>
                        ))}
                    </Grid>
                </Grid>
            </div>
        );
    }
}

BubblePointDataDisplay.propTypes = {
    data: PropTypes.object.isRequired
};

export default BubblePointDataDisplay;
