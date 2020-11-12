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
import { saveAs } from "file-saver";
import FormGroup from "@material-ui/core/FormGroup";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { LabelPopover, Checkbox, DateRangePicker, AreaSelectionInput } from "components/Reusables";
import { LoadingSpinner } from "_core/components/Reusables";
import styles from "components/DataSubsetting/DataSubsetting.scss";
import * as subsettingActions from "actions/subsettingActions";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import MiscUtil from "utils/MiscUtil";

export class DataSubsetting extends Component {
    constructor(props) {
        super(props);

        this.state = { loading: false };
    }

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

        const promises = aTracks.reduce((acc, track) => {
            if (sTracks.includes(track.get("id"))) {
                const tdsUrl = track.getIn(["insituMeta", "tds_url"]);
                if (tdsUrl) {
                    const reqUrl = tdsUrl
                        .replace("LONmin", area.get(0))
                        .replace("LONmax", area.get(2))
                        .replace("LATmin", area.get(1))
                        .replace("LATmax", area.get(3))
                        .replace("DATETIMEmin", moment.utc(startDate).toISOString())
                        .replace("DATETIMEstart", moment.utc(startDate).toISOString())
                        .replace("DATETIMEmax", moment.utc(endDate).toISOString())
                        .replace("DATETIMEend", moment.utc(endDate).toISOString())
                        .replace("DEPTHmin", -10000)
                        .replace("DEPTHmax", 10000);
                    const p = new Promise(resolve => {
                        fetch(reqUrl)
                            .then(response => {
                                if (response.status >= 400) {
                                    console.warn("Bad response from server");
                                } else {
                                    return response.blob();
                                }
                            })
                            .then(parsedResponse => {
                                const fName = tdsUrl
                                    .split("?")[0]
                                    .split("/")
                                    .splice(-1)[0]
                                    .replace(".ncml", ".nc");
                                saveAs(parsedResponse, fName);
                                resolve(true);
                            })
                            .catch(err => {
                                console.warn(err);
                                resolve(false);
                            });
                    });
                    acc.push(p);
                }
            }
            return acc;
        }, []);

        this.setState({ loading: true });
        Promise.all(promises).then(results => {
            this.setState({ loading: false });
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
            .concat(
                this.props.availableRemotes
                    .filter(
                        track =>
                            !track.get("isDisabled") &&
                            track.get("isActive") &&
                            track.getIn(["insituMeta", "tds_url"])
                    )
                    .toList()
            )
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
            this.props.searchOptions.get("selectedArea").size === 4 &&
            !this.state.loading;

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
                    {this.state.loading && (
                        <div className={styles.loadingWrapper}>
                            <LoadingSpinner className={styles.spinner} />
                            <Typography variant="caption" className={styles.loadingCaption}>
                                loading
                            </Typography>
                        </div>
                    )}
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
    availableTracks: PropTypes.object.isRequired,
    availableRemotes: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        subsettingOptions: state.subsetting,
        availableTracks: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA]),
        availableRemotes: state.map.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_DATA]),
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
