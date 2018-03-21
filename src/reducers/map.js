import * as actionTypes from "constants/actionTypes";
import { mapState } from "reducers/models/map";
import mapCore from "_core/reducers/map";
import MapReducer from "reducers/reducerFunctions/MapReducer";

export default function map(state = mapState, action, opt_reducer = MapReducer) {
    switch (action.type) {
        case actionTypes.SET_INSITU_LAYER_COLOR:
            return opt_reducer.setInsituVectorLayerColor(state, action);
        case actionTypes.ZOOM_TO_LAYER:
            return opt_reducer.zoomToLayer(state, action);
        default:
            return mapCore.call(this, state, action, opt_reducer);
    }
}
