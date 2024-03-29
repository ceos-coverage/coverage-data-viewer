/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import appConfig from "constants/appConfig";
import { viewState as viewStateCore } from "_core/reducers/models/view";

export const viewState = viewStateCore.mergeDeep(
    Immutable.fromJS({
        mainMenuTabIndex: 0,
        isMainMenuOpen: true,
        layerInfo: undefined,
        extraToolsOpen: false,
        layerSearch: {
            formOptions: {
                startDate: moment.utc("1970-01-01", "YYYY-MM-DD").toDate(),
                endDate: appConfig.DEFAULT_DATE,
                selectedArea: [],
                trackSelectedFacets: appConfig.LAYER_SEARCH.FACETS.reduce((acc, facet) => {
                    acc[facet.value] = Immutable.Set();
                    return acc;
                }, {}),
                trackSearchFacets: appConfig.LAYER_SEARCH.FACETS.reduce((acc, facet) => {
                    acc[facet.value] = [];
                    return acc;
                }, {}),
                satelliteSelectedFacets: appConfig.SATELLITE_LAYER_SEARCH.FACETS.reduce(
                    (acc, facet) => {
                        acc[facet.value] = Immutable.Set();
                        return acc;
                    },
                    {}
                ),
                satelliteSearchFacets: appConfig.SATELLITE_LAYER_SEARCH.FACETS.reduce(
                    (acc, facet) => {
                        acc[facet.value] = [];
                        return acc;
                    },
                    {}
                )
            },
            searchResults: {
                isLoading: false,
                results: Immutable.OrderedMap()
            },
            sortParameter: appConfig.LAYER_SEARCH.DEFAULT_SORT_PARAM,
            selectedTracks: Immutable.Set()
        },
        helpPage: null
    })
);

export const trackModel = Immutable.fromJS({
    id: "",
    title: ""
});
