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

    static initializeChart(state, action) {
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

        let title = action.formOptions.selectedTracks.map(track => track.title).join(", ");

        // try to be clever with defaults
        let cleverOptions = {};
        if (action.formOptions.xAxis.indexOf("time") !== -1) {
            cleverOptions.markerType = appStrings.PLOT_STYLES.TIME_SERIES.LINES_AND_DOTS;
        }
        if (action.formOptions.yAxis.indexOf("depth") !== -1) {
            cleverOptions.yAxisReversed = true;
        }

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
            .setIn(["formOptions", "yAxis"], action.formOptions.yAxis)
            .setIn(["formOptions", "zAxis"], action.formOptions.zAxis)
            .set("displayOptions", chartModel.get("displayOptions").mergeDeep(cleverOptions));
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

    static setChartFormVariableOptions(state, action) {
        return state
            .setIn(["formOptions", "variables", "shared"], action.sharedVariableSet)
            .setIn(["formOptions", "variables", "nonshared"], action.nonsharedVariableSet);
    }
}
