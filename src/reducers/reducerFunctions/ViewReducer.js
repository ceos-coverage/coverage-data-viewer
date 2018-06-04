import Immutable from "immutable";
import moment from "moment";
import appConfig from "constants/appConfig";
import ViewReducerCore from "_core/reducers/reducerFunctions/ViewReducer";
import { alert as alertCore } from "_core/reducers/models/alert";
import { trackModel } from "reducers/models/view";
import SearchUtil from "utils/SearchUtil";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class ViewReducer extends ViewReducerCore {
    static setMainMenuTabIndex(state, action) {
        return state.set("mainMenuTabIndex", action.tabIndex);
    }

    static setMainMenuOpen(state, action) {
        return state.set("isMainMenuOpen", action.isOpen);
    }

    static setSearchDateRange(state, action) {
        return state
            .setIn(["layerSearch", "formOptions", "startDate"], action.startDate)
            .setIn(["layerSearch", "formOptions", "endDate"], action.endDate);
    }

    static setSearchSelectedArea(state, action) {
        return state.setIn(
            ["layerSearch", "formOptions", "selectedArea"],
            Immutable.List(action.selectedArea)
        );
    }

    static setSearchLoading(state, action) {
        return state.setIn(["layerSearch", "searchResults", "isLoading"], action.isLoading);
    }

    static setSearchResults(state, action) {
        let results = action.results.reduce((acc, entry) => {
            let track = trackModel.mergeDeep(entry);
            return acc.set(track.get("id"), track);
        }, Immutable.OrderedMap());

        return state.setIn(["layerSearch", "searchResults", "results"], results);
    }

    static setSearchFacets(state, action) {
        let facets = appConfig.LAYER_SEARCH.FACETS;
        for (let i = 0; i < facets.length; ++i) {
            let values = action.facets.get(facets[i].value);

            if (facets[i].value === "variables") {
                values = values.map(entry => {
                    let varEntry = SearchUtil.readVariable(entry.get("value"));
                    return entry.set("label", varEntry.get("label"));
                });
            }

            state = state.setIn(
                ["layerSearch", "formOptions", "searchFacets", facets[i].value],
                values.sortBy(entry => entry.get("label"))
            );
        }

        return state;
    }

    static setTrackSelected(state, action) {
        let selected = state.getIn(["layerSearch", "selectedTracks"]);
        if (action.isSelected) {
            selected = selected.add(action.trackId);
        } else {
            selected = selected.delete(action.trackId);
        }
        return state.setIn(["layerSearch", "selectedTracks"], selected);
    }

    static resetApplicationState(state, action) {
        state = this.setMainMenutabIndex(state, { tabIndex: 0 });
        state = this.setMainMenuOpen(state, { isOpen: true });
        state = this.setSearchDateRange(state, {
            startDate: moment.utc(appConfig.DEFAULT_DATE).subtract(2, "months").toDate,
            endDate: appConfig.DEFAULT_DATE
        });

        return ViewReducerCore.resetApplicationState(state, action);
    }

    static setLayerInfo(state, action) {
        return state.set("layerInfo", action.layer);
    }
}
