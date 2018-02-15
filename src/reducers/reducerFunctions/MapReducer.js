import Immutable from "immutable";
import moment from "moment";
import MapReducerCore from "_core/reducers/reducerFunctions/MapReducer";
import { layerModel } from "reducers/models/map";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "utils/MiscUtil";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class MapReducer extends MapReducerCore {
    static mergeLayers(state, action) {
        let partials = state.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_PARTIAL]);
        let refPartial = null;
        let matchingPartials = null;
        let mergedLayer = null;
        let newLayers = null;
        while (partials.size > 0) {
            // grab a partial
            refPartial = partials.last();
            // remove it from future evaluation
            partials = partials.pop();
            // grab matching partials
            matchingPartials = partials.filter(el => {
                return el.get("id") === refPartial.get("id");
            });
            // remove them from future evaluation
            partials = partials.filter(el => {
                return el.get("id") !== refPartial.get("id");
            });
            // merge the matching partials together
            mergedLayer = matchingPartials.reduce((acc, el) => {
                if (el.get("fromJson")) {
                    return acc.mergeDeep(el);
                }
                return el.mergeDeep(acc);
            }, refPartial);
            // merge in the default values
            mergedLayer = layerModel.mergeDeep(mergedLayer);

            // put the newly minted layer into state storage
            if (
                typeof mergedLayer.get("id") !== "undefined" &&
                typeof state.getIn(["layers", mergedLayer.get("type")]) !== "undefined"
            ) {
                state = state.setIn(
                    ["layers", mergedLayer.get("type"), mergedLayer.get("id")],
                    mergedLayer
                );
            } else {
                console.warn(
                    "Error in MapReducer.mergeLayers: could not store merged layer; missing a valid id or type.",
                    mergedLayer.toJS()
                );
            }
        }
        return state.removeIn(["layers", appStringsCore.LAYER_GROUP_TYPE_PARTIAL]); // remove the partials list so that it doesn't intrude later
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

                    // // keep the index in bounds
                    // let counter = state.get("layerCounter");
                    // let numColors = appConfig.INSITU_VECTOR_COLORS.length;
                    // let colorIndex = counter % numColors;

                    // // try to avoid similar colors one after another
                    // colorIndex = colorIndex % 2 === 0 ? colorIndex : numColors - (colorIndex + 1);
                    // let color = appConfig.INSITU_VECTOR_COLORS[colorIndex];
                    let colorIndex = MiscUtil.getRandomInt(
                        0,
                        appConfig.INSITU_VECTOR_COLORS.length
                    );
                    let color = appConfig.INSITU_VECTOR_COLORS[colorIndex];
                    state = state.setIn(
                        [
                            "layers",
                            appStrings.LAYER_GROUP_TYPE_INSITU_DATA,
                            actionLayer.get("id"),
                            "vectorColor"
                        ],
                        color
                    );
                }
            }
        }

        state = MapReducerCore.setLayerActive(state, action);

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

                        let dateStr = data.getIn([0, "properties", "time"]);
                        let dateStrAlt = data.getIn([0, "properties", "datetimestamp"]);
                        dateStr = typeof dateStr === "undefined" ? dateStrAlt : dateStr;
                        if (typeof dateStr !== "undefined") {
                            state = MapReducerCore.setMapDate(state, { date: new Date(dateStr) });
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
}
