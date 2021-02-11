/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import appConfig from "constants/appConfig";
import moment from "moment";

export const subsettingState = Immutable.fromJS({
    isOpen: false,
    selectedTracks: Immutable.Set(),
    startDate: moment
        .utc(appConfig.DEFAULT_DATE)
        .subtract(1, "week")
        .toDate(), // date to begin animation
    endDate: appConfig.DEFAULT_DATE // date to end animation
});
