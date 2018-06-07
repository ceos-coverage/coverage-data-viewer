import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import MiscUtil from "utils/MiscUtil";
import MapUtil from "utils/MapUtil";
import * as appStrings from "constants/appStrings";
import styles from "components/MouseFollower/DataDisplay.scss";

export class DataDisplay extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            "no-data": this.props.data.get("value") === appStrings.NO_DATA
        });

        let timeStrList = this.props.data.getIn(["properties", "position_date_time"]);
        let firstTime = moment.utc(timeStrList.get(0)).format("MMM DD, YYYY");
        let lastTime = moment.utc(timeStrList.get(timeStrList.size - 1)).format("MMM DD, YYYY");

        let isSameTime = firstTime === lastTime;
        let timeStr = !isSameTime ? firstTime + " – " + lastTime : firstTime;
        let connectStr = isSameTime ? "on" : "between";

        let coords = this.props.data.get("coords");
        let displayCoords = MapUtil.formatLatLon(coords.get(0), coords.get(1), true, "");

        return (
            <div className={containerClasses}>
                <div className={styles.labelRow}>
                    <div
                        className={styles.color}
                        style={{ background: this.props.data.getIn(["layer", "vectorColor"]) }}
                    />
                    <Typography variant="body2" className={styles.label}>
                        {this.props.data.getIn(["layer", "title"])}
                    </Typography>
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

DataDisplay.propTypes = {
    data: PropTypes.object.isRequired
};

export default connect()(DataDisplay);
