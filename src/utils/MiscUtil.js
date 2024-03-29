/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import queryString from "query-string";
import MiscUtilCore from "_core/utils/MiscUtil";

function throttle(timer) {
    if (timer) {
        let queuedCallback = null;
        return callback => {
            if (!queuedCallback) {
                timer(() => {
                    const cb = queuedCallback;
                    queuedCallback = null;
                    cb();
                });
            }
            queuedCallback = callback;
        };
    }
    return callback => {
        callback();
    };
}

export class MiscUtil extends MiscUtilCore {
    static getUrlParams() {
        return queryString.parse(window.location.search);
    }

    // Find closest ancestor to dom element el matching selector
    // From: http://stackoverflow.com/questions/18663941/finding-closest-element-without-jquery
    // A replacement for JQuery.closest
    static closest(el, selector) {
        let matchesFn;

        // find vendor prefix
        [
            "matches",
            "webkitMatchesSelector",
            "mozMatchesSelector",
            "msMatchesSelector",
            "oMatchesSelector"
        ].some(function(fn) {
            if (typeof document.body[fn] == "function") {
                matchesFn = fn;
                return true;
            }
            return false;
        });

        let parent;

        // traverse parents
        while (el) {
            if (el[matchesFn](selector)) {
                return el;
            }

            el = el.parentElement;
        }

        return null;
    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    static throttledCallback = throttle(
        typeof window !== "undefined" ? window.requestAnimationFrame : null
    );

    static logScaleValue(value) {
        // position will be between 0 and 100
        const minp = 0;
        const maxp = 100;

        // The result should be between 2 an 15
        const minv = Math.log(2);
        const maxv = Math.log(15);

        // calculate adjustment factor
        const scale = (maxv - minv) / (maxp - minp);

        return Math.exp(minv + scale * (value - minp));
    }
}

export default MiscUtil;
