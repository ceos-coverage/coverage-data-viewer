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

/*eslint-disable import/default*/
import "@babel/polyfill";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import configureStore from "store/configureStore";
import { AppContainer } from "components/App"; // Replace this with your own non-core version src/components/AppContainer/AppContainer.js
// site icons
require("styles/resources/favicon.ico");
require("styles/resources/favicon-32x32.png");
require("styles/resources/favicon-96x96.png");
// layer thumbnails
require("_core/styles/resources/img/layer_thumbnails/BlueMarble_ShadedRelief_Bathymetry.jpeg");
require("_core/styles/resources/img/layer_thumbnails/OSM_Land_Water_Map.png");
require("_core/styles/resources/img/layer_thumbnails/ASTER_GDEM_Color_Shaded_Relief.jpeg");
require("_core/styles/resources/img/layer_thumbnails/ESRI_World_Imagery.jpeg");
// help article images
require("default-data/help/img/charting-create-fig1.png");
require("default-data/help/img/charting-create-fig2.png");
require("default-data/help/img/charting-create-fig3.png");
require("default-data/help/img/charting-create-fig4.png");
require("default-data/help/img/charting-create-fig5.png");
require("default-data/help/img/charting-create-fig6.png");
require("default-data/help/img/charting-usage-fig1.png");
require("default-data/help/img/charting-usage-fig2.png");
require("default-data/help/img/charting-usage-fig3.png");
require("default-data/help/img/charting-usage-fig4.png");
require("default-data/help/img/charting-usage-fig5.png");
require("default-data/help/img/charting-usage-fig6.png");
require("default-data/help/img/charting-usage-fig7.png");
require("default-data/help/img/charting-usage-fig8.png");
require("default-data/help/img/charting-usage-fig9.png");
require("default-data/help/img/charting-usage-fig10.png");
require("default-data/help/img/charting-usage-fig11.png");
require("default-data/help/img/mapping-general-fig1.png");
require("default-data/help/img/mapping-general-fig2.png");
require("default-data/help/img/mapping-general-fig3.png");
require("default-data/help/img/mapping-insitu-fig1.png");
require("default-data/help/img/mapping-insitu-fig2.png");
require("default-data/help/img/mapping-insitu-fig3.png");
require("default-data/help/img/mapping-insitu-fig4.png");
require("default-data/help/img/mapping-insitu-fig5.png");
require("default-data/help/img/mapping-insitu-fig6.png");
require("default-data/help/img/mapping-insitu-fig7.png");
require("default-data/help/img/mapping-insitu-fig8.png");
require("default-data/help/img/search-insitu-fig1.png");
require("default-data/help/img/search-insitu-fig2.png");
require("default-data/help/img/search-insitu-fig3.png");
require("default-data/help/img/search-satellite-fig1.png");
require("default-data/help/img/search-satellite-fig2.png");
require("default-data/help/img/search-satellite-fig3.png");
require("default-data/help/img/time-animation-fig1.png");
require("default-data/help/img/time-current-fig1.png");
require("default-data/help/img/time-current-fig2.png");
require("default-data/help/img/time-current-fig3.png");
require("default-data/help/img/time-current-fig4.png");
require("default-data/help/img/time-current-fig5.png");
require("default-data/help/img/time-current-fig6.png");
require("default-data/help/img/ui-charting-fig1.png");
require("default-data/help/img/ui-insitu-datasets-fig1.png");
require("default-data/help/img/ui-insitu-datasets-fig2.png");
require("default-data/help/img/ui-insitu-datasets-fig3.png");
require("default-data/help/img/ui-insitu-search-fig1.png");
require("default-data/help/img/ui-insitu-search-fig2.png");
require("default-data/help/img/ui-map-controls-fig1.png");
require("default-data/help/img/ui-map-controls-fig2.png");
require("default-data/help/img/ui-map-controls-fig3.png");
require("default-data/help/img/ui-map-controls-fig4.png");
require("default-data/help/img/ui-map-controls-fig5.png");
require("default-data/help/img/ui-map-controls-fig6.png");
require("default-data/help/img/ui-satellite-datasets-fig1.png");
require("default-data/help/img/ui-satellite-datasets-fig2.png");
require("default-data/help/img/ui-satellite-datasets-fig3.png");
require("default-data/help/img/ui-satellite-search-fig1.png");
require("default-data/help/img/ui-satellite-search-fig2.png");

const store = configureStore();

render(
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById("app")
);
