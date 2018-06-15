import Immutable from "immutable";
import moment from "moment";
import MapReducerCore from "_core/reducers/reducerFunctions/MapReducer";
import { layerModel } from "reducers/models/map";
import { alert as alertCore } from "_core/reducers/models/alert";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "utils/MiscUtil";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class MapReducer extends MapReducerCore {
    static getLayerModel() {
        return layerModel;
    }

    static setMapDate(state, action) {
        state = MapReducerCore.setMapDate(state, action);

        let size = state.get("dateIntervalSize");
        let scale = state.get("dateIntervalScale");
        let date = moment.utc(state.get("date"));

        return state.set("intervalDate", date.add(size, scale).toDate());
    }

    static setDateInterval(state, action) {
        let size = parseInt(action.size);
        let scale = action.scale;

        try {
            let testDate = moment.utc(state.get("date")).add(size, scale);
            if (testDate.isValid()) {
                return state.set("dateIntervalSize", size).set("dateIntervalScale", scale);
            }
        } catch (err) {
            console.warn("Error in MapReducer.setDateInterval: ", err);
            return state;
        }
    }

    static setLayerLoading(state, action) {
        let actionLayer = action.layer;
        if (typeof actionLayer === "string") {
            actionLayer = this.findLayerById(state, actionLayer);
        }
        if (typeof actionLayer !== "undefined") {
            state = state.setIn(
                ["layers", actionLayer.get("type"), actionLayer.get("id"), "isLoading"],
                action.isLoading
            );
        }
        return state;
    }

    static setLayerActive(state, action) {
        // turn off the other data layers first
        if (action.active) {
            // resolve layer from id if necessary
            let actionLayer = action.layer;
            if (typeof actionLayer === "string") {
                actionLayer = this.findLayerById(state, actionLayer);
            }
            if (typeof actionLayer !== "undefined") {
                if (actionLayer.get("type") === appStringsCore.LAYER_GROUP_TYPE_DATA) {
                    let dataLayers = state.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_DATA]);
                    dataLayers.map((layer, id) => {
                        if (layer.get("isActive")) {
                            state = MapReducerCore.setLayerActive(state, {
                                layer: id,
                                active: false
                            });
                        }
                    });
                } else if (actionLayer.get("type") === appStrings.LAYER_GROUP_TYPE_INSITU_DATA) {
                    // set the color of this vector layer
                    let dataLayers = state.getIn([
                        "layers",
                        appStrings.LAYER_GROUP_TYPE_INSITU_DATA
                    ]);

                    let colorIndex = MiscUtil.getRandomInt(
                        0,
                        appConfig.INSITU_VECTOR_COLORS.length
                    );
                    let color = appConfig.INSITU_VECTOR_COLORS[colorIndex];
                    state = state
                        .setIn(
                            [
                                "layers",
                                appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
                                actionLayer.get("id"),
                                "vectorColor"
                            ],
                            color
                        )
                        .setIn(
                            [
                                "layers",
                                appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
                                actionLayer.get("id"),
                                "isLoading"
                            ],
                            true
                        );
                }
            }
        }

        state = MapReducerCore.setLayerActive(state, action);

        return state;
    }

    static setTrackErrorActive(state, action) {
        // resolve layer from id if necessary
        let actionLayer = action.layer;
        if (typeof actionLayer === "string") {
            actionLayer = this.findLayerById(state, actionLayer);
        }
        if (typeof actionLayer !== "undefined") {
            state = state.setIn(
                ["layers", actionLayer.get("type"), actionLayer.get("id"), "isErrorActive"],
                action.isActive
            );
        }
        return state;
    }

    static pixelHover(state, action) {
        let pixelCoordinate = state.getIn(["view", "pixelHoverCoordinate"]).set("isValid", false);
        state.get("maps").forEach(map => {
            if (map.isActive) {
                let data = [];
                let coords = map.getLatLonFromPixelCoordinate(action.pixel);
                if (coords.isValid) {
                    // find data if any
                    data = map.getDataAtPoint(coords, action.pixel, state.get("palettes"));
                    data = data !== false ? data : [];
                    data = Immutable.fromJS(
                        data.map(entry => {
                            entry.layer = this.findLayerById(state, entry.layerId);
                            return entry;
                        })
                    );

                    // set the coordinate as valid
                    pixelCoordinate = pixelCoordinate
                        .set("lat", coords.lat)
                        .set("lon", coords.lon)
                        .set("x", action.pixel[0])
                        .set("y", action.pixel[1])
                        .set("data", data)
                        .set("showData", data.size > 0)
                        .set("isValid", true);
                } else {
                    pixelCoordinate = pixelCoordinate.set("isValid", false);
                }
            }
            return true;
        });
        return state.setIn(["view", "pixelHoverCoordinate"], pixelCoordinate);
    }

    static pixelClick(state, action) {
        let pixelCoordinate = state.getIn(["view", "pixelClickCoordinate"]).set("isValid", false);
        state.get("maps").forEach(map => {
            if (map.isActive) {
                let data = [];
                let pixel = map.getPixelFromClickEvent(action.clickEvt);
                if (pixel) {
                    let coords = map.getLatLonFromPixelCoordinate(pixel);
                    if (coords.isValid) {
                        // find data if any
                        data = map.getDataAtPoint(coords, pixel, state.get("palettes"));
                        data = data !== false ? data : [];
                        data = Immutable.fromJS(
                            data.map(entry => {
                                entry.layer = this.findLayerById(state, entry.layerId);
                                return entry;
                            })
                        );

                        // set the coordinate as valid
                        pixelCoordinate = pixelCoordinate
                            .set("lat", coords.lat)
                            .set("lon", coords.lon)
                            .set("x", pixel[0])
                            .set("y", pixel[1])
                            .set("data", data)
                            .set("showData", data.size > 0)
                            .set("isValid", true);

                        let dateStr = data.getIn([0, "properties", "position_date_time", 0]);
                        if (typeof dateStr !== "undefined") {
                            // let date = moment.utc(dateStr, data.getIn([0, "layer", "timeFormat"]));
                            let date = moment.utc(dateStr);
                            state = MapReducer.setMapDate(state, { date: date.toDate() });
                        }
                    } else {
                        pixelCoordinate = pixelCoordinate.set("isValid", false);
                    }
                }
            }
            return true;
        });

        return state.setIn(["view", "pixelClickCoordinate"], pixelCoordinate);
    }

    static addLayer(state, action) {
        if (typeof action.layer !== "undefined") {
            let mergedLayer = this.getLayerModel().mergeDeep(action.layer);
            if (
                typeof mergedLayer.get("id") !== "undefined" &&
                typeof state.getIn(["layers", mergedLayer.get("type")]) !== "undefined"
            ) {
                state = state.setIn(
                    ["layers", mergedLayer.get("type"), mergedLayer.get("id")],
                    mergedLayer
                );
            }

            return this.setLayerActive(state, {
                layer: mergedLayer.get("id"),
                active: action.setActive
            });
        }

        return state;
    }

    static removeLayer(state, action) {
        if (state.hasIn(["layers", action.layer.get("type"), action.layer.get("id")])) {
            state = this.setLayerActive(state, {
                layer: action.layer.get("id"),
                active: false
            });
            return state.deleteIn(["layers", action.layer.get("type"), action.layer.get("id")]);
        }
        return state;
    }

    static setInsituVectorLayerColor(state, action) {
        // resolve layer from id if necessary
        let actionLayer = action.layer;
        if (typeof actionLayer === "string") {
            actionLayer = this.findLayerById(state, actionLayer);
        }

        if (typeof actionLayer !== "undefined") {
            let anySucceed = state.get("maps").reduce((acc, map) => {
                if (map.setVectorLayerColor(actionLayer, action.color)) {
                    return true;
                }
                return acc;
            }, false);

            if (anySucceed) {
                state = state.setIn(
                    ["layers", actionLayer.get("type"), actionLayer.get("id"), "vectorColor"],
                    action.color
                );
            }
        }

        return state;
    }

    static zoomToLayer(state, action) {
        // resolve layer from id if necessary
        let actionLayer = action.layer;
        if (typeof actionLayer === "string") {
            actionLayer = this.findLayerById(state, actionLayer);
        }

        if (typeof actionLayer !== "undefined") {
            let anySucceed = state.get("maps").reduce((acc, map) => {
                if (map.zoomToLayer(actionLayer, action.pad)) {
                    return true;
                }
                return acc;
            }, false);
        }

        return state;
    }

    static enableAreaSelection(state, action) {
        action.delayClickEnable = false;
        state = this.disableMeasuring(state, action);
        state = this.disableDrawing(state, action);
        state = this.disableAreaSelection(state, action);

        // For each map, enable drawing
        let anySucceed = state.get("maps").reduce((acc, map) => {
            if (map.isActive) {
                if (map.enableAreaSelection(action.geometryType)) {
                    return true;
                }
            }
            return acc;
        }, false);

        if (anySucceed) {
            return state
                .setIn(["areaSelection", "isAreaSelectionEnabled"], true)
                .setIn(["areaSelection", "geometryType"], action.geometryType);
        }
        return state;
    }

    static enableMeasuring(state, action) {
        state = this.disableAreaSelection(state, { delayClickEnable: false });
        return MapReducerCore.enableMeasuring(state, action);
    }

    static disableAreaSelection(state, action) {
        // For each map, disable drawing
        let anySucceed = state.get("maps").reduce((acc, map) => {
            if (map.disableAreaSelection(action.delayClickEnable)) {
                return true;
            }
            return acc;
        }, false);

        if (anySucceed) {
            return state
                .setIn(["areaSelection", "isAreaSelectionEnabled"], false)
                .setIn(["areaSelection", "geometryType"], "");
        }
        return state;
    }

    static removeAllAreaSelections(state, action) {
        state = this.disableAreaSelection(state, action);
        state = this.disableDrawing(state, action);
        state = this.disableMeasuring(state, action);

        let alerts = state.get("alerts");
        state.get("maps").forEach(map => {
            if (!map.removeAllAreaSelections()) {
                let contextStr = map.is3D ? "3D" : "2D";
                alerts = alerts.push(
                    alertCore.merge({
                        title: appStrings.ALERTS.GEOMETRY_REMOVAL_FAILED.title,
                        body: appStrings.ALERTS.GEOMETRY_REMOVAL_FAILED.formatString.replace(
                            "{MAP}",
                            contextStr
                        ),
                        severity: appStrings.ALERTS.GEOMETRY_REMOVAL_FAILED.severity,
                        time: new Date()
                    })
                );
            }
        });

        return state.set("alerts", alerts);
    }

    static addGeometryToMap(state, action) {
        if (
            action.interactionType === appStrings.INTERACTION_AREA_SELECTION ||
            action.interactionType === appStrings.INTERACTION_AREA_DISPLAY
        ) {
            let alerts = state.get("alerts");
            // Add geometry to each inactive map
            state.get("maps").forEach(map => {
                // Only add geometry to inactive maps unless it's an area selection
                if (!map.addGeometry(action.geometry, action.interactionType, action.geodesic)) {
                    let contextStr = map.is3D ? "3D" : "2D";
                    alerts = alerts.push(
                        alertCore.merge({
                            title: appStringsCore.ALERTS.GEOMETRY_SYNC_FAILED.title,
                            body: appStringsCore.ALERTS.GEOMETRY_SYNC_FAILED.formatString.replace(
                                "{MAP}",
                                contextStr
                            ),
                            severity: appStringsCore.ALERTS.GEOMETRY_SYNC_FAILED.severity,
                            time: new Date()
                        })
                    );
                }
            });
            return state.set("alerts", alerts);
        } else {
            return MapReducerCore.addGeometryToMap(state, action);
        }
    }

    static removeGeometry(state, action) {
        if (
            action.interactionType === appStrings.INTERACTION_AREA_SELECTION ||
            action.interactionType === appStrings.INTERACTION_AREA_DISPLAY
        ) {
            let alerts = state.get("alerts");
            // Add geometry to each inactive map
            state.get("maps").forEach(map => {
                // Only add geometry to inactive maps unless it's an area selection
                if (!map.removeGeometry(action.geometry, action.interactionType)) {
                    let contextStr = map.is3D ? "3D" : "2D";
                    alerts = alerts.push(
                        alertCore.merge({
                            title: appStringsCore.ALERTS.GEOMETRY_SYNC_FAILED.title,
                            body: appStringsCore.ALERTS.GEOMETRY_SYNC_FAILED.formatString.replace(
                                "{MAP}",
                                contextStr
                            ),
                            severity: appStringsCore.ALERTS.GEOMETRY_SYNC_FAILED.severity,
                            time: new Date()
                        })
                    );
                }
            });
            return state.set("alerts", alerts);
        } else {
            return state;
        }
    }
}
