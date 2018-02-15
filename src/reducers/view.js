import * as actionTypes from "constants/actionTypes";
import { viewState } from "reducers/models/view";
import viewCore from "_core/reducers/view";
import ViewReducer from "reducers/reducerFunctions/ViewReducer";

export default function view(state = viewState, action, opt_reducer = ViewReducer) {
    switch (action.type) {
        case actionTypes.SET_MAIN_MENU_TAB_INDEX:
            return opt_reducer.setMainMenuTabIndex(state, action);

        case actionTypes.SET_MAIN_MENU_OPEN:
            return opt_reducer.setMainMenuOpen(state, action);

        default:
            return viewCore.call(this, state, action, opt_reducer);
    }
}
