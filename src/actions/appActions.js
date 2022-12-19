/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import appConfig from "constants/appConfig";
import * as typesCore from "_core/constants/actionTypes";
import * as types from "constants/actionTypes";
import * as mapActions from "actions/mapActions";
import * as mapActionsCore from "_core/actions/mapActions";
import * as chartActions from "actions/chartActions";
import * as subsettingActions from "actions/subsettingActions";
import * as alertActions from "_core/actions/alertActions";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import MapUtil from "utils/MapUtil";
import SearchUtil from "utils/SearchUtil";
import GeoServerUtil from "utils/GeoServerUtil";

export function runUrlConfig(params) {
    // Takes an array of key value pairs and dispatches associated actions for each
    // one.

    return (dispatch) => {
        const keys = Object.keys(params);
        return Promise.all(
            keys.map((key) => {
                return dispatch(translateUrlParamToActionDispatch({ key, value: params[key] }));
            })
        ).catch((err) => {
            console.warn("Error in appActions.runUrlConfig:", err);
            dispatch(
                alertActions.addAlert({
                    title: appStringsCore.ALERTS.URL_CONFIG_FAILED.title,
                    body: appStringsCore.ALERTS.URL_CONFIG_FAILED.formatString,
                    severity: appStringsCore.ALERTS.URL_CONFIG_FAILED.severity,
                    time: new Date(),
                })
            );
        });
    };
}

export function translateUrlParamToActionDispatch(param) {
    switch (param.key) {
        case appConfig.URL_KEYS.INSITU_LAYERS:
            return addTracksFromUrl(param.value.split(","));
        case appConfig.URL_KEYS.SATELLITE_LAYERS:
            return addSatelliteLayersFromUrl(param.value.split(","));
        case appConfig.URL_KEYS.BASEMAP:
            return param.value === "__NONE__"
                ? mapActionsCore.hideBasemap()
                : mapActionsCore.setBasemap(param.value);
        case appConfig.URL_KEYS.VIEW_EXTENT:
            return mapActionsCore.setMapView({ extent: param.value.split(",") }, true);
        case appConfig.URL_KEYS.DATE:
            return mapActions.setDate(moment.utc(param.value).toDate());
        case appConfig.URL_KEYS.DATE_INTERVAL:
            return mapActions.setDateInterval(
                parseInt(param.value.split("__")[0]),
                param.value.split("__")[1]
            );
        case appConfig.URL_KEYS.SEARCH_AREA:
            return setSearchArea(param.value.split(",").map((x) => parseFloat(x)));
        case appConfig.URL_KEYS.SEARCH_TIME:
            return setSearchDateRange(
                moment(param.value.split(",")[0], "YYYY-MM-DD").toDate(),
                moment(param.value.split(",")[1], "YYYY-MM-DD").toDate()
            );
        case appConfig.URL_KEYS.INSITU_SEARCH_PARAMS:
            return setTrackSearchFacetsFromUrl(JSON.parse(param.value));
        case appConfig.URL_KEYS.SATELLITE_SEARCH_PARAMS:
            return setSatelliteSearchFacetsFromUrl(JSON.parse(param.value));
        case appConfig.URL_KEYS.REFERENCE_LAYER:
            return setReferenceLayer(param.value);
        case appConfig.URL_KEYS.ANIMATION_DATE_RANGE:
            return setAnimationRange(
                moment.utc(param.value.split(",")[0]).toDate(),
                moment.utc(param.value.split(",")[1]).toDate()
            );
        case appConfig.URL_KEYS.LAYER_INFO:
            return setLayerInfoFromUrl(param.value);
        case appConfig.URL_KEYS.CHARTS:
            return setChartsFromUrl(param.value.split(","));
        case appConfig.URL_KEYS.MENU_TAB:
            return setMainMenuTabIndex(parseInt(param.value));
        default:
            return { type: typesCore.NO_ACTION };
    }
}

function setAnimationRange(start, end) {
    return (dispatch) => {
        dispatch(mapActions.setAnimationOpen(true, false));
        dispatch(mapActions.setAnimationDateRange(start, end));
    };
}

function setSearchArea(area) {
    return (dispatch) => {
        dispatch(setSearchSelectedArea(area, appStrings.GEOMETRY_BOX));

        dispatch(
            mapActionsCore.addGeometryToMap(
                {
                    type: appStrings.GEOMETRY_BOX,
                    id: "area-selection_" + Math.random(),
                    proj: appConfig.DEFAULT_PROJECTION,
                    coordinates: area,
                    coordinateType: appStringsCore.COORDINATE_TYPE_CARTOGRAPHIC,
                },
                appStrings.INTERACTION_AREA_SELECTION,
                false
            )
        );
    };
}

function setReferenceLayer(layerId) {
    return (dispatch, getState) => {
        const state = getState();
        state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA_REFERENCE]).forEach((layer) => {
            dispatch(mapActionsCore.setLayerActive(layer.get("id"), false));
        });
        dispatch(mapActionsCore.setLayerActive(layerId, true));
    };
}

function setTrackSearchFacetsFromUrl(params) {
    return (dispatch) => {
        for (let group in params) {
            const values = params[group];
            values.forEach((value) => {
                dispatch(setTrackSearchFacetSelected({ group, value }, true));
            });
        }
    };
}

function setSatelliteSearchFacetsFromUrl(params) {
    return (dispatch) => {
        for (let group in params) {
            const values = params[group];
            values.forEach((value) => {
                dispatch(setSatelliteSearchFacetSelected({ group, value }, true));
            });
        }
    };
}

function addTracksFromUrl(trackData) {
    return (dispatch) => {
        trackData.forEach((data) => {
            const pieces = data.split("|");
            const id = pieces[0];
            const color = pieces[1];
            SearchUtil.searchForSingleTrack(id).then((layer) => {
                if (layer) {
                    dispatch(setTrackSelected(id, true, layer));
                    window.requestAnimationFrame(() => {
                        dispatch(mapActions.setInsituLayerColor(id, color));
                    });
                }
            });
        });
    };
}

function addSatelliteLayersFromUrl(trackIds) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            Promise.all(
                trackIds.map((id) => {
                    return SearchUtil.searchForSingleSatellite(id);
                })
            )
                .then((layers) => {
                    Promise.all(
                        layers.reduce((acc, l) => {
                            if (l) {
                                const mergedTrack = mergeTrackData(l);
                                acc.push(dispatch(mapActions.ingestSingleLayer(mergedTrack)));
                            }
                            return acc;
                        }, [])
                    )
                        .then((layerList) => {
                            layerList.reverse().forEach((l) => {
                                dispatch(setTrackSelected(l.id, true, l, true));
                                resolve();
                            });
                        })
                        .catch((err) => reject(err));
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };
}

function setLayerInfoFromUrl(id) {
    return (dispatch) => {
        SearchUtil.searchForSingleItem(id).then((layer) => {
            if (layer) {
                dispatch(setLayerInfo(layer));
            }
        });
    };
}

function setChartsFromUrl(chartStrs) {
    return (dispatch, getState) => {
        chartStrs.forEach((chartStr) => {
            const pieces = chartStr.split(":");
            const ids = pieces[0].split("|");
            const vars = pieces[1].split("|");
            const displayOptions = pieces[2].split("|");

            Promise.all(ids.map((id) => SearchUtil.searchForSingleTrack(id))).then((tracks) => {
                const state = getState();
                let formOptions = state.chart.get("formOptions");
                formOptions = formOptions.set(
                    "selectedTracks",
                    tracks.map((track) => {
                        let title =
                            track.get("title").size > 0
                                ? track.getIn(["title", 0])
                                : track.get("title");
                        return {
                            id: track.get("id"),
                            title: `${title} (id: ${track.get("shortId")})`,
                            program: track.getIn(["insituMeta", "program"]),
                            project: track.getIn(["insituMeta", "project"]),
                            source_id: track.getIn(["insituMeta", "source_id"]),
                        };
                    })
                );
                const xAxis = vars[0];
                const xAxisLabel = vars[1];
                const yAxis = vars[2];
                const yAxisLabel = vars[3];
                const zAxis = vars[4];
                const zAxisLabel = vars[5];
                formOptions = formOptions.set("xAxis", xAxis);
                formOptions = formOptions.set("xAxisLabel", xAxisLabel);
                formOptions = formOptions.set("yAxis", yAxis);
                formOptions = formOptions.set("yAxisLabel", yAxisLabel);
                if (zAxis && zAxisLabel) {
                    formOptions = formOptions.set("zAxis", zAxis);
                    formOptions = formOptions.set("zAxisLabel", zAxisLabel);
                }

                const linkToDateInterval = displayOptions[0] === "true";
                const markerType = displayOptions[1];
                const bounds = displayOptions[2].split("_").map((x) => parseFloat(x));
                const newDisplayOptions = {
                    linkToDateInterval,
                    markerType,
                    bounds,
                };
                dispatch(chartActions.createChartFromOptions(formOptions, newDisplayOptions));
            });
        });
    };
}

export function setExtraToolsOpen(open) {
    return { type: types.SET_EXTRA_TOOLS_OPEN, open };
}

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

export function setTrackSelected(trackId, isSelected, track = null, noMerge = false) {
    return (dispatch, getState) => {
        dispatch({ type: types.SET_TRACK_SELECTED, trackId, isSelected });
        if (isSelected) {
            let state = getState();
            track = track || state.view.getIn(["layerSearch", "searchResults", "results", trackId]);
            let titleField = state.map.get("insituLayerTitleField");

            const mergedTrack = noMerge ? track : mergeTrackData(track, titleField);
            dispatch(mapActions.addLayer(mergedTrack));
            return mergedTrack;
        } else {
            dispatch(
                mapActions.removeLayer(
                    Immutable.Map({
                        id: trackId + "_error",
                        type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA_ERROR,
                    })
                )
            );
            dispatch(
                mapActions.removeLayer(
                    Immutable.Map({
                        id: trackId,
                        type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
                    })
                )
            );
            dispatch(
                mapActions.removeLayer(
                    Immutable.Map({
                        id: trackId,
                        type: appStringsCore.LAYER_GROUP_TYPE_DATA,
                    })
                )
            );
            dispatch(chartActions.setTrackSelected(trackId, isSelected));
            dispatch(subsettingActions.setTrackSelected(trackId, isSelected));
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
                trackId,
            ]);
            let errTrackId =
                "oiip:err_poly_" +
                track.getIn(["insituMeta", "project"]) +
                "_" +
                track.getIn(["insituMeta", "source_id"]);
            let errTrackPartial = state.map
                .getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_PARTIAL])
                .find((layer) => layer.get("id") === errTrackId);
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
                            tileGrid: errTrackPartial.getIn(["mappingOptions", "tileGrid"]).toJS(),
                        },
                        timeFormat: "YYYY-MM-DDTHH:mm:ssZ",
                    })
                );
            }
        } else {
            dispatch(
                mapActions.removeLayer(
                    Immutable.Map({
                        id: trackId + "_error",
                        type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA_ERROR,
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
                facets: searchParams.get("trackSelectedFacets").toJS(),
            }),
            SearchUtil.searchForSatelliteSets({
                area: searchParams.get("selectedArea").toJS(),
                dateRange: [searchParams.get("startDate"), searchParams.get("endDate")],
                facets: searchParams.get("satelliteSelectedFacets").toJS(),
            }),
        ])
            .then((allResults) => {
                const results = allResults.flat();
                dispatch(setSearchResults(results));
                dispatch(setSearchLoading(false));
            })
            .catch((err) => {
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

function updateFacets(dispatch, getState) {
    let state = getState();
    let searchParams = state.view.getIn(["layerSearch", "formOptions"]);

    SearchUtil.searchForFacets({
        datatype: "datatype:track",
        area: searchParams.get("selectedArea").toJS(),
        dateRange: [searchParams.get("startDate"), searchParams.get("endDate")],
        facets: searchParams.get("trackSelectedFacets").toJS(),
    }).then(
        (results) => {
            dispatch(setTrackSearchFacets(results));
        },
        (err) => {
            console.warn("Facet search Fail: ", err);
        }
    );

    SearchUtil.searchForFacets({
        datatype: "datatype:layer",
        area: searchParams.get("selectedArea").toJS(),
        dateRange: [searchParams.get("startDate"), searchParams.get("endDate")],
        facets: searchParams.get("satelliteSelectedFacets").toJS(),
    }).then(
        (results) => {
            dispatch(setSatelliteSearchFacets(results));
        },
        (err) => {
            console.warn("Facet search Fail: ", err);
        }
    );
}

export function setHelpPage(pageKey) {
    return { type: types.SET_HELP_PAGE_KEY, pageKey };
}

function mergeTrackData(track, titleField) {
    if (track.get("isTrack")) {
        return {
            id: track.get("id"),
            shortId: track.get("shortId"),
            title: track.getIn(["insituMeta", "title"]) || track.getIn(["insituMeta", titleField]),
            type: appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
            handleAs:
                track.getIn(["insituMeta", "handle_as"]) || appStrings.LAYER_VECTOR_POINT_TRACK,
            url: GeoServerUtil.getUrlForTrack(track),
            mappingOptions: {
                url: GeoServerUtil.getUrlForTrack(track),
                extents: MapUtil.constrainExtent([
                    track.getIn(["insituMeta", "lon_min"]),
                    track.getIn(["insituMeta", "lat_min"]),
                    track.getIn(["insituMeta", "lon_max"]),
                    track.getIn(["insituMeta", "lat_max"]),
                ]),
                urlFunctions:
                    track.getIn(["insituMeta", "handle_as"]) === appStrings.LAYER_VECTOR_POINTS_WFS
                        ? {
                              [appStringsCore.MAP_LIB_2D]: appStrings.URL_FUNC_WFS_AREA_TIME_FILTER,
                          }
                        : {},
            },
            insituMeta: track.get("insituMeta"),
            timeFormat: "YYYY-MM-DD[T]HH:mm:ss[Z]",
        };
    } else {
        const tempRes = track.getIn(["insituMeta", "resolution_temporal"]);
        const handleAs =
            track.getIn(["insituMeta", "handle_as"]) || appStringsCore.LAYER_GIBS_RASTER;
        const isWMS =
            [appStrings.LAYER_WMS_TILE_RASTER, appStringsCore.LAYER_WMS_RASTER].indexOf(handleAs) !=
            -1;

        console.log(handleAs, track.get("id"));

        const tileFunctions = isWMS
            ? {}
            : {
                  openlayers: appStrings.EXTRACT_DATA_OL,
                  cesium: appStrings.EXTRACT_DATA_CS,
              };
        return {
            id: track.get("id"),
            shortId: track.get("shortId"),
            title: track.get("title"),
            type: appStringsCore.LAYER_GROUP_TYPE_DATA,
            handleAs: handleAs,
            fromJson: true,
            timeFormat: track.getIn(["insituMeta", "time_format"])
                ? track
                      .getIn(["insituMeta", "time_format"])
                      .replace("[T]", "T")
                      .replace("T", "[T]")
                      .replace("[Z]", "Z")
                      .replace("Z", "[Z]") // force assumption of UTC and allow escaped or non-escaped strings
                : tempRes && parseFloat(tempRes) % 1 !== 0
                ? "YYYY-MM-DD[T]HH:mm:ss[Z]"
                : "YYYY-MM-DD",
            palette: {
                name: track.get("shortId"),
                url: track.get("colorbarUrl"),
                handleAs: appStrings.COLORBAR_GIBS_XML,
            },
            mappingOptions: {
                urlFunctions: {
                    openlayers: isWMS
                        ? appStringsCore.KVP_TIME_PARAM_WMS
                        : appStringsCore.KVP_TIME_PARAM_WMTS,
                    cesium: isWMS
                        ? appStringsCore.KVP_TIME_PARAM_WMS
                        : appStringsCore.KVP_TIME_PARAM_WMTS,
                },
                tileFunctions: tileFunctions,
            },
            insituMeta: track.get("insituMeta"),
        };
    }
}
