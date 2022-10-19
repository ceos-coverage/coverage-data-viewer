/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import * as types from "constants/actionTypes";
import DataStore from "utils/DataStore";
import ChartUtil from "utils/ChartUtil";
import TrackDataUtil from "utils/TrackDataUtil";
import DAGDataUtil from "utils/DAGDataUtil";
import appConfig from "constants/appConfig";

export function setTrackSelected(trackId, isSelected) {
    return (dispatch) => {
        dispatch({ type: types.SET_CHART_TRACK_SELECTED, trackId, isSelected });
        dispatch(updateAvailableVariables());
    };
}

export function setAxisVariable(axis, variable) {
    return { type: types.SET_AXIS_VARIABLE, axis, variable };
}

export function setChartDatasetType(datasetType) {
    return (dispatch) => {
        dispatch({ type: types.SET_CHART_DATASET_TYPE, datasetType });
        dispatch(clearSelectedTracks());
    };
}

export function setSatelliteChartType(chartType) {
    return { type: types.SET_CHART_SATELLITE_CHART_TYPE, chartType };
}

export function clearSelectedTracks() {
    return (dispatch) => {
        dispatch({ type: types.CLEAR_CHART_TRACKS_SELECTED });
        dispatch(updateAvailableVariables());
    };
}

export function setChartFormError(key, value) {
    return { type: types.SET_CHART_FORM_ERROR, key, value };
}

export function closeChart(id) {
    return { type: types.CLOSE_CHART, id };
}

export function setChartDisplayOptions(id, displayOptions) {
    return (dispatch) => {
        dispatch({ type: types.SET_CHART_DISPLAY_OPTIONS, id, displayOptions });

        if (typeof displayOptions.linkToDateInterval !== "undefined") {
            dispatch(updateDateLinkedCharts(id));
        }

        if (
            typeof displayOptions.decimationRate !== "undefined" &&
            (typeof displayOptions.linkToDateInterval === "undefined" ||
                displayOptions.linkToDateInterval === false)
        ) {
            dispatch(refreshChart(id));
        }
    };
}

export function setChartLoading(id, isLoading) {
    return { type: types.SET_CHART_LOADING, id, isLoading };
}

export function createChart() {
    return (dispatch, getState) => {
        let state = getState();

        let formOptions = state.chart.get("formOptions");
        let trackIds = formOptions.get("selectedTracks");
        if (formOptions.get("datasetType") === appStrings.CHART_DATASET_TYPE_INSITU) {
            formOptions = formOptions.set(
                "selectedTracks",
                state.map
                    .getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA])
                    .filter((track) => trackIds.contains(track.get("id")))
                    .toList()
                    .map((track) => {
                        let title =
                            track.get("title").size > 0
                                ? track.getIn(["title", 0])
                                : track.get("title");
                        return {
                            id: track.get("id"),
                            title: `${title} (id: ${track.get("shortId")})`,
                            program: track.getIn(["insituMeta", "program"]),
                            project: track.getIn(["insituMeta", "project"]),
                            source_id: track.getIn(["insituMeta", "source_id"]),
                        };
                    })
                    .sortBy((track) => track.title)
            );
        } else {
            formOptions = formOptions
                .set(
                    "selectedTracks",
                    state.map
                        .getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_DATA])
                        .filter((layer) => trackIds.contains(layer.get("id")))
                        .toList()
                        .map((layer) => {
                            return {
                                id: layer.get("id"),
                                title: layer.get("title"),
                                colormap: layer.getIn(["palette", "url"]),
                            };
                        })
                        .sortBy((layer) => layer.title)
                )
                .set(
                    "selectedArea",
                    state.view.getIn(["layerSearch", "formOptions", "selectedArea"])
                )
                .set("startDate", state.subsetting.get("startDate"))
                .set("endDate", state.subsetting.get("endDate"));
        }
        dispatch(createChartFromOptions(formOptions));
    };
}

export function createChartFromOptions(formOptions, displayOptions) {
    return (dispatch, getState) => {
        let state = getState();
        if (formOptions.get("datasetType") === appStrings.CHART_DATASET_TYPE_INSITU) {
            let urls = TrackDataUtil.getUrlsForQuery(
                formOptions.set("target", appConfig.DEFAULT_DECIMATION_RATE).toJS()
            );
            let dataStore = new DataStore({ workerManager: state.webWorker.get("workerManager") });
            let chartId = "chart_" + new Date().getTime();

            dispatch(initializeChart(chartId, formOptions.toJS(), urls, dataStore));
            dispatch(setChartLoading(chartId, true));

            state = getState();
            let chart = state.chart.getIn(["charts", chartId]);
            let xKey = chart.getIn(["formOptions", "xAxis"]);
            let yKey = chart.getIn(["formOptions", "yAxis"]);
            let zKey = chart.getIn(["formOptions", "zAxis"]);

            Promise.all(
                urls.map((url) => {
                    return dataStore.getData(
                        {
                            url: url,
                            formatColumns: true,
                            processMeta: true,
                        },
                        {
                            keys: { xKey, yKey, zKey },
                            target: -1,
                        }
                    );
                })
            ).then(
                (dataArrs) => {
                    console.log("chart data arrays", dataArrs);
                    dispatch(updateChartData(chartId, dataArrs));
                    dispatch(setChartLoading(chartId, false));
                    if (displayOptions) {
                        const { bounds, ...rest } = displayOptions;
                        dispatch(setChartDisplayOptions(chartId, rest));
                        if (bounds) {
                            dispatch(zoomChartData(chartId, bounds));
                        }
                    }
                },
                (err) => {
                    dispatch(
                        updateChartData(chartId, {
                            error: true,
                            message: "Failed to get chart data",
                        })
                    );
                    dispatch(setChartLoading(chartId, false));
                }
            );
        } else {
            const jsOptions = formOptions.toJS();
            let urls = DAGDataUtil.getUrlsForQuery(jsOptions);
            let dataStore = new DataStore({ workerManager: state.webWorker.get("workerManager") });
            let chartId = "chart_" + new Date().getTime();

            dispatch(initializeChart(chartId, jsOptions, urls, dataStore));
            dispatch(setChartLoading(chartId, true));

            state = getState();
            Promise.all(
                urls.map((url) => {
                    return dataStore.getData(
                        {
                            url: url,
                            formatColumns: false,
                            processMeta: false,
                        },
                        {
                            target: -1,
                            sourceFormat: appStrings.DAG_DATA_FORMAT,
                        }
                    );
                })
            ).then(
                (dataArrs) => {
                    console.log(dataArrs);
                    // because the we didn't get proper form options pre-query, we remove the current chart and
                    // initialize a new one with the proper form options
                    const newFormOptions = formOptions
                        .mergeDeep(DAGDataUtil.deriveFormOptions(dataArrs))
                        .toJS();
                    dispatch(closeChart(chartId));
                    dispatch(initializeChart(chartId, newFormOptions, urls, dataStore));
                    dispatch(setChartLoading(chartId, true));

                    // update the new chart with the newly arrived data
                    dispatch(updateChartData(chartId, dataArrs));
                    dispatch(setChartLoading(chartId, false));
                    if (displayOptions) {
                        dispatch(setChartDisplayOptions(chartId, displayOptions));
                    }
                },
                (err) => {
                    console.log(err);
                    dispatch(
                        updateChartData(chartId, {
                            error: true,
                            message: "Failed to get chart data",
                        })
                    );
                    dispatch(setChartLoading(chartId, false));
                }
            );
        }
    };
}

export function zoomChartData(chartId, bounds) {
    return (dispatch, getState) => {
        dispatch(setChartLoading(chartId, true));
        dispatch(setChartDisplayOptions(chartId, { bounds: bounds }));

        let state = getState();
        let chart = state.chart.getIn(["charts", chartId]);
        let dataStore = chart.get("dataStore");
        let decimationRate = chart.getIn(["displayOptions", "decimationRate"]);
        let selectedTracks = chart.getIn(["formOptions", "selectedTracks"]);
        let xKey = chart.getIn(["formOptions", "xAxis"]);
        let yKey = chart.getIn(["formOptions", "yAxis"]);
        let zKey = chart.getIn(["formOptions", "zAxis"]);

        let urls = TrackDataUtil.getUrlsForQuery({
            selectedTracks: selectedTracks.toJS(),
            xAxis: xKey,
            yAxis: yKey,
            zAxis: zKey,
            target: decimationRate,
            bounds: bounds,
        });

        Promise.all(
            urls.map((url) => {
                return dataStore.getData(
                    {
                        url: url,
                        no_cache: typeof bounds !== "undefined",
                        processMeta: true,
                        formatColumns: true,
                    },
                    {
                        keys: { xKey, yKey, zKey },
                        target: -1,
                    }
                );
            })
        )
            .then((dataArrs) => {
                dispatch(updateChartData(chart.get("id"), dataArrs));
                dispatch(setChartLoading(chartId, false));
            })
            .catch((err) => {
                dispatch(
                    updateChartData(chart.get("id"), {
                        error: true,
                        message: "Failed to get chart data",
                    })
                );
                dispatch(setChartLoading(chartId, false));
            });
    };
}

export function refreshChart(chartId) {
    return (dispatch, getState) => {
        let state = getState();
        let chart = state.chart.getIn(["charts", chartId]);
        let bounds =
            typeof chart.getIn(["displayOptions", "bounds"]) === "object"
                ? chart.getIn(["displayOptions", "bounds"]).toJS()
                : undefined;

        dispatch(zoomChartData(chartId, bounds));
    };
}

export function updateChartData(id, data, formOptions = {}) {
    return { type: types.UPDATE_CHART_DATA, id, data, formOptions };
}

export function exportChart(chartId) {
    return (dispatch) => {
        ChartUtil.downloadChartAsImage(
            { id: chartId },
            {
                filename: chartId,
                format: "image/png",
                width: 640,
            }
        );
    };
}

export function updateAvailableVariables() {
    return (dispatch, getState) => {
        let state = getState();

        let formOptions = state.chart.get("formOptions");
        let trackIds = formOptions.get("selectedTracks");

        let trackList = state.map
            .getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA])
            .filter(
                (track) =>
                    !track.get("isDisabled") &&
                    track.get("isActive") &&
                    trackIds.contains(track.get("id"))
            )
            .toList();

        let sharedVariableSet =
            trackList.size > 0
                ? trackList.reduce((acc, track) => {
                      if (typeof acc === "undefined") {
                          return track.getIn(["insituMeta", "variables"]).toSet();
                      }
                      return acc.intersect(track.getIn(["insituMeta", "variables"]).toSet());
                  }, undefined)
                : Immutable.Set();

        let nonsharedVariableSet =
            trackList.size > 0
                ? trackList.reduce((acc, track) => {
                      if (typeof acc === "undefined") {
                          return track.getIn(["insituMeta", "variables"]).toSet();
                      }
                      return acc.subtract(track.getIn(["insituMeta", "variables"]).toSet());
                  }, undefined)
                : Immutable.Set();

        let sharedVariableList = sharedVariableSet.map((x) => x.get("label")).toList();
        ["xAxis", "yAxis", "zAxis"].map((axis) => {
            let currVal = formOptions.get(axis);
            if (typeof currVal !== "undefined" && !sharedVariableList.contains(currVal)) {
                dispatch(setAxisVariable(axis, undefined));
            }
        });

        dispatch({
            type: types.SET_CHART_FORM_VARIABLE_OPTIONS,
            sharedVariableSet,
            nonsharedVariableSet,
        });
    };
}

export function updateDateLinkedCharts(chartId = undefined, bounds = []) {
    return (dispatch, getState) => {
        let state = getState();

        // attempt to extract dates
        if (bounds && bounds.length === 2) {
            bounds = bounds.map((val) => {
                let d = moment.utc(val);
                if (d.isValid()) {
                    return d.valueOf();
                }
                return undefined;
            });
        } else {
            let date = moment.utc(state.map.get("date"));
            let intervalDate = moment.utc(state.map.get("intervalDate"));
            bounds = [intervalDate.valueOf(), date.valueOf()];
        }

        // update all charts or just a specific chart
        if (typeof chartId !== "undefined") {
            let chart = state.chart.getIn(["charts", chartId]);
            let node = document.getElementById(chart.get("nodeId"));
            if (typeof node !== "undefined") {
                if (chart.getIn(["displayOptions", "linkToDateInterval"])) {
                    ChartUtil.setAxisBounds(node, "xAxis", bounds);
                    ChartUtil.setZoomEnabled(node, false);
                } else {
                    ChartUtil.setZoomEnabled(node, true);
                }
            }
        } else {
            state.chart.get("charts").forEach((chart, chartId) => {
                if (chart.getIn(["displayOptions", "linkToDateInterval"])) {
                    let node = document.getElementById(chart.get("nodeId"));
                    if (typeof node !== "undefined") {
                        ChartUtil.setAxisBounds(node, "xAxis", bounds);
                    }
                }
            });
        }
    };
}

export function blockChartAnimationUpdates(shouldBlock = true) {
    return (dispatch, getState) => {
        let state = getState();

        if (shouldBlock) {
            state.chart.get("charts").forEach((chart, chartId) => {
                if (chart.getIn(["displayOptions", "linkToDateInterval"])) {
                    dispatch({
                        type: types.SET_CHART_WARNING,
                        id: chartId,
                        active: true,
                        text: "Linking Unavailable During Animation",
                    });
                }
            });
        } else {
            state.chart.get("charts").forEach((chart, chartId) => {
                dispatch({
                    type: types.SET_CHART_WARNING,
                    id: chartId,
                    active: false,
                    text: "",
                });
            });
        }
    };
}

function initializeChart(id, formOptions, urls, dataStore) {
    return { type: types.INITIALIZE_CHART, id, formOptions, urls, dataStore };
}
