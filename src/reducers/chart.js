import { chartState } from "reducers/models/chart";
import ChartReducer from "reducers/reducerFunctions/ChartReducer";
import * as actionTypes from "constants/actionTypes";

export default function chart(state = chartState, action, opt_reducer = ChartReducer) {
    switch (action.type) {
        case actionTypes.SET_CHART_TRACK_SELECTED:
            return opt_reducer.setTrackSelected(state, action);

        case actionTypes.SET_X_AXIS_VARIABLE:
            return opt_reducer.setXAxisVariable(state, action);

        case actionTypes.SET_Y_AXIS_VARIABLE:
            return opt_reducer.setYAxisVariable(state, action);

        case actionTypes.SET_Z_AXIS_VARIABLE:
            return opt_reducer.setZAxisVariable(state, action);

        case actionTypes.INITIALIZE_CHART:
            return opt_reducer.initializeChart(state, action);

        case actionTypes.SET_CHART_DISPLAY_OPTIONS:
            return opt_reducer.setChartDisplayOptions(state, action);

        case actionTypes.CLOSE_CHART:
            return opt_reducer.closeChart(state, action);

        case actionTypes.SET_CHART_FORM_ERROR:
            return opt_reducer.setChartFormError(state, action);

        case actionTypes.UPDATE_CHART_DATA:
            return opt_reducer.updateChartData(state, action);

        case actionTypes.SET_CHART_LOADING:
            return opt_reducer.setChartLoading(state, action);

        default:
            return state;
    }
}
