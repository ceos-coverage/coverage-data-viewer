/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import { chartModel } from "reducers/models/chart";
import * as appStrings from "constants/appStrings";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class ChartReducer {
    static setTrackSelected(state, action) {
        let selected = state.getIn(["formOptions", "selectedTracks"]);
        if (action.isSelected) {
            selected = selected.add(action.trackId);
        } else {
            selected = selected.delete(action.trackId);
        }
        return state.setIn(["formOptions", "selectedTracks"], selected);
    }

    static setAxisVariable(state, action) {
        return state.setIn(["formOptions", action.axis], action.variable);
    }

    static setChartDatasetType(state, action) {
        return state.setIn(["formOptions", "datasetType"], action.datasetType);
    }

    static setSatelliteChartType(state, action) {
        return state.setIn(["formOptions", "satelliteChartType"], action.chartType);
    }

    static clearTracksSelected(state, action) {
        return state.setIn(
            ["formOptions", "selectedTracks"],
            state.getIn(["formOptions", "selectedTracks"]).clear()
        );
    }

    static initializeChart(state, action) {
        if (action.formOptions.datasetType === appStrings.CHART_DATASET_TYPE_INSITU) {
            let chartType = appStrings.CHART_TYPES.SINGLE_SERIES;
            if (typeof action.formOptions.zAxis !== "undefined") {
                if (action.formOptions.selectedTracks.length !== 1) {
                    chartType = appStrings.CHART_TYPES.MULTI_SERIES_WITH_COLOR;
                } else {
                    chartType = appStrings.CHART_TYPES.SINGLE_SERIES_WITH_COLOR;
                }
            } else if (action.formOptions.selectedTracks.length !== 1) {
                chartType = appStrings.CHART_TYPES.MULTI_SERIES;
            }

            let title = action.formOptions.selectedTracks.map((track) => track.title).join(", ");

            // try to be clever with defaults
            let cleverOptions = {};
            if (action.formOptions.xAxis.indexOf("time") !== -1) {
                cleverOptions.markerType = appStrings.PLOT_STYLES.TIME_SERIES.LINES_AND_DOTS;
            }
            if (action.formOptions.yAxis.indexOf("depth") !== -1) {
                cleverOptions.yAxisReversed = true;
            }

            // resolve labels
            let axisLabels = ["xAxis", "yAxis", "zAxis"].map((axis, i) => {
                return action.formOptions.variables.shared.reduce((acc, entry) => {
                    if (
                        entry.label === action.formOptions[axis] &&
                        entry.units &&
                        entry.units !== "units"
                    ) {
                        if (i < 2) {
                            return entry.label + " (" + entry.units + ")";
                        }
                        return entry.units;
                    }
                    return acc;
                }, action.formOptions[axis] || "");
            });

            let chart = chartModel
                .set("id", action.id)
                .set("title", title)
                .set("nodeId", "chartWrapper_" + action.id)
                .set("data", [])
                .set("dataStore", action.dataStore)
                .set("urls", action.urls)
                .set("chartType", chartType)
                .setIn(["dataError", "error"], false)
                .setIn(["dataError", "message"], "")
                .setIn(
                    ["formOptions", "selectedTracks"],
                    Immutable.List(action.formOptions.selectedTracks)
                )
                .setIn(["formOptions", "xAxis"], action.formOptions.xAxis)
                .setIn(["formOptions", "xAxisLabel"], axisLabels[0])
                .setIn(["formOptions", "yAxis"], action.formOptions.yAxis)
                .setIn(["formOptions", "yAxisLabel"], axisLabels[1])
                .setIn(["formOptions", "zAxis"], action.formOptions.zAxis)
                .setIn(["formOptions", "zAxisLabel"], axisLabels[2])
                .set("displayOptions", chartModel.get("displayOptions").mergeDeep(cleverOptions));
            return state.setIn(["charts", action.id], chart);
        } else if (action.formOptions.datasetType === appStrings.CHART_DATASET_TYPE_SATELLITE) {
            let chartType = appStrings.CHART_TYPES.SINGLE_SERIES;
            let title = action.formOptions.selectedTracks.map((track) => track.title).join(", ");

            // try to be clever with defaults
            let cleverOptions = {};
            cleverOptions.markerType = appStrings.PLOT_STYLES.TIME_SERIES.LINES_AND_DOTS;

            let chart = chartModel
                .set("id", action.id)
                .set("title", title)
                .set("nodeId", "chartWrapper_" + action.id)
                .set("data", [])
                .set("dataLoading", true)
                .set("dataStore", action.dataStore)
                .set("urls", action.urls)
                .set("chartType", chartType)
                .setIn(["dataError", "error"], false)
                .setIn(["dataError", "message"], "")
                .setIn(
                    ["formOptions", "selectedTracks"],
                    Immutable.List(action.formOptions.selectedTracks)
                )
                .setIn(["formOptions", "satelliteChartType"], action.formOptions.satelliteChartType)
                .setIn(["formOptions", "xAxis"], action.formOptions.xAxis || "")
                .setIn(["formOptions", "xAxisLabel"], action.formOptions.xAxisLabel || "")
                .setIn(["formOptions", "yAxis"], action.formOptions.yAxis || "")
                .setIn(["formOptions", "yAxisLabel"], action.formOptions.yAxisLabel || "")
                .setIn(["formOptions", "datasetType"], appStrings.CHART_DATASET_TYPE_SATELLITE)
                .setIn(["formOptions", "selectedArea"], action.formOptions.selectedArea)
                .setIn(["formOptions", "startDate"], action.formOptions.startDate)
                .setIn(["formOptions", "endDate"], action.formOptions.endDate)
                // no zaxis support for satellite chart data
                .set("displayOptions", chartModel.get("displayOptions").mergeDeep(cleverOptions));
            return state.setIn(["charts", action.id], chart);
        } else if (action.formOptions.datasetType === appStrings.CHART_DATASET_TYPE_CDMS) {
            let chartType = appStrings.CHART_TYPES.SINGLE_SERIES;
            // let title = action.formOptions.selectedTracks.map((track) => track.title).join(", ");
            let title = "CDMS Demo Chart";

            // try to be clever with defaults
            let cleverOptions = {};
            cleverOptions.markerType = appStrings.PLOT_STYLES.TIME_SERIES.DOTS;

            let chart = chartModel
                .set("id", action.id)
                .set("title", title)
                .set("nodeId", "chartWrapper_" + action.id)
                .set("data", [])
                .set("dataStore", action.dataStore)
                .set("urls", action.urls)
                .set("chartType", chartType)
                .setIn(["dataError", "error"], false)
                .setIn(["dataError", "message"], "")

                .setIn(["formOptions", "datasetType"], appStrings.CHART_DATASET_TYPE_CDMS)
                .setIn(
                    ["formOptions", "selectedTracks"],
                    Immutable.List([
                        action.formOptions.cdmsOptions.primaryDataset,
                        action.formOptions.cdmsOptions.secondaryDataset,
                    ])
                )
                .setIn(["formOptions", "selectedArea"], action.formOptions.cdmsOptions.area)
                .setIn(["formOptions", "startDate"], action.formOptions.cdmsOptions.startDate)
                .setIn(["formOptions", "endDate"], action.formOptions.cdmsOptions.endDate)
                .setIn(["formOptions", "cdmsOptions"], action.formOptions.cdmsOptions)

                .setIn(["formOptions", "xAxis"], action.formOptions.xAxis || "")
                .setIn(["formOptions", "xAxisLabel"], action.formOptions.xAxisLabel || "")
                .setIn(["formOptions", "yAxis"], action.formOptions.yAxis || "")
                .setIn(["formOptions", "yAxisLabel"], action.formOptions.yAxisLabel || "")

                .set("displayOptions", chartModel.get("displayOptions").mergeDeep(cleverOptions));
            return state.setIn(["charts", action.id], chart);
        } else {
            console.warn("ERROR unrecognized chart dataset type");
        }
    }

    static updateChartData(state, action) {
        if (action.data.error) {
            return state
                .setIn(["charts", action.id, "dataLoading"], false)
                .setIn(["charts", action.id, "dataError", "error"], true)
                .setIn(["charts", action.id, "dataError", "message"], action.data.message);
        } else {
            state = state
                .setIn(["charts", action.id, "data"], action.data)
                .setIn(
                    ["charts", action.id, "formOptions"],
                    state
                        .getIn(["charts", action.id, "formOptions"])
                        .mergeDeep(Immutable.fromJS(action.formOptions))
                );
            return state;
        }
    }

    static setChartLoading(state, action) {
        return state.setIn(["charts", action.id, "dataLoading"], action.isLoading);
    }

    static setChartWarning(state, action) {
        return state
            .setIn(["charts", action.id, "warning", "active"], action.active)
            .setIn(["charts", action.id, "warning", "text"], action.text || "");
    }

    static setChartDisplayOptions(state, action) {
        let displayOptions = state
            .getIn(["charts", action.id, "displayOptions"])
            .mergeDeep(Immutable.fromJS(action.displayOptions));
        state = state.setIn(["charts", action.id, "displayOptions"], displayOptions);

        return state;
    }

    static closeChart(state, action) {
        return state.deleteIn(["charts", action.id]);
    }

    static setChartFormError(state, action) {
        return state;
    }

    static setChartFormVariableOptions(state, action) {
        return state
            .setIn(["formOptions", "variables", "shared"], action.sharedVariableSet)
            .setIn(["formOptions", "variables", "nonshared"], action.nonsharedVariableSet);
    }

    static setCDMSChartingOptions(state, action) {
        return state.set("cdmsCharting", state.get("cdmsCharting").mergeDeep(action.options));
    }

    static setCDMSTrackSelected(state, action) {
        const { trackId, isSelected, isPrimary } = action;

        if (isSelected) {
            state = state.setIn(
                ["cdmsCharting", "formOptions", isPrimary ? "primaryDataset" : "secondaryDataset"],
                trackId
            );
        } else {
            const primaryPath = ["cdmsCharting", "formOptions", "primaryDataset"];
            const secondaryPath = ["cdmsCharting", "formOptions", "secondaryDataset"];
            if (state.getIn(primaryPath) === trackId || isPrimary) {
                state = state.setIn(primaryPath, undefined);
            }
            if (state.getIn(secondaryPath) === trackId && !isPrimary) {
                state = state.setIn(secondaryPath, undefined);
            }
        }

        return state;
    }
}
