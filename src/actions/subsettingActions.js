/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as types from "constants/actionTypes";

export function setSubsettingOptions(options) {
    return { type: types.SET_SUBSETTING_OPTIONS, options };
}

export function setTrackSelected(trackId, isSelected) {
    return dispatch => {
        dispatch({ type: types.SET_SUBSET_TRACK_SELECTED, trackId, isSelected });
    };
}
