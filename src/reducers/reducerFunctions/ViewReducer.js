import Immutable from "immutable";
import moment from "moment";
import appConfig from "constants/appConfig";
import ViewReducerCore from "_core/reducers/reducerFunctions/ViewReducer";
import { alert as alertCore } from "_core/reducers/models/alert";

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
            .setIn(["layerSearch", "startDate"], action.startDate)
            .setIn(["layerSearch", "endDate"], action.endDate);
    }

    static resetApplicationState(state, action) {
        state = this.setMainMenutabIndex(state, { tabIndex: 0 });
        state = this.setMainMenuOpen(state, { isOpen: true });
        state = this.setSearchDateRange(state, {
            startDate: moment(appConfig.DEFAULT_DATE).subtract(2, "months").toDate,
            endDate: appConfig.DEFAULT_DATE
        });

        return ViewReducerCore.resetApplicationState(state, action);
    }
}
