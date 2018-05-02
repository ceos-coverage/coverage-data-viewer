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
        xAxis: "time",
        yAxis: "depth",
        zAxis: undefined
    },
    displayOptions: {
        isOpen: false,
        yAxisReversed: true,
        bounds: [],
        markerType: appStrings.PLOT_STYLES.TIME_SERIES.DOTS,
        decimationRate: appConfig.DEFAULT_DECIMATION_RATE
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
        .set("selectedTracks", Immutable.Set()),
    charts: Immutable.OrderedMap()
});
