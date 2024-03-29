/**
 * Copyright 2018 California Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**************/
/* App Config */
/**************/

/*
Add configuration entries to this that should be editable
in operations (i.e. after build). This config file is loaded
directly in index.html, without going through webpack.

see `src/constants/appConfig.js` for all configuration options

Note that configuration settings that are not expected to change
during deployment should be made in `src/constants/appConfig.js` directly

EXAMPLE:
The following configuration will change the display title for
the application.
```
APPLICATION_CONFIG = {
	APP_TITLE: "New Title"
};
```

*/

APPLICATION_CONFIG = {
    URLS: {
        decimatorMiddleware: "https://oiip.jpl.nasa.gov/getDecData",
        // decimatorMiddleware: "http://localhost:8101/getData",
    },
    LAYER_URL_SWAPS: [["cwcgom.aoml.noaa.gov/thredds/wms/", "coverage.wekeo.eu/onearth/"]],
    LAYER_URL_PARAM_OVERRIDES: {
        CLASS: {
            STYLES: "boxfill/seascapes",
            COLORSCALERANGE: "1,33",
        },
        P: {
            STYLES: "boxfill/seascapes",
            COLORSCALERANGE: "0,1",
        },
        sargassum: {
            STYLES: "default-scalar",
            COLORSCALERANGE: "0,0.004",
        },
    },
    SOLR_QUERY_ROWS_LIMIT: 5000,
};
