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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { LabelPopover, Checkbox, DateRangePicker, AreaSelectionInput } from "components/Reusables";
import { LoadingSpinner } from "_core/components/Reusables";
import styles from "components/Chart/ChartingCDMS.scss";
import * as chartActions from "actions/chartActions";
import * as subsettingActions from "actions/subsettingActions";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import MiscUtil from "utils/MiscUtil";

export class ChartingCDMS extends Component {
    constructor(props) {
        super(props);

        this.state = { loading: false };
    }

    // TODO - make this a radio list and select primary/secondary dataset
    renderTrackList(trackList, key) {
        if (trackList.size > 0) {
            return (
                <RadioGroup
                    aria-label={`${key}_dataset`}
                    name={`${key}_dataset`}
                    value={
                        this.props.cdmsCharting.getIn(["formOptions", key]) || appStrings.NO_DATA
                    }
                    onClick={(evt) => {
                        const val =
                            evt.target.value === appStrings.NO_DATA ? undefined : evt.target.value;
                        this.props.chartActions.setCDMSChartingOptions({
                            formOptions: { [key]: val },
                        });
                    }}
                    onChange={(evt) => {
                        const val =
                            evt.target.value === appStrings.NO_DATA ? undefined : evt.target.value;
                        this.props.chartActions.setCDMSChartingOptions({
                            formOptions: { [key]: val },
                        });
                    }}
                >
                    {trackList.map((track) => {
                        const title =
                            track.get("title").size > 0
                                ? track.getIn(["title", 0])
                                : track.get("title");
                        const label = `${title} (id: ${track.get("shortId")})`;
                        return (
                            <FormControlLabel
                                key={`${track.get("id")}_cdms_chart_radio`}
                                value={track.get("id")}
                                control={<Radio color="primary" />}
                                label={label}
                            />
                        );
                    })}
                    <FormControlLabel
                        value={appStrings.NO_DATA}
                        control={<Radio color="primary" />}
                        label={"None"}
                    />
                </RadioGroup>
            );
        }
        return "No supported datasets selected";
    }

    handleDateRangeUpdate = (startDate, endDate) => {
        this.props.subsettingActions.setSubsettingOptions({
            startDate: moment.utc(startDate).toDate(),
            endDate: moment.utc(endDate).toDate(),
        });
    };

    submitChartingRequest = () => {
        const aTracks = this.props.availableTracks.concat(this.props.availableRemotes);
        const sTracks = this.props.subsettingOptions.get("selectedTracks");
        const startDate = this.props.subsettingOptions.get("startDate");
        const endDate = this.props.subsettingOptions.get("endDate");
        const area = this.props.searchOptions.get("selectedArea");

        console.log("submit");
    };

    close = () => {
        this.props.chartActions.setCDMSChartingOptions({ isOpen: false });
    };

    render() {
        // get dataset lists
        let trackList = this.props.availableTracks
            .filter((track) => !track.get("isDisabled") && track.get("isActive"))
            .toList()
            .sort(MiscUtil.getImmutableObjectSort("title"));
        const satelliteList = this.props.availableRemotes
            .filter((track) => !track.get("isDisabled") && track.get("isActive"))
            .toList()
            .sort(MiscUtil.getImmutableObjectSort("title"));

        // get selector subtitles
        let datasetsSubtitle = "None Selected";
        const primaryDataset = this.props.cdmsCharting.getIn(["formOptions", "primaryDataset"]);
        if (primaryDataset) {
            const track = satelliteList.find((track) => {
                return track.get("id") === primaryDataset;
            });
            datasetsSubtitle =
                track.get("title").size > 0 ? track.getIn(["title", 0]) : track.get("title");
        }

        let datasetsSubtitleSecondary = "None Selected";
        const secondaryDataset = this.props.cdmsCharting.getIn(["formOptions", "secondaryDataset"]);
        if (secondaryDataset) {
            const track = trackList.find((track) => {
                return track.get("id") === secondaryDataset;
            });
            datasetsSubtitleSecondary =
                track.get("title").size > 0 ? track.getIn(["title", 0]) : track.get("title");
        }

        const isOpen = this.props.cdmsCharting.get("isOpen");

        const couldSubmit =
            this.props.cdmsCharting.getIn(["formOptions", "primaryDataset"]) &&
            this.props.cdmsCharting.getIn(["formOptions", "secondaryDataset"]) &&
            this.props.searchOptions.get("selectedArea").size === 4 &&
            !this.state.loading;

        const rootClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [this.props.className]: typeof this.props.className !== "undefined",
        });

        return isOpen ? (
            <Paper elevation={2} className={rootClasses}>
                <div className={styles.header}>
                    <Typography variant="body2" className={styles.title}>
                        CDMS Charting
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
                            label="Primary Dataset"
                            subtitle={datasetsSubtitle}
                            className={styles.optionField}
                        >
                            <FormGroup>
                                {this.renderTrackList(satelliteList, "primaryDataset")}
                            </FormGroup>
                        </LabelPopover>
                        <LabelPopover
                            label="Secondary Dataset"
                            subtitle={datasetsSubtitleSecondary}
                            className={styles.optionField}
                        >
                            <FormGroup>
                                {this.renderTrackList(trackList, "secondaryDataset")}
                            </FormGroup>
                        </LabelPopover>
                        <FormGroup className={styles.optionFieldPadded}>
                            <TextField
                                value={this.props.cdmsCharting.getIn(["formOptions", "depthMin"])}
                                label="Depth Min (meters)"
                                margin="dense"
                                fullWidth={true}
                                onChange={(evt) =>
                                    this.props.chartActions.setCDMSChartingOptions({
                                        formOptions: {
                                            depthMin: parseFloat(evt.target.value),
                                        },
                                    })
                                }
                                inputProps={{
                                    type: "number",
                                }}
                            />
                        </FormGroup>
                        <FormGroup className={styles.optionFieldPadded}>
                            <TextField
                                value={this.props.cdmsCharting.getIn(["formOptions", "depthMax"])}
                                label="Depth Max (meters)"
                                margin="dense"
                                fullWidth={true}
                                onChange={(evt) =>
                                    this.props.chartActions.setCDMSChartingOptions({
                                        formOptions: {
                                            depthMax: parseFloat(evt.target.value),
                                        },
                                    })
                                }
                                inputProps={{
                                    type: "number",
                                }}
                            />
                        </FormGroup>
                        <FormGroup className={styles.optionFieldPadded}>
                            <TextField
                                value={this.props.cdmsCharting.getIn([
                                    "formOptions",
                                    "timeTolerance",
                                ])}
                                label="Time Tolerance (seconds)"
                                margin="dense"
                                fullWidth={true}
                                onChange={(evt) =>
                                    this.props.chartActions.setCDMSChartingOptions({
                                        formOptions: {
                                            timeTolerance: parseFloat(evt.target.value),
                                        },
                                    })
                                }
                                inputProps={{
                                    type: "number",
                                }}
                            />
                        </FormGroup>
                        <FormGroup className={styles.optionFieldPadded}>
                            <TextField
                                value={this.props.cdmsCharting.getIn([
                                    "formOptions",
                                    "radiusTolerance",
                                ])}
                                label="Radius Tolerance (meters)"
                                margin="dense"
                                fullWidth={true}
                                onChange={(evt) =>
                                    this.props.chartActions.setCDMSChartingOptions({
                                        formOptions: {
                                            radiusTolerance: parseFloat(evt.target.value),
                                        },
                                    })
                                }
                                inputProps={{
                                    type: "number",
                                }}
                            />
                        </FormGroup>
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
                            onClick={this.submitChartingRequest}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </Paper>
        ) : null;
    }
}

ChartingCDMS.propTypes = {
    className: PropTypes.string,
    searchOptions: PropTypes.object.isRequired,
    chartActions: PropTypes.object.isRequired,
    subsettingActions: PropTypes.object.isRequired,
    cdmsCharting: PropTypes.object.isRequired,
    availableTracks: PropTypes.object.isRequired,
    availableRemotes: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    return {
        subsettingOptions: state.subsetting,
        cdmsCharting: state.chart.get("cdmsCharting"),
        availableTracks: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA]),
        availableRemotes: state.map.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_DATA]),
        searchOptions: state.view.getIn(["layerSearch", "formOptions"]),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        chartActions: bindActionCreators(chartActions, dispatch),
        subsettingActions: bindActionCreators(subsettingActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartingCDMS);
