import Immutable from "immutable";
import appConfig from "constants/appConfig";
import * as appStrings from "constants/appStrings";

export const chartModel = Immutable.fromJS({
    id: "",
    nodeId: "",
    title: "",
    dataStore: null,
    data: [],
    urls: [],
    dataLoading: false,
    dataError: {
        error: false,
        message: ""
    },
    chartType: appStrings.CHART_TYPES.SINGLE_SERIES,
    formOptions: {
        selectedTracks: [],
        xAxis: undefined,
        yAxis: undefined,
        zAxis: undefined
    },
    displayOptions: {
        isOpen: false,
        yAxisReversed: false,
        bounds: [],
        markerType: appStrings.PLOT_STYLES.TIME_SERIES.DOTS,
        decimationRate: appConfig.DEFAULT_DECIMATION_RATE,
        useCustomYAxisBounds: false,
        customYMin: 0,
        customYMax: 0,
        useCustomZAxisBounds: false,
        customZMin: 0,
        customZMax: 0
    }
});

export const chartState = Immutable.fromJS({
    formOptions: chartModel
        .get("formOptions")
        .set("formErrors", {
            selectedTracks: "",
            xAxis: "",
            yAxis: "",
            zAxis: ""
        })
        .set("selectedTracks", Immutable.Set())
        .set(
            "variables",
            Immutable.Map({
                shared: Immutable.Set(),
                nonshared: Immutable.Set()
            })
        ),
    charts: Immutable.OrderedMap()
});
