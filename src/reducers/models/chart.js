import Immutable from "immutable";
import * as appStrings from "constants/appStrings";

export const chartModel = Immutable.fromJS({
    id: "",
    nodeId: "",
    dataStore: null,
    data: [],
    dataMeta: {},
    dataLoading: false,
    dataError: {
        error: false,
        message: ""
    },
    chartType: appStrings.CHART_TYPES.SINGLE_SERIES_WITH_COLOR,
    formOptions: {
        datasets: [],
        xAxis: "",
        yAxis: "",
        zAxis: ""
    },
    displayOptions: {
        isOpen: false,
        yAxisReversed: true,
        markerType: appStrings.PLOT_STYLES.TIME_SERIES.DOTS
    }
});

export const chartState = Immutable.fromJS({
    formOptions: chartModel
        .get("formOptions")
        .set("formErrors", {
            datasets: "",
            xAxis: "",
            yAxis: "",
            zAxis: ""
        })
        .toJS(),
    charts: Immutable.OrderedMap()
});
