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
                url:
                    "https://podaac-tools.jpl.nasa.gov/onearth/wmts/wmts.cgi?Service=WMTS&Request=GetCapabilities",
                type: "wmts/xml"
            },
            {
                url: "default-data/capabilities_oiip_gibs.xml",
                type: "wmts/xml"
            },
            {
                url: "https://oiip.jpl.nasa.gov/gwc/wmts?Request=GetCapabilities",
                type: "wmts/xml"
            }
        ],
        paletteConfig: "default-data/palettes_oiip.json",
        geoserverBase: "https://oiip.jpl.nasa.gov/geoserver/ows",
        solrBase: "https://oiip.jpl.nasa.gov/solr/",
        decimatorMiddleware: "http://icewhale.jpl.nasa.gov:49181/getData"
        // decimatorMiddleware: "http://localhost:49181/getData"
    },
    DEFAULT_WEB_WORKER_NUM: 1,
    DEFAULT_MAP_EXTENT: [-180 * 2, -90, 180 * 2, 90],
    DELETE_LAYER_PARTIALS: false,
    DEFAULT_DECIMATION_RATE: 20000,
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
        "#673AB7", // deep purple
        "#3e2723", // brown
        "#000000" // black,
    ],
    CHART_SERIES_COLORS: [
        "#00BCD4", // cyan
        "#F44336", // red
        "#673AB7", // deep purple
        "#607D8B", // blue grey
        "#4CAF50", // green
        "#FF5722", // deep orange
        "#2196F3", // blue
        "#000000" // black,
    ],
    CHART_COLORBAR_COLORS: ["#0288d1", "#fffbbc", "#d14702"],
    CHART_DATE_INDICATOR_COLOR: "rgba(0, 0, 0, 0.5)",
    CHART_WIDTH: 515,
    CHART_HEIGHT: 298,
    CHART_DISPLAY_TYPES: {
        TIME_SERIES: [
            { value: appStrings.PLOT_STYLES.TIME_SERIES.LINES_AND_DOTS, label: "Lines and Dots" },
            { value: appStrings.PLOT_STYLES.TIME_SERIES.DOTS, label: "Dots Only" },
            { value: appStrings.PLOT_STYLES.TIME_SERIES.BARS, label: "Bars" }
        ]
    },
    LAYER_SEARCH: {
        FACETS: [
            { value: "variables", label: "variable" },
            { value: "platform", label: "platform" },
            { value: "instrument", label: "sensor" },
            { value: "project", label: "project" }
        ],
        SORT_PARAMS: [
            { value: "instrument", label: "sensor" },
            { value: "platform", label: "platform" },
            { value: "project", label: "project" }
        ],
        DEFAULT_SORT_PARAM: "project"
    }
});

// define and export the final config
const appConfig = CORE_CONFIG.mergeDeep(APP_CONFIG)
    .mergeDeep(OPS_CONFIG)
    .toJS();
export default appConfig;
