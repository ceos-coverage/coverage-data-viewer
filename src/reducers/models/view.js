import Immutable from "immutable";
import moment from "moment";
import appConfig from "constants/appConfig";
import { viewState as viewStateCore } from "_core/reducers/models/view";

export const viewState = viewStateCore.mergeDeep(
    Immutable.fromJS({
        mainMenuTabIndex: 0,
        isMainMenuOpen: true,
        layerSearch: {
            formOptions: {
                startDate: moment
                    .utc(appConfig.DEFAULT_DATE)
                    .subtract(20, "years")
                    .toDate(),
                endDate: appConfig.DEFAULT_DATE,
                selectedArea: [],
                searchFacets: []
            },
            searchResults: {
                isLoading: false,
                results: Immutable.OrderedMap()
            },
            selectedTracks: Immutable.Set()
        }
    })
);

export const trackModel = Immutable.fromJS({
    id: "",
    title: ""
});
