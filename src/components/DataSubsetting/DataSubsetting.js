/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import moment from "moment";
import FormGroup from "@material-ui/core/FormGroup";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { LabelPopover, Checkbox, DateRangePicker, AreaSelectionInput } from "components/Reusables";
import styles from "components/DataSubsetting/DataSubsetting.scss";
import * as subsettingActions from "actions/subsettingActions";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "utils/MiscUtil";

export class DataSubsetting extends Component {
    renderTrackList(trackList) {
        if (trackList.size > 0) {
            return trackList.map(track => {
                let title =
                    track.get("title").size > 0 ? track.getIn(["title", 0]) : track.get("title");
                return (
                    <Checkbox
                        key={track.get("id") + "_chart_checkbox"}
                        label={`${title} (id: ${track.get("shortId")})`}
                        checked={this.props.subsettingOptions
                            .get("selectedTracks")
                            .includes(track.get("id"))}
                        onChange={isSelected =>
                            this.props.subsettingActions.setTrackSelected(
                                track.get("id"),
                                isSelected
                            )
                        }
                    />
                );
            });
        }
        return "No THREDDS supported datasets selected";
    }

    handleDateRangeUpdate = (startDate, endDate) => {
        this.props.subsettingActions.setSubsettingOptions({
            startDate: moment.utc(startDate).toDate(),
            endDate: moment.utc(endDate).toDate()
        });
    };

    submitSubsetRequest = () => {
        const aTracks = this.props.availableTracks;
        const sTracks = this.props.subsettingOptions.get("selectedTracks");
        const startDate = this.props.subsettingOptions.get("startDate");
        const endDate = this.props.subsettingOptions.get("endDate");
        const area = this.props.searchOptions.get("selectedArea");

        aTracks.forEach(track => {
            if (sTracks.includes(track.get("id"))) {
                const tdsUrl = track.getIn(["insituMeta", "tds_url"]);
                if (tdsUrl) {
                    const reqUrl = tdsUrl
                        .replace("LONmin", area.get(0))
                        .replace("LATmin", area.get(1))
                        .replace("LONmax", area.get(2))
                        .replace("LATmax", area.get(3))
                        .replace("DATETIMEmin", moment.utc(startDate).toISOString())
                        .replace("DATETIMEmax", moment.utc(endDate).toISOString());

                    console.log(`fetching ${reqUrl}`);
                    fetch(reqUrl);
                }
            }
        });
    };

    close = () => {
        this.props.subsettingActions.setSubsettingOptions({ isOpen: false });
    };

    render() {
        let trackList = this.props.availableTracks
            .filter(
                track =>
                    !track.get("isDisabled") &&
                    track.get("isActive") &&
                    track.getIn(["insituMeta", "tds_url"])
            )
            .toList()
            .sort(MiscUtil.getImmutableObjectSort("title"));

        let datasetsSubtitle =
            this.props.subsettingOptions.get("selectedTracks").size + " Selected";
        if (this.props.subsettingOptions.get("selectedTracks").size === 1) {
            const track = trackList.find(track => {
                return (
                    track.get("id") ===
                    this.props.subsettingOptions
                        .get("selectedTracks")
                        .toList()
                        .get(0)
                );
            });
            datasetsSubtitle =
                track.get("title").size > 0 ? track.getIn(["title", 0]) : track.get("title");
        }

        const couldSubmit =
            this.props.subsettingOptions.get("selectedTracks").size > 0 &&
            this.props.searchOptions.get("selectedArea").size === 4;

        const rootClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [styles.open]: this.props.subsettingOptions.get("isOpen"),
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        return (
            <Paper elevation={2} className={rootClasses}>
                <div className={styles.header}>
                    <Typography variant="body2" className={styles.title}>
                        Data Subsetting
                    </Typography>
                </div>
                <div className={styles.content}>
                    <div className={styles.formInput}>
                        <AreaSelectionInput
                            className={styles.optionField}
                            selectedArea={this.props.searchOptions.get("selectedArea")}
                        />
                        <DateRangePicker
                            className={styles.optionField}
                            startDate={this.props.subsettingOptions.get("startDate")}
                            endDate={this.props.subsettingOptions.get("endDate")}
                            onUpdate={this.handleDateRangeUpdate}
                        />
                        <LabelPopover
                            label="Datasets"
                            subtitle={datasetsSubtitle}
                            className={styles.optionField}
                        >
                            <FormGroup>{this.renderTrackList(trackList)}</FormGroup>
                        </LabelPopover>
                    </div>
                    <div className={styles.formButtons}>
                        <Button
                            variant="text"
                            size="small"
                            color="primary"
                            className={styles.button}
                            onClick={this.close}
                        >
                            Done
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            disabled={!couldSubmit}
                            className={styles.button}
                            onClick={this.submitSubsetRequest}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </Paper>
        );
    }
}

DataSubsetting.propTypes = {
    className: PropTypes.string,
    searchOptions: PropTypes.object.isRequired,
    subsettingActions: PropTypes.object.isRequired,
    subsettingOptions: PropTypes.object.isRequired,
    availableTracks: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        subsettingOptions: state.subsetting,
        availableTracks: state.map.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_DATA]),
        searchOptions: state.view.getIn(["layerSearch", "formOptions"])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        subsettingActions: bindActionCreators(subsettingActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DataSubsetting);
