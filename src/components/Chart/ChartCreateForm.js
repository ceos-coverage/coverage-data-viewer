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
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { LabelPopover, Checkbox, DateRangePicker, AreaSelectionInput } from "components/Reusables";
import styles from "components/Chart/ChartCreateForm.scss";
import * as chartActions from "actions/chartActions";
import * as subsettingActions from "actions/subsettingActions";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "utils/MiscUtil";
import appConfig from "constants/appConfig";

export class ChartCreateForm extends Component {
    selectAxisVariable(axis, variable) {
        variable = variable !== appStrings.NO_DATA ? variable : undefined;
        this.props.chartActions.setAxisVariable(axis, variable);
    }

    selectSatelliteChartType(chartType) {
        if (chartType) {
            this.props.chartActions.setSatelliteChartType(chartType);
        }
    }

    setChartDatasetType(datasetType) {
        if (datasetType) {
            this.props.chartActions.setChartDatasetType(datasetType);
        }
    }

    renderTrackList(trackList) {
        if (trackList.size > 0) {
            return trackList.map((track) => {
                let title =
                    track.get("title").size > 0 ? track.getIn(["title", 0]) : track.get("title");
                return (
                    <Checkbox
                        key={track.get("id") + "_chart_checkbox"}
                        label={`${title} (id: ${track.get("shortId")})`}
                        checked={this.props.formOptions
                            .get("selectedTracks")
                            .includes(track.get("id"))}
                        onChange={(isSelected) =>
                            this.props.chartActions.setTrackSelected(track.get("id"), isSelected)
                        }
                    />
                );
            });
        }
        return "No datasets selected";
    }

    renderVariableSelect(sharedVariableSet, nonSharedVariableSet, axis) {
        if (axis !== "xAxis") {
            sharedVariableSet = sharedVariableSet.filter(
                (key) => key.get("label").indexOf("time") === -1
            );
        }

        if (sharedVariableSet.size > 0) {
            return (
                <RadioGroup
                    aria-label={axis}
                    name={axis}
                    value={this.props.formOptions.get(axis) || appStrings.NO_DATA}
                    onClick={(evt) => {
                        this.selectAxisVariable(axis, evt.target.value);
                    }}
                    onChange={(evt) => this.selectAxisVariable(axis, evt.target.value)}
                >
                    {sharedVariableSet.map((variable) => (
                        <FormControlLabel
                            key={"shared_var_" + variable.get("label")}
                            value={variable.get("label")}
                            control={<Radio color="primary" />}
                            label={variable.get("label")}
                            className={styles.varLabel}
                        />
                    ))}
                    <FormControlLabel
                        value={appStrings.NO_DATA}
                        control={<Radio color="primary" />}
                        label={"None"}
                    />
                </RadioGroup>
            );
        }
        return "No variables available";
    }

    renderVariableSelections() {
        const sharedVariableSet = this.props.formOptions
            .getIn(["variables", "shared"])
            .toList()
            .sortBy((x) => x.get("label"));

        const nonSharedVariableSet = this.props.formOptions
            .getIn(["variables", "nonshared"])
            .toList()
            .sortBy((x) => x.get("label"));

        let selectorList = [
            { label: "X-Axis", val: "xAxis" },
            { label: "Y-Axis", val: "yAxis" },
            { label: "Z-Axis", val: "zAxis" },
        ];
        return selectorList.map((selector) => {
            return (
                <LabelPopover
                    key={"variable_selector_" + selector.val}
                    label={selector.label}
                    subtitle={this.props.formOptions.get(selector.val) || "None"}
                    className={styles.chartOption}
                >
                    {this.renderVariableSelect(
                        sharedVariableSet,
                        nonSharedVariableSet,
                        selector.val
                    )}
                </LabelPopover>
            );
        });
    }

    renderChartTypeList = () => {
        const selectedOp = appConfig.SATELLITE_CHART_TYPE_OPTIONS.find(
            (x) => x.value === this.props.formOptions.get("satelliteChartType")
        );
        return (
            <LabelPopover
                label="Chart Type"
                subtitle={selectedOp.label}
                className={styles.chartOption}
            >
                <RadioGroup
                    aria-label="Chart Type Selection"
                    name="Chart Type Selection"
                    value={this.props.formOptions.get("satelliteChartType")}
                    onClick={(evt) => {
                        this.selectSatelliteChartType(evt.target.value);
                    }}
                    onChange={(evt) => this.selectSatelliteChartType(evt.target.value)}
                >
                    {appConfig.SATELLITE_CHART_TYPE_OPTIONS.map((chartTypeObj) => (
                        <FormControlLabel
                            key={`sat_chart_type_${chartTypeObj.value}`}
                            value={chartTypeObj.value}
                            control={<Radio color="primary" />}
                            label={chartTypeObj.label}
                            className={styles.varLabel}
                        />
                    ))}
                </RadioGroup>
            </LabelPopover>
        );
    };

    handleDateRangeUpdate = (startDate, endDate) => {
        this.props.subsettingActions.setSubsettingOptions({
            startDate: moment.utc(startDate).toDate(),
            endDate: moment.utc(endDate).toDate(),
        });
    };

    render() {
        const useInsituTracks =
            this.props.formOptions.get("datasetType") === appStrings.CHART_DATASET_TYPE_INSITU;

        let trackList = (
            useInsituTracks ? this.props.availableTracks : this.props.availableSatelliteDatasets
        )
            .filter((track) => !track.get("isDisabled") && track.get("isActive"))
            .toList()
            .sort(MiscUtil.getImmutableObjectSort("title"));

        const couldCreateInsituChart =
            useInsituTracks &&
            this.props.formOptions.get("selectedTracks").size > 0 &&
            typeof this.props.formOptions.get("xAxis") !== "undefined" &&
            typeof this.props.formOptions.get("yAxis") !== "undefined";

        const couldCreateSatelliteChart =
            !useInsituTracks &&
            this.props.formOptions.get("selectedTracks").size > 0 &&
            this.props.selectedArea.size === 4 &&
            this.props.startDate &&
            this.props.endDate;

        const couldCreateChart = couldCreateInsituChart || couldCreateSatelliteChart;

        let datasetsSubtitle = this.props.formOptions.get("selectedTracks").size + " Selected";
        if (this.props.formOptions.get("selectedTracks").size === 1) {
            const track = trackList.find((track) => {
                return (
                    track.get("id") === this.props.formOptions.get("selectedTracks").toList().get(0)
                );
            });
            datasetsSubtitle =
                track.get("title").size > 0 ? track.getIn(["title", 0]) : track.get("title");
        }

        return (
            <Paper elevation={3} className={styles.root}>
                <div className={styles.selectorRow}>
                    <div className={styles.options}>
                        <LabelPopover
                            label="Dataset Type"
                            subtitle={this.props.formOptions.get("datasetType")}
                            className={styles.chartOption}
                        >
                            <RadioGroup
                                aria-labelledby="dataset-type-selector"
                                value={this.props.formOptions.get("datasetType")}
                                name="dataset-type-selector"
                                onClick={(evt) => {
                                    this.setChartDatasetType(evt.target.value);
                                }}
                                onChange={(evt) => this.setChartDatasetType(evt.target.value)}
                            >
                                <FormControlLabel
                                    value={appStrings.CHART_DATASET_TYPE_INSITU}
                                    control={<Radio color="primary" />}
                                    label="In-Situ"
                                    className={styles.varLabel}
                                />
                                <FormControlLabel
                                    value={appStrings.CHART_DATASET_TYPE_SATELLITE}
                                    control={<Radio color="primary" />}
                                    label="Satellite"
                                    className={styles.varLabel}
                                />
                            </RadioGroup>
                        </LabelPopover>
                        <LabelPopover
                            label="Datasets"
                            subtitle={datasetsSubtitle}
                            className={styles.chartOption}
                        >
                            <FormGroup>{this.renderTrackList(trackList)}</FormGroup>
                        </LabelPopover>
                        {!useInsituTracks ? this.renderChartTypeList() : null}
                    </div>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        disabled={!couldCreateChart}
                        onClick={this.props.chartActions.createChart}
                    >
                        Create Chart
                    </Button>
                </div>
                <div className={styles.selectorRow}>
                    {useInsituTracks ? (
                        <div className={styles.options}>{this.renderVariableSelections()}</div>
                    ) : null}
                    {!useInsituTracks ? (
                        <>
                            <AreaSelectionInput
                                className={styles.satField}
                                selectedArea={this.props.selectedArea}
                            />
                            <DateRangePicker
                                className={styles.satField}
                                startDate={this.props.startDate}
                                endDate={this.props.endDate}
                                onUpdate={this.handleDateRangeUpdate}
                            />
                        </>
                    ) : null}
                </div>
            </Paper>
        );
    }
}

ChartCreateForm.propTypes = {
    chartActions: PropTypes.object.isRequired,
    formOptions: PropTypes.object.isRequired,
    availableTracks: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    return {
        formOptions: state.chart.get("formOptions"),
        availableTracks: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA]),
        availableSatelliteDatasets: state.map.getIn([
            "layers",
            appStringsCore.LAYER_GROUP_TYPE_DATA,
        ]),
        selectedArea: state.view.getIn(["layerSearch", "formOptions", "selectedArea"]),
        startDate: state.subsetting.get("startDate"),
        endDate: state.subsetting.get("endDate"),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        chartActions: bindActionCreators(chartActions, dispatch),
        subsettingActions: bindActionCreators(subsettingActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartCreateForm);
