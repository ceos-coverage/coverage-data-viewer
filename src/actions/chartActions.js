import Immutable from "immutable";
import * as appStrings from "constants/appStrings";
import * as types from "constants/actionTypes";
import DataStore from "utils/DataStore";
import ChartUtil from "utils/ChartUtil";
import TrackDataUtil from "utils/TrackDataUtil";
import appConfig from "constants/appConfig";

const sample_url = "http://localhost:3000/default-data/albacoreTunaData.csv";

export function setTrackSelected(trackId, isSelected) {
    return { type: types.SET_CHART_TRACK_SELECTED, trackId, isSelected };
}

export function setAxisVariable(axis, variable) {
    return { type: types.SET_AXIS_VARIABLE, axis, variable };
}

export function setChartFormError(key, value) {
    return { type: types.SET_CHART_FORM_ERROR, key, value };
}

export function closeChart(id) {
    return { type: types.CLOSE_CHART, id };
}

export function setChartDisplayOptions(id, displayOptions) {
    return { type: types.SET_CHART_DISPLAY_OPTIONS, id, displayOptions };
}

export function setChartLoading(id, isLoading) {
    return { type: types.SET_CHART_LOADING, id, isLoading };
}

export function createChart() {
    return (dispatch, getState) => {
        let state = getState();

        let formOptions = state.chart.get("formOptions");
        let trackIds = formOptions.get("selectedTracks");
        formOptions = formOptions.set(
            "selectedTracks",
            state.map
                .getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA])
                .filter(track => trackIds.contains(track.get("id")))
                .toList()
                .map(track => {
                    console.log(track);
                    return {
                        id: track.get("id"),
                        title: track.get("title"),
                        project: track.getIn(["insituMeta", "project"]),
                        source_id: track.getIn(["insituMeta", "source_id"])
                    };
                })
                .sortBy(track => track.title)
        );

        let urls = TrackDataUtil.getUrlsForQuery(
            formOptions.set("target", appConfig.DEFAULT_DECIMATION_RATE).toJS()
        );
        let dataStore = new DataStore({ workerManager: state.webWorker.get("workerManager") });
        let chartId = "chart_" + new Date().getTime();

        dispatch(initializeChart(chartId, formOptions.toJS(), urls, dataStore));
        dispatch(setChartLoading(chartId, true));

        state = getState();
        let chart = state.chart.getIn(["charts", chartId]);
        let decimationRate = chart.getIn(["displayOptions", "decimationRate"]);
        let xKey = chart.getIn(["formOptions", "xAxis"]);
        let yKey = chart.getIn(["formOptions", "yAxis"]);
        let zKey = chart.getIn(["formOptions", "zAxis"]);

        Promise.all(
            urls.map(url => {
                return dataStore.getData(
                    {
                        url: url,
                        processMeta: true
                    },
                    {
                        keys: { xKey, yKey, zKey },
                        target: -1,
                        format: "array"
                    }
                );
            })
        ).then(
            dataArrs => {
                dispatch(updateChartData(chartId, dataArrs));
                dispatch(setChartLoading(chartId, false));
            },
            err => {
                dispatch(
                    updateChartData(chartId, {
                        error: true,
                        message: "Failed to get chart data"
                    })
                );
                dispatch(setChartLoading(chartId, false));
            }
        );
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
            bounds: bounds
        });

        Promise.all(
            urls.map(url => {
                return dataStore.getData(
                    {
                        url: url,
                        no_cache: typeof bounds !== "undefined",
                        processMeta: true
                    },
                    {
                        keys: { xKey, yKey, zKey },
                        target: -1,
                        format: "array"
                    }
                );
            })
        )
            .then(dataArrs => {
                dispatch(updateChartData(chart.get("id"), dataArrs));
                dispatch(setChartLoading(chartId, false));
            })
            .catch(err => {
                dispatch(
                    updateChartData(chart.get("id"), {
                        error: true,
                        message: "Failed to get chart data"
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

export function updateChartData(id, data) {
    return { type: types.UPDATE_CHART_DATA, id, data };
}

export function exportChart(chartId) {
    return dispatch => {
        ChartUtil.downloadChartAsImage(
            { id: chartId },
            {
                filename: chartId,
                format: "image/png",
                width: 640
            }
        );
    };
}

export function updateAvailableVariables() {
    return (dispatch, getState) => {
        let state = getState();

        let trackList = state.map
            .getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA])
            .filter(track => !track.get("isDisabled") && track.get("isActive"))
            .toList();

        let sharedVariableSet =
            trackList.size > 0
                ? trackList.reduce((acc, track) => {
                      if (typeof acc === "undefined") {
                          return track.getIn(["insituMeta", "variables"]);
                      }
                      return acc.intersect(track.getIn(["insituMeta", "variables"]));
                  }, undefined)
                : Immutable.Set();

        let nonsharedVariableSet =
            trackList.size > 0
                ? trackList.reduce((acc, track) => {
                      if (typeof acc === "undefined") {
                          return track.getIn(["insituMeta", "variables"]);
                      }
                      return acc.subtract(track.getIn(["insituMeta", "variables"]));
                  }, undefined)
                : Immutable.Set();

        let currOptions = state.chart.get("formOptions");

        ["xAxis", "yAxis", "zAxis"].map(axis => {
            let currVal = currOptions.get(axis);
            if (typeof currVal !== "undefined" && !sharedVariableSet.contains(currVal)) {
                dispatch(setAxisVariable(axis, undefined));
            }
        });

        dispatch({
            type: types.SET_CHART_FORM_VARIABLE_OPTIONS,
            sharedVariableSet,
            nonsharedVariableSet
        });
    };
}

function initializeChart(id, formOptions, urls, dataStore) {
    return { type: types.INITIALIZE_CHART, id, formOptions, urls, dataStore };
}
