/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import * as types from "constants/actionTypes";
import * as typesCore from "_core/constants/actionTypes";
import * as appActions from "actions/appActions";
import * as chartActions from "actions/chartActions";
import { WMTSUtil } from "utils/WMTSUtil";

export function addLayer(layer, setActive = true) {
    return (dispatch) => {
        const capUrl = layer.insituMeta.get("service_url");
        const handleAs = layer.handleAs;
        const tileTypes = [
            appStringsCore.LAYER_GIBS_RASTER,
            appStrings.LAYER_WMS_TILE_RASTER,
            appStringsCore.LAYER_WMS_RASTER,
        ];
        if (tileTypes.indexOf(handleAs) !== -1 && capUrl) {
            WMTSUtil.getWMTSData(capUrl)
                .then((configString) => {
                    if (configString) {
                        const isWMS =
                            [
                                appStrings.LAYER_WMS_TILE_RASTER,
                                appStringsCore.LAYER_WMS_RASTER,
                            ].indexOf(handleAs) != -1;
                        dispatch({
                            type: typesCore.INGEST_LAYER_CONFIG,
                            config: configString,
                            options: {
                                url: capUrl,
                                type: isWMS
                                    ? appStringsCore.LAYER_CONFIG_WMS_XML
                                    : appStringsCore.LAYER_CONFIG_WMTS_XML,
                            },
                        });

                        dispatch({ type: types.ADD_LAYER, layer, setActive });

                        if (layer.palette.url) {
                            let p;
                            if (layer.palette.handleAs === appStrings.COLORBAR_GIBS_XML) {
                                p = WMTSUtil.getGIBSColormapFromURL(layer.palette.url, layer.id);
                            } else {
                                p = WMTSUtil.getGIBSColormapFromCapabilities(configString, {
                                    layer: layer.id,
                                });
                            }
                            p.then((palette) => {
                                dispatch({
                                    type: typesCore.INGEST_LAYER_PALETTES,
                                    paletteConfig: { paletteArray: [palette] },
                                });
                                dispatch({
                                    type: types.UPDATE_LAYER,
                                    layer: Immutable.fromJS({
                                        id: layer.id,
                                        type: layer.type,
                                        units: palette.units,
                                        palette: {
                                            name: palette.name,
                                            handleAs: palette.handleAs,
                                            min: palette.min,
                                            max: palette.max,
                                        },
                                    }),
                                });
                            }).catch((err) => {
                                console.warn(err);
                            });
                        }
                    }
                })
                .catch((err) => {
                    console.warn(err);
                    dispatch({ type: types.ADD_LAYER, layer, setActive });
                });
        } else {
            dispatch({ type: types.ADD_LAYER, layer, setActive });
        }
    };
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
    return (dispatch) => {
        dispatch(appActions.setSearchSelectedArea(area, geometryType));
    };
}

export function setDate(date) {
    return (dispatch) => {
        dispatch({ type: typesCore.SET_MAP_DATE, date });

        dispatch(chartActions.updateDateLinkedCharts());
    };
}

export function stepDate(forward) {
    return (dispatch, getState) => {
        let state = getState();
        let size = state.map.get("dateIntervalSize");
        let scale = state.map.get("dateIntervalScale");
        let date = moment.utc(state.map.get("date"));

        let nextDate = (forward ? date.add(size, scale) : date.subtract(size, scale)).toDate();

        dispatch(setDate(nextDate));
    };
}

export function setDateInterval(size, scale) {
    return (dispatch) => {
        dispatch({ type: types.SET_DATE_INTERVAL, size, scale });

        dispatch(chartActions.updateDateLinkedCharts());
    };
}

// set the animation component open or closed
export function setAnimationOpen(isOpen, updateRange = true) {
    return { type: types.SET_ANIMATION_OPEN, isOpen, updateRange };
}

// play or pause the animation
export function setAnimationPlaying(isPlaying) {
    return { type: types.SET_ANIMATION_PLAYING, isPlaying };
}

// stop playing, clear the buffer, reset the current date, etc
export function stopAnimation() {
    return { type: types.STOP_ANIMATION };
}

// step the animation forward or backward one frame
export function stepAnimation(forward) {
    return { type: types.STEP_ANIMATION, forward };
}

// set the start date for the animation
export function setAnimationStartDate(date) {
    return { type: types.SET_ANIMATION_START_DATE, date };
}

// set the end date of the animation
export function setAnimationEndDate(date) {
    return { type: types.SET_ANIMATION_END_DATE, date };
}

// set the date range of the animation
export function setAnimationDateRange(startDate, endDate) {
    return { type: types.SET_ANIMATION_DATE_RANGE, startDate, endDate };
}

// initialize and begin filling the animation buffer
export function fillAnimationBuffer(startDate, endDate, stepResolution, callback) {
    return { type: types.FILL_ANIMATION_BUFFER, startDate, endDate, stepResolution, callback };
}

// clear the animation buffer
export function emptyAnimationBuffer() {
    return { type: types.EMPTY_ANIMATION_BUFFER };
}

// check if the animation buffer is filled
export function checkBuffer() {
    return { type: types.CHECK_ANIMATION_BUFFER };
}

// check if the animation buffer is filled for the first time
export function checkInitialBuffer() {
    return { type: types.CHECK_INITIAL_ANIMATION_BUFFER };
}

// check if the next frame is loaded
export function checkNextFrame() {
    return { type: types.CHECK_NEXT_FRAME };
}

// update the delay between animation frames
export function setAnimationSpeed(speed) {
    return { type: types.SET_ANIMATION_SPEED, speed };
}

export function setInsituLayerTitles(titleField) {
    return { type: types.SET_INSITU_LAYER_TITLES, titleField };
}
