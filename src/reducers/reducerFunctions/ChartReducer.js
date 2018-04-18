import Immutable from "immutable";
import { chartModel } from "reducers/models/chart";
import appConfig from "constants/appConfig";
import * as appStrings from "constants/appStrings";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class ChartReducer {
    static setSelectedDatasets(state, action) {
        return state;
    }

    static setXAxisVariable(state, action) {
        return state;
    }

    static setYAxisVariable(state, action) {
        return state;
    }

    static setZAxisVariable(state, action) {
        return state;
    }

    static initializeChart(state, action) {
        let chartType = appStrings.CHART_TYPES.SINGLE_SERIES;
        if (typeof action.formOptions.zAxis !== "undefined") {
            if (action.formOptions.datasets.length !== 1) {
                chartType = appStrings.CHART_TYPES.MULTI_SERIES_WITH_COLOR;
            } else {
                chartType = appStrings.CHART_TYPES.SINGLE_SERIES_WITH_COLOR;
            }
        } else if (action.formOptions.datasets.length !== 1) {
            chartType = appStrings.CHART_TYPES.MULTI_SERIES;
        }

        let chart = chartModel
            .set("id", action.id)
            .set("nodeId", "chartWrapper_" + action.id)
            .set("data", [])
            .set("dataStore", action.dataStore)
            .set("chartType", chartType)
            .setIn(["dataError", "error"], false)
            .setIn(["dataError", "message"], "")
            .setIn(["formOptions", "datasets"], Immutable.List(action.formOptions.datasets))
            .setIn(["formOptions", "xAxis"], action.formOptions.xAxis)
            .setIn(["formOptions", "yAxis"], action.formOptions.yAxis)
            .setIn(["formOptions", "zAxis"], action.formOptions.zAxis);
        return state.setIn(["charts", action.id], chart);
    }

    static updateChartData(state, action) {
        if (action.data.error) {
            return state
                .setIn(["charts", action.id, "dataLoading"], false)
                .setIn(["charts", action.id, "dataError", "error"], true)
                .setIn(["charts", action.id, "dataError", "message"], action.data.message);
        } else {
            state = state.setIn(["charts", action.id, "data"], action.data);
            if (typeof action.meta !== "undefined") {
                state = state.setIn(["charts", action.id, "dataMeta"], action.meta);
            }
            return state;
        }
    }

    static setChartLoading(state, action) {
        return state.setIn(["charts", action.id, "dataLoading"], action.isLoading);
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
}
