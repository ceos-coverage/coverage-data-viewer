/**
 * Copyright 2018 California Institute of Technology.
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
import MapUtil from "utils/MapUtil";
import SearchUtil from "utils/SearchUtil";
import GeoServerUtil from "utils/GeoServerUtil";
import shouldUpdate from "recompose/shouldUpdate";

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

export function setTrackSearchFacets(facets) {
    return { type: types.SET_SEARCH_FACETS, facets };
}

export function setSatelliteSearchFacets(facets) {
    return { type: types.SET_SATELLITE_SEARCH_FACETS, facets };
}

export function setTrackSearchFacetSelected(facet, isSelected, shouldUpdateFacets = false) {
    return (dispatch, getState) => {
        dispatch({ type: types.SET_SEARCH_FACET_SELECTED, facet, isSelected });

        if (shouldUpdateFacets === true) {
            updateFacets(dispatch, getState);
        }
    };
}

export function setSatelliteSearchFacetSelected(facet, isSelected, shouldUpdateFacets = false) {
    return (dispatch, getState) => {
        dispatch({ type: types.SET_SATELLITE_SEARCH_FACET_SELECTED, facet, isSelected });

        if (shouldUpdateFacets === true) {
            updateFacets(dispatch, getState);
        }
    };
}

export function clearTrackSearchFacet(facetGroup) {
    return { type: types.CLEAR_TRACK_SEARCH_FACET, facetGroup };
}

export function clearSatelliteSearchFacet(facetGroup) {
    return { type: types.CLEAR_SATELLITE_SEARCH_FACET, facetGroup };
}

export function setTrackSelected(trackId, isSelected) {
    return (dispatch, getState) => {
        dispatch({ type: types.SET_TRACK_SELECTED, trackId, isSelected });
        if (isSelected) {
            let state = getState();
            let track = state.view.getIn(["layerSearch", "searchResults", "results", trackId]);
            let titleField = state.map.get("insituLayerTitleField");
            if (track.get("isTrack")) {
                dispatch(
                    mapActions.addLayer({
                        id: track.get("id"),
                        shortId: track.get("shortId"),
                        title: track.getIn(["insituMeta", titleField]),
                        type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
                        handleAs: appStrings.LAYER_VECTOR_POINT_TRACK,
                        url: GeoServerUtil.getUrlForTrack(track),
                        mappingOptions: {
                            extents: MapUtil.constrainExtent([
                                track.getIn(["insituMeta", "lon_min"]),
                                track.getIn(["insituMeta", "lat_min"]),
                                track.getIn(["insituMeta", "lon_max"]),
                                track.getIn(["insituMeta", "lat_max"])
                            ])
                        },
                        insituMeta: track.get("insituMeta"),
                        timeFormat: "YYYY-MM-DDTHH:mm:ssZ"
                    })
                );
            } else {
                dispatch(
                    mapActions.addLayer({
                        id: track.get("id"),
                        shortId: track.get("shortId"),
                        title: track.get("title"),
                        type: appStringsCore.LAYER_GROUP_TYPE_DATA,
                        handleAs: appStringsCore.LAYER_GIBS_RASTER,
                        fromJson: true,
                        mappingOptions: {
                            urlFunctions: {
                                openlayers: "kvpTimeParam_wmts",
                                cesium: "kvpTimeParam_wmts"
                            }
                        },
                        insituMeta: track.get("insituMeta")
                    })
                );
            }
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
            dispatch(
                mapActions.removeLayer(
                    Immutable.Map({
                        id: trackId,
                        type: appStringsCore.LAYER_GROUP_TYPE_DATA
                    })
                )
            );
            dispatch(chartActions.setTrackSelected(trackId, isSelected));
        }
    };
}

export function setTrackErrorActive(trackId, isActive) {
    return (dispatch, getState) => {
        if (isActive) {
            let state = getState();
            let track = state.map.getIn([
                "layers",
                appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
                trackId
            ]);
            let errTrackId =
                "oiip:err_poly_" +
                track.getIn(["insituMeta", "project"]) +
                "_" +
                track.getIn(["insituMeta", "source_id"]);
            let errTrackPartial = state.map
                .getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_PARTIAL])
                .find(layer => layer.get("id") === errTrackId);
            if (typeof errTrackPartial !== "undefined") {
                dispatch(
                    mapActions.addLayer({
                        id: track.get("id") + "_error",
                        title: track.get("title") + " - Error",
                        type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA_ERROR,
                        handleAs: appStrings.LAYER_VECTOR_TILE_TRACK_ERROR,
                        url: GeoServerUtil.getUrlForTrackError(track, errTrackId),
                        insituMeta: track.get("insituMeta"),
                        updateParameters: { time: false },
                        mappingOptions: {
                            extents: track.getIn(["mappingOptions", "extents"]).toJS(),
                            tileGrid: errTrackPartial.getIn(["mappingOptions", "tileGrid"]).toJS()
                        },
                        timeFormat: "YYYY-MM-DDTHH:mm:ssZ"
                    })
                );
            }
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

        Promise.all([
            SearchUtil.searchForTracks({
                area: searchParams.get("selectedArea").toJS(),
                dateRange: [searchParams.get("startDate"), searchParams.get("endDate")],
                facets: searchParams.get("trackSelectedFacets").toJS()
            }),
            SearchUtil.searchForSatelliteSets({
                area: searchParams.get("selectedArea").toJS(),
                dateRange: [searchParams.get("startDate"), searchParams.get("endDate")],
                facets: searchParams.get("satelliteSelectedFacets").toJS()
            })
        ])
            .then(allResults => {
                console.log(allResults);
                const results = allResults.flat();
                dispatch(setSearchResults(results));
                dispatch(setSearchLoading(false));
            })
            .catch(err => {
                console.warn("Track search fail: ", err);
                dispatch(setSearchLoading(false));
            });

        updateFacets(dispatch, getState);
    };
}

export function setLayerInfo(layer = undefined) {
    return { type: types.SET_LAYER_INFO, layer };
}

export function setSearchSortParameter(param) {
    return { type: types.SET_SEARCH_SORT_PARAM, param };
}

export function updateFacets(dispatch, getState) {
    let state = getState();
    let searchParams = state.view.getIn(["layerSearch", "formOptions"]);

    SearchUtil.searchForFacets({
        datatype: "datatype:track",
        area: searchParams.get("selectedArea").toJS(),
        dateRange: [searchParams.get("startDate"), searchParams.get("endDate")],
        facets: searchParams.get("trackSelectedFacets").toJS()
    }).then(
        results => {
            dispatch(setTrackSearchFacets(results));
        },
        err => {
            console.warn("Facet search Fail: ", err);
        }
    );

    SearchUtil.searchForFacets({
        datatype: "datatype:layer",
        area: searchParams.get("selectedArea").toJS(),
        dateRange: [searchParams.get("startDate"), searchParams.get("endDate")],
        facets: searchParams.get("satelliteSelectedFacets").toJS()
    }).then(
        results => {
            dispatch(setSatelliteSearchFacets(results));
        },
        err => {
            console.warn("Facet search Fail: ", err);
        }
    );
}
