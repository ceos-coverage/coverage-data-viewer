import Immutable from "immutable";
import moment from "moment";
import appConfig from "constants/appConfig";
import { viewState as viewStateCore } from "_core/reducers/models/view";

export const viewState = viewStateCore.mergeDeep(
    Immutable.fromJS({
        mainMenuTabIndex: 0,
        isMainMenuOpen: true,
        layerSearch: {
            startDate: moment(appConfig.DEFAULT_DATE)
                .subtract(2, "months")
                .toDate(),
            endDate: appConfig.DEFAULT_DATE,
            selectedArea: [],
            searchFacets: []
        }
    })
);
