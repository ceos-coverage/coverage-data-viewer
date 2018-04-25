import * as appStrings from "constants/appStrings";
import * as types from "constants/actionTypes";
import DataStore from "utils/DataStore";
import ChartUtil from "utils/ChartUtil";
import TrackDataUtil from "utils/TrackDataUtil";

const sample_url = "http://localhost:3000/default-data/albacoreTunaData.csv";

export function setTrackSelected(trackId, isSelected) {
    return { type: types.SET_CHART_TRACK_SELECTED, trackId, isSelected };
}

export function setXAxisVariable(variable) {
    return { type: types.SET_X_AXIS_VARIABLE, variable };
}

export function setYAxisVariable(variable) {
    return { type: types.SET_Y_AXIS_VARIABLE, variable };
}

export function setZAxisVariable(variable) {
    return { type: types.SET_Z_AXIS_VARIABLE, variable };
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

        let formOptions = state.chart.get("formOptions").toJS();
        formOptions.selectedTracks = formOptions.selectedTracks.reduce((acc, trackId) => {
            let layer = state.map.getIn([
                "layers",
                appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
                trackId
            ]);
            acc.push({
                id: trackId,
                title: layer.get("title"),
                project: layer.getIn(["metadata", "project"]),
                source_id: layer.getIn(["metadata", "source_id"])
            });
            return acc;
        }, []);

        let urls = TrackDataUtil.getUrlsForQuery(formOptions);
        let dataStore = new DataStore({ workerManager: state.webWorker.get("workerManager") });
        let chartId = "chart_" + new Date().getTime();

        dispatch(initializeChart(chartId, formOptions, urls, dataStore));
        dispatch(setChartLoading(chartId, true));

        state = getState();
        let chart = state.chart.getIn(["charts", chartId]);
        let decimationRate = chart.getIn(["displayOptions", "decimationRate"]);
        let xKey = chart.getIn(["formOptions", "xAxis"]);
        let yKey = chart.getIn(["formOptions", "yAxis"]);
        let zKey = chart.getIn(["formOptions", "zAxis"]);
        let dataPromises = urls.map(url => {
            return dataStore.getData(
                {
                    url: url,
                    processMeta: true
                },
                {
                    keys: { xKey, yKey, zKey },
                    target: decimationRate,
                    format: "array"
                }
            );
        });

        Promise.all(dataPromises).then(
            dataArrs => {
                let data = dataArrs[0];
                console.log(data);
                dispatch(updateChartData(chartId, data[0], data[1]));
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
        let urls = chart.get("urls");
        let decimationRate = chart.getIn(["displayOptions", "decimationRate"]);
        let xKey = chart.getIn(["formOptions", "xAxis"]);
        let yKey = chart.getIn(["formOptions", "yAxis"]);
        let zKey = chart.getIn(["formOptions", "zAxis"]);

        let dataPromises = urls.map(url => {
            return dataStore.getData(
                {
                    url: url
                },
                {
                    keys: { xKey, yKey, zKey },
                    target: decimationRate,
                    xRange: bounds,
                    format: "array"
                }
            );
        });
        Promise.all(dataPromises).then(
            dataArrs => {
                let data = dataArrs[0];
                dispatch(updateChartData(chart.get("id"), data[0], data[1]));
                dispatch(setChartLoading(chartId, false));
            },
            err => {
                dispatch(
                    updateChartData(chart.get("id"), {
                        error: true,
                        message: "Failed to get chart data"
                    })
                );
                dispatch(setChartLoading(chartId, false));
            }
        );
    };
}

export function setChartDecimationRate(chartId, decimationRate) {
    return (dispatch, getState) => {
        dispatch(setChartDisplayOptions(chartId, { decimationRate: decimationRate }));

        let state = getState();
        let chart = state.chart.getIn(["charts", chartId]);
        let bounds =
            typeof chart.getIn(["displayOptions", "bounds"]) === "object"
                ? chart.getIn(["displayOptions", "bounds"]).toJS()
                : undefined;

        dispatch(zoomChartData(chartId, bounds));
    };
}

export function updateChartData(id, data, meta) {
    return { type: types.UPDATE_CHART_DATA, id, data, meta };
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

function initializeChart(id, formOptions, urls, dataStore) {
    return { type: types.INITIALIZE_CHART, id, formOptions, urls, dataStore };
}
