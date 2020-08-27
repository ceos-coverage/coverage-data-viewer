/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { subsettingState } from "reducers/models/subsetting";
import SubsettingReducer from "reducers/reducerFunctions/SubsettingReducer";
import * as actionTypes from "constants/actionTypes";

export default function subset(state = subsettingState, action, opt_reducer = SubsettingReducer) {
    switch (action.type) {
        case actionTypes.SET_SUBSETTING_OPTIONS:
            return opt_reducer.setSubsettingOptions(state, action);

        case actionTypes.SET_SUBSET_TRACK_SELECTED:
            return opt_reducer.setTrackSelected(state, action);

        default:
            return state;
    }
}
