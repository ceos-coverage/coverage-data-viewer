/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import * as types from "constants/actionTypes";
import * as mapActions from "actions/mapActions";
import * as chartActions from "actions/chartActions";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import Ol_Format_WMTSCapabilities from "ol/format/wmtscapabilities";
import Ol_Source_WMTS from "ol/source/wmts";
import MiscUtil from "utils/MiscUtil";
import SearchUtil from "utils/SearchUtil";
import GeoServerUtil from "utils/GeoServerUtil";

export function setMainMenuTabIndex(tabIndex) {
    return { type: types.SET_MAIN_MENU_TAB_INDEX, tabIndex };
}

export function setMainMenuOpen(isOpen) {
    return { type: types.SET_MAIN_MENU_OPEN, isOpen };
}

export function setSearchDateRange(startDate, endDate) {
    return { type: types.SET_SEARCH_DATE_RANGE, startDate, endDate };
}

export function setSearchSelectedArea(selectedArea, geometryType) {
    return { type: types.SET_SEARCH_SELECTED_AREA, selectedArea, geometryType };
}

export function setSearchLoading(isLoading) {
    return { type: types.SET_SEARCH_LOADING, isLoading };
}

export function setSearchResults(results) {
    return { type: types.SET_SEARCH_RESULTS, results };
}

export function setTrackSelected(trackId, isSelected) {
    return (dispatch, getState) => {
        dispatch({ type: types.SET_TRACK_SELECTED, trackId, isSelected });
        if (isSelected) {
            let state = getState();
            let track = state.view.getIn(["layerSearch", "searchResults", "results", trackId]);
            dispatch(
                mapActions.addLayer({
                    id: track.get("id"),
                    title: track.get("title"),
                    type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
                    handleAs: appStrings.LAYER_VECTOR_POINT_TRACK,
                    url: GeoServerUtil.getUrlForTrack(track),
                    metadata: {
                        project: track.get("project"),
                        source_id: track.get("source_id")
                    },
                    insituMeta: track.get("insituMeta"),
                    timeFormat: "YYYY-MM-DDTHH:mm:ssZ"
                })
            );
        } else {
            dispatch(
                mapActions.removeLayer(
                    Immutable.Map({
                        id: trackId + "_error",
                        type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA_ERROR
                    })
                )
            );
            dispatch(
                mapActions.removeLayer(
                    Immutable.Map({
                        id: trackId,
                        type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA
                    })
                )
            );
            dispatch(chartActions.setTrackSelected(trackId, isSelected));
        }
        dispatch(chartActions.updateAvailableVariables());
    };
}

export function setTrackErrorActive(trackId, isActive) {
    return (dispatch, getState) => {
        if (isActive) {
            let state = getState();
            console.log(state, trackId);
            MiscUtil.asyncFetch({
                url: "https://oiip.jpl.nasa.gov/gwc/wmts?REQUEST=GetCapabilities",
                handleAs: appStringsCore.LAYER_CONFIG_WMTS_XML
            }).then(
                data => {
                    let parser = new Ol_Format_WMTSCapabilities();
                    let result = parser.read(data);
                    let options = Ol_Source_WMTS.optionsFromCapabilities(result, {
                        layer: "oiip:err_tagbase_4",
                        matrixSet: "EPSG:4326"
                    });
                    let state = getState();
                    let track = state.map.getIn([
                        "layers",
                        appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
                        trackId
                    ]);
                    dispatch(
                        mapActions.addLayer({
                            id: track.get("id") + "_error",
                            title: track.get("title"),
                            type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA_ERROR,
                            handleAs: appStrings.LAYER_VECTOR_TILE_TRACK_ERROR,
                            url: GeoServerUtil.getUrlForTrackError(track),
                            insituMeta: track.get("insituMeta"),
                            updateParameters: { time: false },
                            wmtsOptions: {
                                tileGrid: options.tileGrid
                            },
                            timeFormat: "YYYY-MM-DDTHH:mm:ssZ"
                        })
                    );
                },
                err => {
                    console.warn("Error in setTrackErrorActive: ", err);
                }
            );
        } else {
            dispatch(
                mapActions.removeLayer(
                    Immutable.Map({
                        id: trackId + "_error",
                        type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA_ERROR
                    })
                )
            );
        }
        dispatch({ type: types.SET_TRACK_ERROR_ACTIVE, layer: trackId, isActive });
    };
}

export function runLayerSearch() {
    return (dispatch, getState) => {
        let state = getState();
        let searchParams = state.view.getIn(["layerSearch", "formOptions"]);

        dispatch(setSearchLoading(true));

        SearchUtil.searchForTracks({
            area: searchParams.get("selectedArea").toJS(),
            dateRange: [searchParams.get("startDate"), searchParams.get("endDate")],
            facets: searchParams.get("searchFacets").toJS()
        }).then(
            results => {
                dispatch(setSearchResults(results));
                dispatch(setSearchLoading(false));
            },
            err => {
                console.warn("Search Fail: ", err);
                dispatch(setSearchLoading(false));
            }
        );
    };
}
