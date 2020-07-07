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
        const timeStrList = this.props.data.getIn(["properties", "position_date_time"]);
        const firstTime = moment.utc(timeStrList.get(0)).format("MMM DD, YYYY");
        const lastTime = moment.utc(timeStrList.get(timeStrList.size - 1)).format("MMM DD, YYYY");

        const isSameTime = firstTime === lastTime;
        const timeStr = !isSameTime ? firstTime + " – " + lastTime : firstTime;
        const connectStr = isSameTime ? "on" : "between";

        const coords = this.props.data.get("coords");
        const displayCoords = MapUtil.formatLatLon(coords.get(0), coords.get(1), true, "");

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
                    <Grid item xs={4}>
                        <Typography variant="caption" className={styles.paramLabel}>
                            Sampled:
                        </Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <Typography variant="caption" className={styles.dateLabel}>
                            {timeStrList.size} time{timeStrList.size > 1 ? "s" : ""} {connectStr}
                        </Typography>
                        <Typography variant="caption" className={styles.dateLabel}>
                            {timeStr}
                        </Typography>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

TrackDataDisplay.propTypes = {
    data: PropTypes.object.isRequired
};

export default TrackDataDisplay;
