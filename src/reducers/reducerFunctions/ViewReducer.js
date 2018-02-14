import Immutable from "immutable";
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

    static resetApplicationState(state, action) {
        state = this.setMainMenutabIndex(state, { tabIndex: 0 });
        state = this.setMainMenuOpen(state, { isOpen: true });

        return ViewReducerCore.resetApplicationState(state, action);
    }
}
