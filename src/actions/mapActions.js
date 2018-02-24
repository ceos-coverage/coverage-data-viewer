import * as types from "constants/actionTypes";

export function setInsituLayerColor(layer, color) {
    return { type: types.SET_INSITU_LAYER_COLOR, layer, color };
}

export function zoomToLayer(layer) {
    return { type: types.ZOOM_TO_LAYER, layer };
}
