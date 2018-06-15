import * as types from "constants/actionTypes";
import * as appActions from "actions/appActions";
import * as mapActions from "_core/actions/mapActions";
import moment from "moment";

export function addLayer(layer, setActive = true) {
    return { type: types.ADD_LAYER, layer, setActive };
}

export function removeLayer(layer) {
    return { type: types.REMOVE_LAYER, layer };
}

export function setLayerLoading(layer, isLoading) {
    return { type: types.SET_LAYER_LOADING, layer, isLoading };
}

export function setInsituLayerColor(layer, color) {
    return { type: types.SET_INSITU_LAYER_COLOR, layer, color };
}

export function zoomToLayer(layer) {
    return (dispatch, getState) => {
        let state = getState();
        let pad = state.view.get("isMainMenuOpen");
        dispatch({ type: types.ZOOM_TO_LAYER, layer, pad });
    };
}

export function enableAreaSelection(geometryType) {
    return { type: types.ENABLE_AREA_SELECTION, geometryType };
}

export function disableAreaSelection() {
    return { type: types.DISABLE_AREA_SELECTION };
}

export function removeAllAreaSelections() {
    return { type: types.REMOVE_ALL_AREA_SELECTIONS };
}

export function removeGeometryFromMap(geometry, interactionType) {
    return { type: types.REMOVE_GEOMETRY_FROM_MAP, geometry, interactionType };
}

export function setSelectedArea(area, geometryType) {
    return dispatch => {
        dispatch(appActions.setSearchSelectedArea(area, geometryType));
    };
}

export function stepDate(forward) {
    return (dispatch, getState) => {
        let state = getState();
        let size = state.map.get("dateIntervalSize");
        let scale = state.map.get("dateIntervalScale");
        let date = moment.utc(state.map.get("date"));

        let nextDate = (forward ? date.add(size, scale) : date.subtract(size, scale)).toDate();

        dispatch(mapActions.setDate(nextDate));
    };
}

export function setDateInterval(size, scale) {
    return { type: types.SET_DATE_INTERVAL, size, scale };
}
