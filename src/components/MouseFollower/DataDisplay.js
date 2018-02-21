import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";
import Typography from "material-ui/Typography";
import MiscUtil from "utils/MiscUtil";
import * as appStrings from "constants/appStrings";
import styles from "components/MouseFollower/DataDisplay.scss";

export class DataDisplay extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            "no-data": this.props.data.get("value") === appStrings.NO_DATA
        });

        let timeStr = this.props.data.getIn(["properties", "time"]);
        let timeStrAlt = this.props.data.getIn(["properties", "datetimestamp"]);
        timeStr = typeof timeStr === "undefined" ? timeStrAlt : timeStr;

        let time = moment(timeStr);
        timeStr = time.format("MMM DD, YYYY · HH:mm");
        return (
            <div className={containerClasses}>
                <div
                    className={styles.color}
                    style={{ background: this.props.data.getIn(["layer", "vectorColor"]) }}
                />
                <Typography variant="body2" className={styles.label}>
                    {this.props.data.getIn(["layer", "title"])}
                </Typography>
                <Typography variant="caption" className={styles.sublabel}>
                    {timeStr}
                </Typography>
            </div>
        );
    }
}

DataDisplay.propTypes = {
    data: PropTypes.object.isRequired
};

export default connect()(DataDisplay);
