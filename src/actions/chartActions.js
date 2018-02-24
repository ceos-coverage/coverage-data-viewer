import * as appStrings from "constants/appStrings";
import * as types from "constants/actionTypes";
import DataStore from "utils/DataStore";
import ChartUtil from "utils/ChartUtil";

const url = "http://localhost:3000/default-data/albacoreTunaData.csv";
const xKey = "Time";
const yKey = "Depth";
const zKey = "Ext_Temp";
const targetPointNum = 20000;

export function setSelectedDatasets(ids) {
    return { type: types.SET_PRIMARY_DATASET_ID, ids };
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
    return {
        type: types.CLOSE_CHART,
        id
    };
}

export function setChartDisplayOptions(id, displayOptions) {
    return { type: types.SET_CHART_DISPLAY_OPTIONS, id, displayOptions };
}

export function setChartLoading(id, isLoading) {
    return { type: types.SET_CHART_LOADING, id, isLoading };
}

export function createChart(formOptions) {
    return (dispatch, getState) => {
        let state = getState();

        let dataStore = new DataStore({ workerManager: state.webWorker.get("workerManager") });
        let chartId = "chart_" + new Date().getTime();

        dispatch(initializeChart(chartId, formOptions, dataStore));
        dispatch(setChartLoading(chartId, true));

        dataStore
            .getData(
                {
                    url: url,
                    processMeta: true
                },
                {
                    keys: { xKey: xKey, yKey: yKey, zKey: zKey },
                    target: targetPointNum,
                    format: "array"
                }
            )
            .then(
                data => {
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
        let state = getState();
        let chart = state.chart.getIn(["charts", chartId]);

        let dataStore = chart.get("dataStore");
        dispatch(setChartLoading(chartId, true));
        dataStore
            .getData(
                {
                    url: url
                },
                {
                    keys: { xKey: xKey, yKey: yKey, zKey: zKey },
                    target: targetPointNum,
                    xRange: bounds,
                    format: "array"
                }
            )
            .then(
                data => {
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

function initializeChart(id, formOptions, dataStore) {
    return { type: types.INITIALIZE_CHART, id, formOptions, dataStore };
}
