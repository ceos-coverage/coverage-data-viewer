import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";
import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import { LonLatCoordinates } from "_core/components/Reusables";
import MiscUtil from "utils/MiscUtil";
import * as appStrings from "constants/appStrings";
import styles from "components/MouseFollower/DataDisplay.scss";

export class DataDisplay extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            "no-data": this.props.data.get("value") === appStrings.NO_DATA
        });

        let timeStr = this.props.data.getIn(["properties", "position_date_time"]);
        let time = moment.utc(timeStr, this.props.data.getIn(["layer", "timeFormat"]));
        timeStr = time.format("MMM DD, YYYY · HH:mm UTC");

        let coords = this.props.data.get("coords");

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
                            Time:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="caption" className={styles.dateLabel}>
                            {timeStr}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs={4}>
                        <Typography variant="caption" className={styles.paramLabel}>
                            Location:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <LonLatCoordinates
                            className={styles.mouseCoordinatesRoot}
                            lon={coords.get(1)}
                            lat={coords.get(0)}
                            invalid={false}
                        />
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
