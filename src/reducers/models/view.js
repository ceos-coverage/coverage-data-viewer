import Immutable from "immutable";
import { viewState as viewStateCore } from "_core/reducers/models/view";

export const viewState = viewStateCore.mergeDeep(
    Immutable.fromJS({
        mainMenuTabIndex: 0,
        isMainMenuOpen: true
    })
);
