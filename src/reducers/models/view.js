import Immutable from "immutable";
import moment from "moment";
import appConfig from "constants/appConfig";
import { viewState as viewStateCore } from "_core/reducers/models/view";

let facetMap = appConfig.LAYER_SEARCH.FACETS.reduce((acc, facet) => {
    acc[facet.value] = [];
    return acc;
}, {});

export const viewState = viewStateCore.mergeDeep(
    Immutable.fromJS({
        mainMenuTabIndex: 0,
        isMainMenuOpen: true,
        layerInfo: undefined,
        layerSearch: {
            formOptions: {
                startDate: moment
                    .utc(appConfig.DEFAULT_DATE)
                    .subtract(20, "years")
                    .toDate(),
                endDate: appConfig.DEFAULT_DATE,
                selectedArea: [],
                selectedFacets: appConfig.LAYER_SEARCH.FACETS.reduce((acc, facet) => {
                    acc[facet.value] = Immutable.Set();
                    return acc;
                }, {}),
                searchFacets: appConfig.LAYER_SEARCH.FACETS.reduce((acc, facet) => {
                    acc[facet.value] = [];
                    return acc;
                }, {})
            },
            searchResults: {
                isLoading: false,
                results: Immutable.OrderedMap()
            },
            sortParameter: appConfig.LAYER_SEARCH.DEFAULT_SORT_PARAM,
            selectedTracks: Immutable.Set()
        }
    })
);

export const trackModel = Immutable.fromJS({
    id: "",
    title: ""
});
