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
require("styles/resources/favicon.ico");
require("styles/resources/favicon-32x32.png");
require("styles/resources/favicon-96x96.png");
require("_core/styles/resources/img/layer_thumbnails/BlueMarble_ShadedRelief_Bathymetry.jpeg");
require("_core/styles/resources/img/layer_thumbnails/OSM_Land_Water_Map.png");
require("_core/styles/resources/img/layer_thumbnails/ASTER_GDEM_Color_Shaded_Relief.jpeg");

const store = configureStore();

render(
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById("app")
);
