/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as types from "constants/actionTypes";
import SearchUtil from "utils/SearchUtil";

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
