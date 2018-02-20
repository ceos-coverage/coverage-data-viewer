/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import * as coreConfig from "_core/constants/appConfig";
import * as appStrings from "constants/appStrings";

// the config as defined by CMC Core
const CORE_CONFIG = Immutable.fromJS(coreConfig);

// this config is defined in `src/config.js` for in ops changes
const OPS_CONFIG = Immutable.fromJS(window.APPLICATION_CONFIG);

// define your overrides for Core config here
const APP_CONFIG = Immutable.fromJS({
    APP_TITLE: "OIIP",
    URLS: {
        layerConfig: [
            {
                url: "default-data/layers_oiip.json",
                type: "json"
            },
            {
                url: "default-data/layers_insitu_oiip.json",
                type: "json"
            },
            {
                url: "default-data/_core_default-data/capabilities.xml",
                type: "wmts/xml"
            }
        ],
        paletteConfig: "default-data/palettes_oiip.json"
    },
    DEFAULT_WEB_WORKER_NUM: 1,
    DEFAULT_MAP_EXTENT: [-360, -90, 360, 90],
    INSITU_VECTOR_COLORS: [
        "#F44336", // red
        "#E91E63", // pink
        "#FF9800", // orange
        "#FF5722", // deep orange
        "#FFC107", // amber
        "#FFEB3B", // yellow
        "#8BC34A", // light green
        "#CDDC39", // lime
        "#4CAF50", // green
        "#009688", // teal
        "#00BCD4", // cyan
        "#b2ebf2", // cyan 100
        "#3F51B5", // indigo
        "#03A9F4", // light blue
        "#607D8B", // blue grey
        "#2196F3", // blue
        "#9C27B0", // purple
        "#673AB7" // deep purple
    ],
    CHART_DISPLAY_TYPES: {
        TIME_SERIES: [
            { value: appStrings.PLOT_STYLES.TIME_SERIES.LINES_AND_DOTS, label: "Lines and Dots" },
            { value: appStrings.PLOT_STYLES.TIME_SERIES.DOTS, label: "Dots Only" },
            { value: appStrings.PLOT_STYLES.TIME_SERIES.BARS, label: "Bars" }
        ]
    }
});

// define and export the final config
const appConfig = CORE_CONFIG.mergeDeep(APP_CONFIG)
    .mergeDeep(OPS_CONFIG)
    .toJS();
export default appConfig;
