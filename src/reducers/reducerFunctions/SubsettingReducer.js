/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class SubsettingReducer {
    static setSubsettingOptions(state, action) {
        return state.mergeDeep(action.options);
    }

    static setTrackSelected(state, action) {
        let selected = state.get("selectedTracks");
        if (action.isSelected) {
            selected = selected.add(action.trackId);
        } else {
            selected = selected.delete(action.trackId);
        }
        return state.set("selectedTracks", selected);
    }
}
