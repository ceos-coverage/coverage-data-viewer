import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import MiscUtil from "_core/utils/MiscUtil";
import * as appStrings from "constants/appStrings";
import styles from "components/MouseFollower/SatDataEntry.scss";

export class SatDataEntry extends Component {
    render() {
        const value = this.props.data.get("value");
        const unknown = value === appStrings.UNKNOWN;
        const nodata = value === appStrings.NO_DATA;

        const colorClasses = MiscUtil.generateStringFromSet({
            [styles.colorPreview]: true,
            [styles.noData]: nodata,
        });

        const valueClasses = MiscUtil.generateStringFromSet({
            [styles.value]: true,
            [styles.noData]: nodata || unknown,
        });

        return (
            <div className={styles.root}>
                <Grid container spacing={0} alignItems="center">
                    <Grid item xs={1}>
                        <div
                            className={colorClasses}
                            style={{ background: this.props.data.get("color") }}
                        />
                    </Grid>
                    <Grid item xs={6} className={styles.title}>
                        {this.props.data.getIn(["layer", "title"])}
                    </Grid>
                    <Grid item xs={5} className={valueClasses}>
                        {value}
                    </Grid>
                </Grid>
            </div>
        );
    }
}

SatDataEntry.propTypes = {
    data: PropTypes.object.isRequired,
};

export default connect()(SatDataEntry);
