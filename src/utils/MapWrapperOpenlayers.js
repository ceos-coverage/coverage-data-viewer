/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as Ol_Has from "ol/has";
import Ol_Interaction_Draw, { createBox } from "ol/interaction/Draw";
import Ol_Layer_Vector from "ol/layer/Vector";
import Ol_Layer_Group from "ol/layer/Group";
import Ol_Layer_Image from "ol/layer/Image";
import Ol_Layer_VectorTile from "ol/layer/VectorTile";
import Ol_Source_Vector from "ol/source/Vector";
import Ol_Source_VectorTile from "ol/source/VectorTile";
import Ol_Source_ImageCanvas from "ol/source/ImageCanvas";
import Ol_Layer_TileLayer from "ol/layer/Tile.js";
import Ol_Source_TileWMS from "ol/source/TileWMS.js";
import Ol_Format_KML from "ol/format/KML";
import Ol_Format_MVT from "ol/format/MVT";
import Ol_Style from "ol/style/Style";
import Ol_Style_Stroke from "ol/style/Stroke";
import Ol_Style_Fill from "ol/style/Fill";
import Ol_Style_RegularShape from "ol/style/RegularShape";
import Ol_Collection from "ol/Collection";
import { unByKey } from "ol/Observable";
import Ol_Style_Circle from "ol/style/Circle";
import Ol_Feature from "ol/Feature";
import Ol_Geom_Polygon from "ol/geom/Polygon";
import * as Ol_FeatureLoader from "ol/featureloader";
import Ol_Format_GeoJSON from "ol/format/GeoJSON";
import Ol_Geom_MultiLineString from "ol/geom/MultiLineString";
import Ol_Geom_Point from "ol/geom/Point";
import Ol_TileGrid from "ol/tilegrid/TileGrid";
import moment from "moment";
import MapWrapperOpenlayersCore from "_core/utils/MapWrapperOpenlayers";
import AnimationBuffer from "utils/AnimationBuffer";
import TileLoadingQueue from "utils/TileLoadingQueue";
import appConfig from "constants/appConfig";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "utils/MiscUtil";
import MapUtil from "utils/MapUtil";
import TileHandler from "utils/TileHandler";

import kmlText from "default-data/kmlExtents.json";
const kmlLayerExtents = JSON.parse(kmlText);
const TILE_STATE_IDLE = 0; // loading states found in ol.tile.js
const TILE_STATE_LOADING = 1;
const TILE_STATE_LOADED = 2;
const TILE_STATE_ERROR = 3;
const TILE_STATE_EMPTY = 4;
const TILE_STATE_ABORT = 5;
const NO_LOAD_STATES = [TILE_STATE_LOADING, TILE_STATE_LOADED, TILE_STATE_ERROR, TILE_STATE_EMPTY];
const LOAD_COMPLETE_STATES = [TILE_STATE_LOADED, TILE_STATE_ERROR, TILE_STATE_EMPTY];
let _tilesLoading = 0;

const HACK_AIS_COLORS = [
    ["dredge_fishing", "#9CF6F6"],
    ["drifting_longlines", "#a6cee3"],
    ["driftnets", "#1f78b4"],
    ["fishing", "#b2df8a"],
    ["fixed_gear", "#33a02c"],
    ["other_fishing", "#fb9a99"],
    ["other_purse_seines", "#e31a1c"],
    ["other_seines", "#471323"],
    ["pole_and_line", "#fdbf6f"],
    ["pots_and_traps", "#ff7f00"],
    ["purse_seines", "#cab2d6"],
    ["set_gillnets", "#6a3d9a"],
    ["set_longlines", "#B5BA72"],
    ["squid_jigger", "#ffff99"],
    ["trawlers", "#b15928"],
    ["trollers", "#2B2118"],
    ["tuna_purse_seines", "#4C5760"],
];

export default class MapWrapperOpenlayers extends MapWrapperOpenlayersCore {
    initStaticClasses(container, options) {
        MapWrapperOpenlayersCore.prototype.initStaticClasses.call(this, container, options);
        this.miscUtil = MiscUtil;
        this.mapUtil = MapUtil;
        this.tileHandler = TileHandler;
    }

    initObjects(container, options) {
        MapWrapperOpenlayersCore.prototype.initObjects.call(this, container, options);
        this.animationBuffer = new AnimationBuffer(22);
        this.tileLoadingQueue = new TileLoadingQueue();
        this.layerLoadCallback = undefined;
        this.dateInterval = { scale: "day", size: 1 };
    }

    setMapDateInterval(interval) {
        if (typeof interval !== "undefined") {
            this.dateInterval = interval;
            return true;
        }
        return false;
    }

    setLayerLoadCallback(callback) {
        if (typeof callback === "function") {
            this.layerLoadCallback = callback;
        }
    }

    setLayerRefInfo(layer, mapLayer) {
        mapLayer.set("_layerRef", layer);
        return MapWrapperOpenlayersCore.prototype.setLayerRefInfo.call(this, layer, mapLayer);
    }

    createMap(container, options) {
        let map = MapWrapperOpenlayersCore.prototype.createMap.call(this, container, options);

        if (map) {
            // create area display layer
            let areaDisplayNormalSource = new Ol_Source_Vector({ wrapX: true });
            let areaDisplayNormalLayer = new Ol_Layer_Vector({
                source: areaDisplayNormalSource,
                extent: appConfig.DEFAULT_MAP_EXTENT,
                style: this.areaDisplayNormalStyle,
            });
            let areaDisplayLayer = new Ol_Layer_Group({
                extent: appConfig.DEFAULT_MAP_EXTENT,
                layers: [areaDisplayNormalLayer],
                visible: true,
            });
            areaDisplayLayer.set("_layerId", "_area_display_layer");
            areaDisplayLayer.set("_layerType", appStringsCore.LAYER_GROUP_TYPE_REFERENCE);
            map.addLayer(areaDisplayLayer);

            // create point highlight layer
            let pointHighlightSource = new Ol_Source_Vector({ wrapX: true });
            let pointHighlightLayer = new Ol_Layer_Vector({
                source: pointHighlightSource,
                renderMode: "image",
                style: this.pointHighlightStyle,
            });
            pointHighlightLayer.set("_layerId", "_point_highlight_layer");
            pointHighlightLayer.set("_layerType", appStringsCore.LAYER_GROUP_TYPE_REFERENCE);
            map.addLayer(pointHighlightLayer);

            map.on("precompose", function (evt) {
                evt.context.imageSmoothingEnabled = false;
                evt.context.webkitImageSmoothingEnabled = false;
                evt.context.mozImageSmoothingEnabled = false;
                evt.context.msImageSmoothingEnabled = false;
            });
        }

        return map;
    }

    configureStyles(container, options) {
        MapWrapperOpenlayersCore.prototype.configureStyles.call(this, container, options);
        let defaultDrawingStyleCore = this.defaultDrawingStyle;

        this.defaultDrawingStyle = (
            feature,
            resolution,
            measureType = appStringsCore.MEASURE_DISTANCE
        ) => {
            return defaultDrawingStyleCore(feature, resolution, measureType);
        };

        this.pointHighlightStyle = (feature, resolution) => {
            let color = feature.get("_color") || "#FF0000";
            if (feature.get("_isFirst")) {
                return [
                    new Ol_Style({
                        image: new Ol_Style_RegularShape({
                            fill: new Ol_Style_Fill({
                                color: "#fff",
                            }),
                            points: 3,
                            stroke: new Ol_Style_Stroke({
                                color: "#000",
                            }),
                            rotation: Math.PI,
                            radius: 13,
                        }),
                        zIndex: 2,
                    }),
                    new Ol_Style({
                        image: new Ol_Style_RegularShape({
                            fill: new Ol_Style_Fill({
                                color: color,
                            }),
                            points: 3,
                            stroke: new Ol_Style_Stroke({
                                color: "#000",
                            }),
                            rotation: Math.PI,
                            radius: 8,
                        }),
                        zIndex: 2,
                    }),
                ];
            } else if (feature.get("_isLast")) {
                return [
                    new Ol_Style({
                        image: new Ol_Style_RegularShape({
                            fill: new Ol_Style_Fill({
                                color: "#fff",
                            }),
                            points: 3,
                            stroke: new Ol_Style_Stroke({
                                color: "#000",
                            }),
                            radius: 13,
                        }),
                        zIndex: 2,
                    }),
                    new Ol_Style({
                        image: new Ol_Style_RegularShape({
                            fill: new Ol_Style_Fill({
                                color: color,
                            }),
                            points: 3,
                            stroke: new Ol_Style_Stroke({
                                color: "#000",
                            }),
                            radius: 8,
                        }),
                        zIndex: 2,
                    }),
                ];
            } else {
                return [
                    new Ol_Style({
                        stroke: new Ol_Style_Stroke({
                            color: "#000",
                            width: 9.75,
                        }),
                        zIndex: 2,
                    }),
                    new Ol_Style({
                        stroke: new Ol_Style_Stroke({
                            color: "#fff",
                            width: 8.5,
                        }),
                        zIndex: 2,
                    }),
                    new Ol_Style({
                        image: new Ol_Style_Circle({
                            fill: new Ol_Style_Fill({ color: "#fff" }),
                            stroke: new Ol_Style_Stroke({
                                color: "#000",
                            }),
                            radius: 7,
                        }),
                        stroke: new Ol_Style_Stroke({
                            color: "#000",
                            width: 5.25,
                        }),
                        zIndex: 2,
                    }),
                    new Ol_Style({
                        image: new Ol_Style_Circle({
                            fill: new Ol_Style_Fill({
                                color: color,
                            }),
                            stroke: new Ol_Style_Stroke({
                                color: "#000",
                            }),
                            radius: 4,
                        }),
                        stroke: new Ol_Style_Stroke({
                            color: color,
                            width: 4,
                        }),
                        zIndex: 2,
                    }),
                ];
            }
        };
    }

    addEventListener(eventStr, callback) {
        try {
            switch (eventStr) {
                case appStringsCore.EVENT_MOUSE_HOVER:
                    return this.map.addEventListener("pointermove", (position) => {
                        this.miscUtil.throttledCallback(() => {
                            callback(position.pixel);
                        });
                    });
                case appStringsCore.EVENT_MOUSE_CLICK:
                    return this.map.addEventListener("click", (clickEvt) => {
                        this.miscUtil.throttledCallback(() => {
                            callback({ pixel: clickEvt.pixel });
                        });
                    });
                case appStringsCore.EVENT_MOVE_END:
                    return this.map.addEventListener("moveend", (e) => {
                        this.miscUtil.throttledCallback(callback);
                    });
                default:
                    return this.map.addEventListener(eventStr, (e) => {
                        this.miscUtil.throttledCallback(callback);
                    });
            }
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.addEventListener:", err);
            return false;
        }
    }

    setExtent(extent, padView = false) {
        try {
            if (extent) {
                let mapSize = this.map.getSize() || [];
                this.map.getView().fit(extent, {
                    size: mapSize,
                    constrainResolution: false,
                    padding: padView ? [70, 70, 70, 70] : undefined,
                });
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.setExtent:", err);
            return false;
        }
    }

    deactivateLayer(layer) {
        let mapLayers = this.map.getLayers().getArray();
        let mapLayer = this.miscUtil.findObjectInArray(
            mapLayers,
            "_layerId",
            "_point_highlight_layer"
        );
        if (mapLayer) {
            let source = mapLayer.getSource();
            let layerId = layer.get("id");
            let currFeatureList = source.getFeatures();
            for (let i = 0; i < currFeatureList.length; ++i) {
                let feature = currFeatureList[i];
                if (feature.get("_layerId") === layerId) {
                    source.removeFeature(feature);
                }
            }
        }
        return MapWrapperOpenlayersCore.prototype.deactivateLayer.call(this, layer);
    }

    createLayer(layer, date, fromCache = true) {
        let mapLayer = false;

        // pull from cache if possible
        let cacheHash = this.getCacheHash(layer, date);
        if (fromCache && this.layerCache.get(cacheHash)) {
            let cachedLayer = this.layerCache.get(cacheHash);
            cachedLayer.setOpacity(layer.get("opacity"));
            cachedLayer.setVisible(layer.get("isActive"));

            // update the style
            if (layer.get("handleAs") === appStrings.LAYER_VECTOR_POINT_TRACK) {
                cachedLayer.setStyle(
                    this.createVectorPointTrackLayerStyles(layer.get("vectorColor"))
                );
            }

            if (
                typeof cachedLayer.getSource === "function" &&
                cachedLayer.getSource().get("_hasLoaded")
            ) {
                // run async to avoid reducer block
                window.requestAnimationFrame(() => {
                    // run the call back (if it exists)
                    if (typeof this.layerLoadCallback === "function") {
                        this.layerLoadCallback(layer);
                    }
                });
            }

            return cachedLayer;
        }

        // create a new layer
        switch (layer.get("handleAs")) {
            case appStrings.LAYER_VECTOR_TILE_TRACK:
                mapLayer = this.createVectorTileTrackLayer(layer, fromCache);
                break;
            case appStrings.LAYER_VECTOR_TILE_POINTS:
                mapLayer = this.createVectorTilePointsLayer(layer, fromCache);
                break;
            case appStrings.LAYER_VECTOR_POINT_TRACK:
                mapLayer = this.createVectorPointTrackLayer(layer, fromCache);
                break;
            case appStrings.LAYER_VECTOR_TILE_TRACK_ERROR:
                mapLayer = this.createVectorTileTrackLayer(layer, fromCache);
                break;
            case appStrings.LAYER_MULTI_FILE_VECTOR_KML:
                mapLayer = this.createMultiFileKmlLayer(layer, fromCache);
                break;
            case appStrings.LAYER_VECTOR_TILE_OUTLINE:
                mapLayer = this.createVectorTileOutline(layer, fromCache);
                break;
            case appStrings.LAYER_VECTOR_POINTS_WFS:
                mapLayer = this.createDynamicVectorPointLayer(layer, fromCache);
                break;
            case appStrings.LAYER_WMS_TILE_RASTER:
                mapLayer = this.createTiledWMSLayer(layer, fromCache);
                break;
            default:
                mapLayer = MapWrapperOpenlayersCore.prototype.createLayer.call(
                    this,
                    layer,
                    false // we don't want the parent class using the wrong cache key
                );
                break;
        }

        if (mapLayer) {
            mapLayer.set("_layerId", layer.get("id"));
            mapLayer.set("_layerType", layer.get("type"));
            mapLayer.set("_layerRef", layer);
            if (date) {
                mapLayer.set("_layerTime", moment.utc(date).format(layer.get("timeFormat")));
                mapLayer.set("_layerCacheHash", this.getCacheHash(layer, date));
            } else {
                mapLayer.set("_layerCacheHash", this.getCacheHash(layer));
                mapLayer.set(
                    "_layerTime",
                    moment.utc(this.mapDate).format(layer.get("timeFormat"))
                );
            }
        }

        return mapLayer;
    }

    createTiledWMSLayer(layer, fromCache = true) {
        const mappingOptions = layer.get("mappingOptions").toJS();

        // check cache for source
        let cacheSource = false;
        if (fromCache) {
            let cacheHash = this.getCacheHash(layer) + "_source";
            if (this.layerCache.get(cacheHash)) {
                cacheSource = this.layerCache.get(cacheHash);
            }
        }

        const urlOverrides = appConfig.LAYER_URL_PARAM_OVERRIDES[layer.get("id")] || {};

        // url swap
        let url = mappingOptions.url;
        appConfig.LAYER_URL_SWAPS.forEach((swap) => {
            url = url.replace(swap[0], swap[1]);
        });

        const layerSource =
            cacheSource ||
            new Ol_Source_TileWMS({
                url,
                projection: mappingOptions.crs || "EPSG:4326",
                params: {
                    LAYERS: mappingOptions.layer,
                    TIME: "{Time}",
                    FORMAT: mappingOptions.format,
                    ...urlOverrides,
                },
                transition: 0,
            });

        const mapLayer = new Ol_Layer_TileLayer({
            extent: mappingOptions.extents || [-180, -90, 180, 90],
            source: layerSource,
        });

        this.setWMSLayerOverrides(layer, mapLayer, layerSource);

        return mapLayer;
    }

    createDynamicVectorPointLayer(layer, fromCache = true) {
        try {
            // pull from cache if possible
            let cacheHash = this.getCacheHash(layer);
            if (fromCache && this.layerCache.get(cacheHash)) {
                let cachedLayer = this.layerCache.get(cacheHash);
                cachedLayer.setOpacity(layer.get("opacity"));
                cachedLayer.setVisible(layer.get("isActive"));
                return cachedLayer;
            }

            // create a layer grouping
            let mapLayer = new Ol_Layer_Group({
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
            });

            // source for dummy canvas layer
            let imageSource = new Ol_Source_ImageCanvas({
                canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
                    const layerObj = mapLayer.get("_layerRef") || layer;
                    return this.dynamicVectorPointCanvasFunction(
                        layerObj,
                        mapLayer,
                        extent,
                        resolution,
                        pixelRatio,
                        size,
                        projection
                    );
                },
                projection: this.map.getView().getProjection(),
                ratio: 1,
            });
            imageSource.set("_dummyCanvas", true);

            // dummy canvas image layer to track map movements
            let imageLayer = new Ol_Layer_Image({
                source: imageSource,
            });

            // add a canvas layer that will find intersecting KMLs on each map move
            mapLayer.setLayers(new Ol_Collection([imageLayer]));

            // return the layer group
            return mapLayer;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createDynamicVectorPointLayer:", err);
            return false;
        }
    }

    dynamicVectorPointCanvasFunction(
        layer,
        mapLayer,
        extent,
        resolution,
        pixelRatio,
        size,
        projection
    ) {
        // manage extent wrapping
        let viewExtentsArr = [];
        let cExtentA = this.mapUtil.constrainCoordinates([extent[0], extent[1]]);
        let cExtentB = this.mapUtil.constrainCoordinates([extent[2], extent[3]]);
        let cExtent = [cExtentA[0], cExtentA[1], cExtentB[0], cExtentB[1]];
        let extentWidth = extent[2] - extent[0];
        if (extentWidth >= 360) {
            viewExtentsArr = [[-180, cExtent[1], 180, cExtent[3]]];
        } else {
            // check for extents  across the dateline
            if (cExtent[0] > cExtent[2]) {
                viewExtentsArr = [
                    [cExtent[0], cExtent[1], 180, cExtent[3]],
                    [-180, cExtent[1], cExtent[2], cExtent[3]],
                ];
            } else {
                viewExtentsArr = [cExtent];
            }
        }

        // create the canvas
        let canvas = document.createElement("canvas");
        let canvasWidth = size[0],
            canvasHeight = size[1];
        canvas.setAttribute("width", canvasWidth);
        canvas.setAttribute("height", canvasHeight);

        // remove all vector layers currently in the layer group
        let prevLayers = {};
        let layerGroup = mapLayer.getLayers();
        while (layerGroup.getLength() > 1) {
            try {
                let tmpLayer = layerGroup.pop();
                prevLayers[tmpLayer.getSource().getUrl()] = tmpLayer;
            } catch (e) {
                console.warn("Error in MapWrapperOpenlayers.dynamicVectorPointCanvasFunction: ", e);
            }
        }

        // reformat the URL
        let url = layer.get("url");
        let urlFunction = false;
        if (
            typeof url !== "undefined" &&
            typeof layer.getIn(["mappingOptions", "urlFunctions", appStringsCore.MAP_LIB_2D]) !==
                "undefined"
        ) {
            urlFunction = this.tileHandler.getUrlFunction(
                layer.getIn(["mappingOptions", "urlFunctions", appStringsCore.MAP_LIB_2D])
            );
        }

        // pull the current date interval
        // hack the dates to snap to the 15th - TODO: fix up backend to support arbitrary interval
        const date = moment.utc(moment.utc(this.mapDate).format("YYYY-MM-15T00:00:01Z"));
        const endTime = date.valueOf();
        const startTime = date.subtract(this.dateInterval.size, this.dateInterval.scale).valueOf();

        // define a function to generate vector layers for each section of the view
        const _context = this;
        const genVectorLayer = (extent) => {
            const url = urlFunction({
                layer: layer,
                url: layer.get("url"),
                extent: extent,
                endTime,
                startTime,
            });
            const source = new Ol_Source_Vector({
                loader: function (e, r, p) {
                    MiscUtil.asyncFetch({
                        url: url,
                        handleAs: appStringsCore.FILE_TYPE_JSON,
                    }).then(
                        (data) => {
                            const featuresToAdd = [];
                            const features = data.features;
                            const featureMap = {};

                            for (let i = 0; i < features.length; ++i) {
                                const feature = features[i];
                                const coords = feature.geometry.coordinates;
                                const coordsStr = coords.join(",");

                                let combinedFeature = featureMap[coordsStr];
                                if (typeof combinedFeature === "undefined") {
                                    combinedFeature = new Ol_Feature({
                                        geometry: new Ol_Geom_Point(coords),
                                    });
                                    combinedFeature.set("oiipFeatureCollection", [feature]);
                                    combinedFeature.set("_layerId", layer.get("id"));
                                    featuresToAdd.push(combinedFeature);
                                    featureMap[coordsStr] = combinedFeature;
                                } else {
                                    combinedFeature.get("oiipFeatureCollection").push(feature);
                                }
                            }

                            // add features to the layer
                            if (featuresToAdd.length > 0) {
                                this.addFeatures(featuresToAdd);
                            }

                            source.set("_hasLoaded", true);

                            // run the call back (if it exists)
                            if (typeof _context.layerLoadCallback === "function") {
                                _context.layerLoadCallback(layer);
                            }
                        },
                        (err) => {
                            console.warn("Error fetching vector data", err);
                        }
                    );
                },
                format: new Ol_Format_GeoJSON(),
            });
            source.set("_loadingState", TILE_STATE_IDLE);

            const vecLayer = new Ol_Layer_Vector({
                opacity: 1,
                visible: true,
                renderMode: "image",
                source: source,
                style: this.createVectorPointLayerStyles(layer, layer.get("vectorColor")),
            });

            vecLayer.set("_layerId", layer.get("id"));
            vecLayer.set("_layerType", layer.get("type"));
            vecLayer.set("_layerRef", layer);

            return vecLayer;
        };

        // build a vector layer for each section of the view
        viewExtentsArr.forEach((extent) => {
            const layer = genVectorLayer(extent);
            layerGroup.push(layer);
        });

        // update the map layers
        mapLayer.setLayers(layerGroup);

        // run the call back (if it exists)
        if (typeof _context.layerLoadCallback === "function") {
            _context.layerLoadCallback(layer, true);
        }

        return canvas;
    }

    createMultiFileKmlLayer(layer, fromCache = true) {
        try {
            // pull from cache if possible
            let cacheHash = this.getCacheHash(layer);
            if (fromCache && this.layerCache.get(cacheHash)) {
                let cachedLayer = this.layerCache.get(cacheHash);
                cachedLayer.setOpacity(layer.get("opacity"));
                cachedLayer.setVisible(layer.get("isActive"));
                return cachedLayer;
            }

            // create a layer grouping
            let mapLayer = new Ol_Layer_Group({
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
            });

            // source for dummy canvas layer
            let imageSource = new Ol_Source_ImageCanvas({
                canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
                    return this.multiFileKmlCanvasFunction(
                        layer,
                        mapLayer,
                        extent,
                        resolution,
                        pixelRatio,
                        size,
                        projection
                    );
                },
                projection: this.map.getView().getProjection(),
                ratio: 1,
            });
            imageSource.set("_dummyCanvas", true);

            // dummy canvas image layer to track map movements
            let imageLayer = new Ol_Layer_Image({
                source: imageSource,
            });

            // add a canvas layer that will find intersecting KMLs on each map move
            mapLayer.setLayers(new Ol_Collection([imageLayer]));

            // return the layer group
            return mapLayer;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createMultiFileKmlLayer:", err);
            return false;
        }
    }

    multiFileKmlCanvasFunction(layer, mapLayer, extent, resolution, pixelRatio, size, projection) {
        // manage extent wrapping
        let viewExtentsArr = [];
        let cExtentA = this.mapUtil.constrainCoordinates([extent[0], extent[1]]);
        let cExtentB = this.mapUtil.constrainCoordinates([extent[2], extent[3]]);
        let cExtent = [cExtentA[0], cExtentA[1], cExtentB[0], cExtentB[1]];
        let extentWidth = extent[2] - extent[0];
        if (extentWidth >= 360) {
            viewExtentsArr = [[-180, cExtent[1], 180, cExtent[3]]];
        } else {
            // check for extents  across the dateline
            if (cExtent[0] > cExtent[2]) {
                viewExtentsArr = [
                    [cExtent[0], cExtent[1], 180, cExtent[3]],
                    [-180, cExtent[1], cExtent[2], cExtent[3]],
                ];
            } else {
                viewExtentsArr = [cExtent];
            }
        }

        // create the canvas
        let canvas = document.createElement("canvas");
        let canvasWidth = size[0],
            canvasHeight = size[1];
        canvas.setAttribute("width", canvasWidth);
        canvas.setAttribute("height", canvasHeight);

        let layerTileExtentsList = this.getExtentsListForLayer(layer);
        if (layerTileExtentsList) {
            // find the zoom ids we want
            let zoom = Math.max(1, Math.round(this.getZoom()) - 1);
            let tileEntries = viewExtentsArr.reduce(
                (acc, extentEntry) => {
                    let entries = this.mapUtil.findTileExtentsInView(
                        layerTileExtentsList,
                        extentEntry,
                        zoom
                    );
                    acc.tiles = acc.tiles.concat(entries.tiles);
                    acc.foundZoom = entries.foundZoom;
                    return acc;
                },
                { tiles: [], foundZoom: 0 }
            );
            let tiles = tileEntries.tiles;
            let allTileCoords = tiles.map((tile) => {
                return tile.tileCoord.join(",");
            });
            let foundZoom = tileEntries.foundZoom;

            // remove all vector layers currently in the layer group
            let prevLayers = {};
            let layerGroup = mapLayer.getLayers();
            while (layerGroup.getLength() > 1) {
                try {
                    let tmpLayer = layerGroup.pop();
                    prevLayers[tmpLayer.getSource().getUrl()] = tmpLayer;
                } catch (e) {
                    console.warn("Error in MapWrapperOpenlayers.multiFileKmlCanvasFunction: ", e);
                }
            }

            // extract date string to use
            let timeStr =
                typeof mapLayer.get("_layerTime") !== "undefined"
                    ? mapLayer.get("_layerTime")
                    : moment.utc(this.mapDate).format(layer.get("timeFormat"));

            // construct the vector layers in view
            let baseUrl = layer.get("url");
            for (let i = 0; i < tiles.length; ++i) {
                let tile = tiles[i];
                let tileCoord = tile.tileCoord;
                let tileExtent = tile.extent;

                // generate tile url
                let tileUrl = baseUrl
                    .split("{Z}")
                    .join(tileCoord[0])
                    .split("{X}")
                    .join(tileCoord[1])
                    .split("{Y}")
                    .join(tileCoord[2])
                    .split("{TIME}")
                    .join(timeStr);

                let _context = this;
                let tileLayer = prevLayers[tileUrl];
                if (typeof tileLayer === "undefined") {
                    // construct the vector layer for this tile
                    let tileFormat = new Ol_Format_KML();
                    let source = new Ol_Source_Vector({
                        url: tileUrl,
                        format: tileFormat,
                        loader: Ol_FeatureLoader.loadFeaturesXhr(
                            tileUrl,
                            tileFormat,
                            function (features, dataProjection) {
                                this.addFeatures(features);
                                this.set("_loadingState", TILE_STATE_LOADED);
                                mapLayer.dispatchEvent(appStrings.VECTOR_FEATURE_LOAD);
                            },
                            function (err) {
                                console.warn("Error in vector feature loader", err);
                                this.set("_loadingState", TILE_STATE_ERROR);
                                mapLayer.dispatchEvent(appStrings.VECTOR_FEATURE_LOAD);
                            }
                        ),
                    });
                    source.on("addfeature", (event) => {
                        let feature = event.feature;
                        let geometry = feature.getGeometry();
                        if (geometry.getType() === "LineString") {
                            let coords = this.mapUtil.deconstrainLineStringArrow(
                                geometry.getCoordinates()
                            );
                            geometry.setCoordinates(coords);
                        }
                    });
                    source.set("_loadingState", TILE_STATE_IDLE);

                    tileLayer = new Ol_Layer_Vector({
                        opacity: 1,
                        visible: true,
                        renderMode: "image",
                        source: source,
                    });
                }

                tileLayer.set("_tileCoord", tileCoord.join(","));
                layerGroup.push(tileLayer);
            }

            mapLayer.setLayers(layerGroup);
        }

        mapLayer.set("_lastExtentChecked", JSON.stringify(extent));

        return canvas;
    }

    getExtentsListForLayer(layer) {
        switch (layer.get("id")) {
            case appStrings.CURRENTS_VECTOR_COLOR:
                return kmlLayerExtents.CURRENTS_EXTENTS;
            case appStrings.CURRENTS_VECTOR_BLACK:
                return kmlLayerExtents.CURRENTS_EXTENTS;
            default:
                console.warn(
                    "Error in MapWrapperOpenlayers.getExtentsListForLayer: could not match layer id to extent list - ",
                    layer.get("id")
                );
                return false;
        }
    }

    addLayerToCache(mapLayer, updateStrategy = appStringsCore.TILE_LAYER_UPDATE_STRATEGIES.TILE) {
        try {
            if (
                mapLayer.get("_layerRef").get("handleAs") !== appStrings.LAYER_MULTI_FILE_VECTOR_KML
            ) {
                return MapWrapperOpenlayersCore.prototype.addLayerToCache.call(
                    this,
                    mapLayer,
                    updateStrategy
                );
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayer.addLayerToCache: ", err);
            return false;
        }
    }

    createVectorTileOutline(layer, fromCache = true) {
        try {
            let options = layer.get("mappingOptions").toJS();

            let outlineLayer = new Ol_Layer_VectorTile({
                transition: 0,
                renderMode: "image",
                // overlaps: false,
                source: new Ol_Source_VectorTile({
                    format: new Ol_Format_MVT(),
                    projection: "EPSG:4326",
                    tileGrid: new Ol_TileGrid({
                        extent: options.extents,
                        origin: options.tileGrid.origin,
                        resolutions: options.tileGrid.resolutions,
                        matrixIds: options.tileGrid.matrixIds,
                        tileSize: options.tileGrid.tileSize,
                    }),
                    url: layer.get("url"),
                }),
                style: function (feature) {
                    return [
                        new Ol_Style({
                            stroke: new Ol_Style_Stroke({
                                color: "#212121",
                                width: 2.5,
                            }),
                        }),
                        new Ol_Style({
                            stroke: new Ol_Style_Stroke({
                                color: "#FFFFFF",
                                width: 0.75,
                            }),
                            fill: new Ol_Style_Fill({
                                color: "rgba(255,255,255,0.01)",
                            }),
                        }),
                    ];
                },
            });

            return outlineLayer;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createVectorTileOutline:", err);
            return false;
        }
    }

    createVectorPointTrackLayer(layer, fromCache = true) {
        try {
            let layerSource = this.createVectorPointTrackSource(
                layer,
                {
                    url: layer.get("url"),
                },
                fromCache
            );

            return new Ol_Layer_Vector({
                source: layerSource,
                renderMode: "image",
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
                style: this.createVectorPointTrackLayerStyles(layer.get("vectorColor")),
            });
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createVectorPointTrackLayer:", err);
            return false;
        }
    }

    createVectorTileTrackLayer(layer, fromCache = true) {
        try {
            let options = layer.get("mappingOptions").toJS();
            return new Ol_Layer_VectorTile({
                transition: 0,
                source: new Ol_Source_VectorTile({
                    format: new Ol_Format_MVT(),
                    projection: "EPSG:4326",
                    tileGrid: new Ol_TileGrid({
                        extent: options.extents,
                        origin: options.tileGrid.origin,
                        resolutions: options.tileGrid.resolutions,
                        matrixIds: options.tileGrid.matrixIds,
                        tileSize: options.tileGrid.tileSize,
                    }),
                    url: layer.get("url"),
                }),
                style: new Ol_Style({
                    stroke: new Ol_Style_Stroke({
                        color: "rgba(0,0,0,0.4)",
                    }),
                    fill: new Ol_Style_Fill({
                        color: "rgba(255,255,255,0.4)",
                    }),
                }),
            });
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createVectorTileTrackLayer:", err);
            return false;
        }
    }

    createVectorTilePointsLayer(layer, fromCache = true) {
        try {
            let options = layer.get("mappingOptions").toJS();
            const defFill = new Ol_Style_Fill({
                color: "rgba(255,255,255,1)",
            });
            const defStroke = new Ol_Style_Stroke({
                color: "rgba(0,0,0,1)",
                width: 1.25,
            });

            let style;
            const sizeProp = layer.getIn(["mappingOptions", "displayProps", "size"]);
            const colorProp = layer.getIn(["mappingOptions", "displayProps", "color"]);
            if (sizeProp === 1000 && (sizeProp || colorProp)) {
                style = (feature, res) => {
                    let size = 5;
                    if (sizeProp) {
                        size = parseFloat(feature.getProperties()[sizeProp]);
                    }

                    let fill = defFill;
                    if (colorProp) {
                        const colorRef = feature.getProperties()[colorProp];
                        const color = HACK_AIS_COLORS.find((x) => x[0] === colorRef)[1];
                        fill = new Ol_Style_Fill({
                            color: color,
                        });
                    }

                    return new Ol_Style({
                        image: new Ol_Style_Circle({
                            fill: fill,
                            stroke: defStroke,
                            radius: Math.max(5, Math.min(13, size)),
                        }),
                        stroke: defStroke,
                        fill: fill,
                    });
                };
            } else {
                style = new Ol_Style({
                    image: new Ol_Style_Circle({
                        fill: defFill,
                        stroke: defStroke,
                        radius: 5,
                    }),
                    stroke: defStroke,
                    fill: defFill,
                });
            }

            const url = layer
                .getIn(["mappingOptions", "url"])
                .replace("{TileRow}", "{y}")
                .replace("{TileCol}", "{x}")
                .replace("{TileMatrix}", "{z}")
                .replace("{TileMatrixSet}", layer.getIn(["mappingOptions", "matrixSet"]))
                .replace("{TIME}", "{Time}")
                .replace("{Time}", "{time}")
                .replace("{time}", moment.utc(this.mapDate).format("YYYY-MM-DD"));

            return new Ol_Layer_VectorTile({
                transition: 0,
                renderMode: "image",
                source: new Ol_Source_VectorTile({
                    format: new Ol_Format_MVT(),
                    projection: "EPSG:4326",
                    tileGrid: new Ol_TileGrid({
                        extent: options.extents,
                        origin: options.tileGrid.origin,
                        resolutions: options.tileGrid.resolutions,
                        matrixIds: options.tileGrid.matrixIds,
                        tileSize: options.tileGrid.tileSize,
                    }),
                    url,
                }),
                style: style,
            });
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createVectorTileTrackLayer:", err);
            return false;
        }
    }

    createVectorPointTrackSource(layer, options, fromCache = true) {
        // try to pull from cache
        let cacheHash = this.getCacheHash(layer) + "_source";
        let cacheSource = this.layerCache.get(cacheHash);
        if (fromCache && cacheSource) {
            if (cacheSource.get("_hasLoaded")) {
                // highlight the points
                this.highlightTrackPoints(
                    cacheSource.getFeatures(),
                    layer.get("timeFormat"),
                    layer.get("vectorColor")
                );

                // run async to avoid reducer block
                window.requestAnimationFrame(() => {
                    // run the call back (if it exists)
                    if (typeof this.layerLoadCallback === "function") {
                        this.layerLoadCallback(layer);
                    }
                });
            }

            return cacheSource;
        }

        // customize the layer url if needed
        if (
            typeof options.url !== "undefined" &&
            typeof layer.getIn(["mappingOptions", "urlFunctions", appStringsCore.MAP_LIB_2D]) !==
                "undefined"
        ) {
            let urlFunction = this.tileHandler.getUrlFunction(
                layer.getIn(["mappingOptions", "urlFunctions", appStringsCore.MAP_LIB_2D])
            );
            options.url = urlFunction({
                layer: layer,
                url: options.url,
            });
        }

        let geojsonFormat = new Ol_Format_GeoJSON();
        let _context = this;
        let source = new Ol_Source_Vector({
            url: options.url,
            loader: function (extent, resolution, projection) {
                MiscUtil.asyncFetch({
                    url: options.url,
                    handleAs: appStringsCore.FILE_TYPE_JSON,
                }).then(
                    (data) => {
                        const points = [];
                        const featuresToAdd = [];
                        const featureMap = {};

                        // we'll do this dumb but easy for now
                        // TODO - collapse this into a single pass

                        // combine repeat locations and build the points for the line
                        const features = data.features;
                        for (let i = 0; i < features.length; ++i) {
                            const feature = features[i];
                            if (!feature.geometry) continue;
                            const coords = feature.geometry.coordinates;

                            if (Math.abs(coords[0]) <= 180 && Math.abs(coords[1]) <= 90) {
                                if (i < features.length - 1) {
                                    let nextFeature = features[i + 1];

                                    // scroll forward until we find a non-null geometry
                                    while (!!!nextFeature.geometry) {
                                        nextFeature = features[++i];
                                    }

                                    const nextCoords = nextFeature.geometry.coordinates;

                                    if (
                                        Math.abs(nextCoords[0]) <= 180 &&
                                        Math.abs(nextCoords[1]) <= 90 &&
                                        (coords[0] !== nextCoords[0] || coords[1] !== nextCoords[1])
                                    ) {
                                        points.push(coords);
                                    }
                                } else {
                                    points.push(coords);
                                }

                                const coordStr = coords.join(",");
                                const dateStr = new Date(feature.properties["position_date_time"]);
                                let combinedFeature = featureMap[coordStr];
                                if (typeof combinedFeature === "undefined") {
                                    combinedFeature = new Ol_Feature({
                                        geometry: new Ol_Geom_Point(coords),
                                    });
                                    combinedFeature.set("_layerId", layer.get("id"));
                                    combinedFeature.set("position_date_time", [dateStr]);
                                    featureMap[coordStr] = combinedFeature;
                                    featuresToAdd.push(combinedFeature);
                                } else {
                                    combinedFeature.get("position_date_time").push(dateStr);
                                }
                            }
                        }

                        // mark the start and end point
                        featuresToAdd[0].set("_isFirst", true);
                        featuresToAdd[featuresToAdd.length - 1].set("_isLast", true);

                        // split points around the dateline
                        const splitPoints = _context.splitPointsArray(points);

                        // create the connecting line
                        featuresToAdd.push(
                            new Ol_Feature({
                                geometry: new Ol_Geom_MultiLineString(splitPoints),
                            })
                        );

                        // add features to the layer
                        if (featuresToAdd.length > 0) {
                            this.addFeatures(featuresToAdd);
                        }

                        // highlight track points
                        window.requestAnimationFrame(() => {
                            source.set("_hasLoaded", true);

                            const mapLayers = _context.map.getLayers().getArray();
                            const updatedMapLayer = _context.miscUtil.findObjectInArray(
                                mapLayers,
                                "_layerId",
                                layer.get("id")
                            );
                            const updatedLayer = updatedMapLayer.get("_layerRef");
                            _context.highlightTrackPoints(
                                featuresToAdd,
                                layer.get("timeFormat"),
                                updatedLayer.get("vectorColor")
                            );
                        });

                        // run the call back (if it exists)
                        if (typeof _context.layerLoadCallback === "function") {
                            _context.layerLoadCallback(layer);
                        }
                    },
                    (err) => {
                        console.warn("Error fetching vector data", err);
                    }
                );
            },
            format: geojsonFormat,
        });

        // cache the source
        this.layerCache.set(cacheHash, source);

        return source;
    }

    createVectorPointSource(layer, options, fromCache = true) {
        // try to pull from cache
        let cacheHash = this.getCacheHash(layer) + "_source";
        let cacheSource = this.layerCache.get(cacheHash);
        if (fromCache && cacheSource) {
            if (cacheSource.get("_hasLoaded")) {
                // run async to avoid reducer block
                window.requestAnimationFrame(() => {
                    // run the call back (if it exists)
                    if (typeof this.layerLoadCallback === "function") {
                        this.layerLoadCallback(layer);
                    }
                });
            }

            return cacheSource;
        }

        // customize the layer url if needed
        let urlFunction = false;
        if (
            typeof options.url !== "undefined" &&
            typeof layer.getIn(["mappingOptions", "urlFunctions", appStringsCore.MAP_LIB_2D]) !==
                "undefined"
        ) {
            urlFunction = this.tileHandler.getUrlFunction(
                layer.getIn(["mappingOptions", "urlFunctions", appStringsCore.MAP_LIB_2D])
            );
        }

        const geojsonFormat = new Ol_Format_GeoJSON();
        const _context = this;
        const source = new Ol_Source_Vector({
            url: options.url,
            loader: function (extent, resolution, projection) {
                const date = moment.utc(_context.mapDate);
                const endTime = date.valueOf();
                const startTime = date
                    .subtract(_context.dateInterval.size, _context.dateInterval.scale)
                    .valueOf();
                const url = urlFunction({
                    layer: layer,
                    url: options.url,
                    extent: _context.getExtent(),
                    endTime,
                    startTime,
                });
                MiscUtil.asyncFetch({
                    url: url,
                    handleAs: appStringsCore.FILE_TYPE_JSON,
                }).then(
                    (data) => {
                        const featuresToAdd = [];
                        const features = data.features;
                        for (let i = 0; i < features.length; ++i) {
                            const feature = features[i];
                            const coords = feature.geometry.coordinates;

                            if (Math.abs(coords[0]) <= 180 && Math.abs(coords[1]) <= 90) {
                                const dateStr = new Date(feature.properties["dates"]);
                                const olFeature = new Ol_Feature({
                                    geometry: new Ol_Geom_Point(coords),
                                });
                                olFeature.set("_layerId", layer.get("id"));
                                olFeature.set("position_date_time", [dateStr]);
                                featuresToAdd.push(olFeature);
                            }
                        }

                        // add features to the layer
                        if (featuresToAdd.length > 0) {
                            this.addFeatures(featuresToAdd);
                        }

                        source.set("_hasLoaded", true);

                        // run the call back (if it exists)
                        if (typeof _context.layerLoadCallback === "function") {
                            _context.layerLoadCallback(layer);
                        }
                    },
                    (err) => {
                        console.warn("Error fetching vector data", err);
                    }
                );
            },
            format: geojsonFormat,
        });

        // cache the source
        this.layerCache.set(cacheHash, source);

        return source;
    }

    createVectorPointLayerStyles(layer, color = false) {
        const variables = layer.getIn(["insituMeta", "variables"]);
        color = color || layer.get("vectorColor");
        if (variables.size > 0) {
            const variable = variables.get(0);
            const label = variable.get("label");
            return (feature, resolution) => {
                const subFeatures = feature.get("oiipFeatureCollection");
                const value = subFeatures.reduce((acc, feat) => {
                    return acc + (feat.properties[label] || 0);
                }, 0);
                // const radius = this.miscUtil.logScaleValue(value);
                const radius = 2 + 2 * Math.log(value + 1);

                return new Ol_Style({
                    image: new Ol_Style_Circle({
                        radius: radius,
                        fill: new Ol_Style_Fill({
                            color: color,
                        }),
                        stroke: new Ol_Style_Stroke({
                            color: "#000000",
                            width: 0.5,
                        }),
                    }),
                });
            };
        } else {
            return new Ol_Style({
                image: new Ol_Style_Circle({
                    radius: 4,
                    fill: new Ol_Style_Fill({
                        color: color,
                    }),
                }),
            });
        }
    }

    createVectorPointTrackLayerStyles(color = false) {
        return (feature, resolution) => {
            if (feature.get("_isFirst")) {
                return new Ol_Style({
                    image: new Ol_Style_RegularShape({
                        fill: new Ol_Style_Fill({
                            color: color,
                        }),
                        points: 3,
                        stroke: new Ol_Style_Stroke({
                            color: color === "#000000" || color === "#3e2723" ? "#fff" : "#000",
                        }),
                        rotation: Math.PI,
                        radius: 7,
                    }),
                    zIndex: 2,
                });
            } else if (feature.get("_isLast")) {
                return new Ol_Style({
                    image: new Ol_Style_RegularShape({
                        fill: new Ol_Style_Fill({
                            color: color,
                        }),
                        points: 3,
                        stroke: new Ol_Style_Stroke({
                            color: color === "#000000" || color === "#3e2723" ? "#fff" : "#000",
                        }),
                        radius: 7,
                    }),
                    zIndex: 2,
                });
            } else if (resolution > 0.017578125) {
                return new Ol_Style({
                    fill: new Ol_Style_Fill({
                        color: color,
                    }),
                    stroke: new Ol_Style_Stroke({
                        color: color,
                        width: 2,
                    }),
                });
            } else {
                return new Ol_Style({
                    fill: new Ol_Style_Fill({
                        color: color,
                    }),
                    stroke: new Ol_Style_Stroke({
                        color: color,
                        width: 1,
                    }),
                    image: new Ol_Style_Circle({
                        radius: 4,
                        fill: new Ol_Style_Fill({
                            color: color,
                        }),
                    }),
                });
            }
        };
    }

    setVectorLayerColor(layer, color) {
        let mapLayers = this.map.getLayers().getArray();
        let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", layer.get("id"));
        if (!mapLayer) {
            console.warn(
                "Error in MapWrapperOpenLayers.setVectorLayerColor: Could not find corresponding map layer",
                layer
            );
            return false;
        }

        if (layer.get("handleAs") === appStrings.LAYER_VECTOR_POINTS_WFS) {
            const layers = mapLayer.getLayers();
            layers.forEach((l) => {
                if (typeof l.setStyle === "function") {
                    l.setStyle(this.createVectorPointLayerStyles(layer, color));
                }
            });
            // update the layer
            this.setLayerRefInfo(layer, mapLayer);
        } else {
            mapLayer.setStyle(this.createVectorPointTrackLayerStyles(color));
            this.updateLayer(layer, color);
        }
        return true;
    }

    zoomToLayer(layer, extraPad = false) {
        try {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", layer.get("id"));
            if (!mapLayer) {
                console.warn(
                    "Error in MapWrapperOpenLayers.zoomToLayer: Could not find corresponding map layer",
                    layer
                );
                return false;
            }

            let source = mapLayer.getSource();
            if (typeof source.getExtent === "function") {
                let extent = source.getExtent();
                let padding = [60, 60, 60, 60];
                if (extraPad) {
                    padding[1] = padding[1] + 600;
                }
                this.map.getView().fit(extent, {
                    size: this.map.getSize() || [],
                    padding: padding,
                    duration: 350,
                    constrainResolution: false,
                });
            }

            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.zoomToLayer: ", err);
            return false;
        }
    }

    getDataAtPoint(coords, pixel, palettes) {
        try {
            let data = []; // the collection of pixel data to return
            let coordConstrained = this.getLatLonFromPixelCoordinate(pixel);
            let coord = [coordConstrained.lat, coordConstrained.lon];
            this.map.forEachLayerAtPixel(
                pixel,
                (mapLayer) => {
                    if (mapLayer) {
                        let feature = mapLayer
                            .getSource()
                            .getClosestFeatureToCoordinate(coord, (feature) => {
                                return feature.getGeometry() instanceof Ol_Geom_Point;
                            });
                        if (feature.getGeometry() instanceof Ol_Geom_Point) {
                            data.push({
                                layerId: mapLayer.get("_layerId"),
                                properties: feature.getProperties(),
                                coords: feature.getGeometry().getCoordinates(),
                            });
                            return false;
                        }
                    }
                },
                {
                    layerFilter: (mapLayer) => {
                        return (
                            mapLayer.getVisible() &&
                            mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_INSITU_DATA
                        );
                    },
                }
            );

            this.map.forEachFeatureAtPixel(
                pixel,
                (feature, mapLayer) => {
                    data.push({
                        layerId: mapLayer.get("_layerId"),
                        properties: feature.getProperties(),
                        coords: coord,
                    });

                    if (mapLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_DATA) {
                        return true;
                    }
                },
                {
                    layerFilter: (mapLayer) => {
                        return (
                            mapLayer.getVisible() &&
                            (mapLayer.get("_layerType") ===
                                appStrings.LAYER_GROUP_TYPE_DATA_REFERENCE ||
                                mapLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_DATA)
                        );
                    },
                }
            );

            return data;

            // return data;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.getDataAtPoint:", err);
            return [];
        }
    }

    getLatLonFromPixelCoordinate(pixel, constrainCoords = true) {
        try {
            let coordinate = this.map.getCoordinateFromPixel(pixel);
            coordinate = constrainCoords
                ? this.mapUtil.constrainCoordinates(coordinate)
                : coordinate;
            if (
                typeof coordinate[0] !== "undefined" &&
                typeof coordinate[1] !== "undefined" &&
                !isNaN(coordinate[0]) &&
                !isNaN(coordinate[0])
            ) {
                return {
                    lat: coordinate[0],
                    lon: coordinate[1],
                    isValid: coordinate[1] <= 90 && coordinate[1] >= -90,
                };
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.getLatLonFromPixelCoordinate:", err);
            return false;
        }
    }

    addDrawHandler(geometryType, onDrawEnd, interactionType) {
        if (interactionType === appStrings.INTERACTION_AREA_SELECTION) {
            try {
                if (geometryType === appStrings.GEOMETRY_BOX) {
                    let mapLayers = this.map.getLayers().getArray();
                    let mapLayer = this.miscUtil.findObjectInArray(
                        mapLayers,
                        "_layerId",
                        "_vector_drawings"
                    );
                    if (mapLayer) {
                        let shapeType = appStringsCore.SHAPE_AREA;
                        let drawStyle = (feature, resolution) => {
                            return this.defaultDrawingStyle(feature, resolution, shapeType);
                        };

                        let drawInteraction = new Ol_Interaction_Draw({
                            source: mapLayer.getSource(),
                            type: "Circle",
                            geometryFunction: createBox(),
                            style: drawStyle,
                            wrapX: true,
                        });

                        // Set callback
                        drawInteraction.on("drawend", (event) => {
                            if (typeof onDrawEnd === "function") {
                                // store type of feature and id for later reference
                                let geometry = this.retrieveGeometryFromEvent(event, geometryType);
                                event.feature.set("interactionType", interactionType);
                                event.feature.setId(geometry.id);
                                onDrawEnd(geometry, event);
                            }
                        });

                        // Disable
                        drawInteraction.setActive(false);

                        // Set properties we'll need
                        drawInteraction.set("_id", interactionType + geometryType);
                        drawInteraction.set(interactionType, true);

                        // Add to map
                        this.map.addInteraction(drawInteraction);

                        return true;
                    }
                }

                return false;
            } catch (err) {
                console.warn("Error in MapWrapperOpenlayers.addDrawHandler:", err);
                return false;
            }
        } else {
            return MapWrapperOpenlayersCore.prototype.addDrawHandler.call(
                this,
                geometryType,
                onDrawEnd,
                interactionType
            );
        }
    }

    retrieveGeometryFromEvent(event, geometryType) {
        if (geometryType === appStrings.GEOMETRY_BOX) {
            let coords = event.feature.getGeometry().getCoordinates()[0];
            let minX = coords[0][0];
            let minY = coords[0][1];
            let maxX = coords[0][0];
            let maxY = coords[0][1];
            for (let i = 0; i < coords.length; ++i) {
                let c = coords[i];
                if (c[0] < minX) {
                    minX = c[0];
                }
                if (c[0] > maxX) {
                    maxX = c[0];
                }
                if (c[1] < minY) {
                    minY = c[1];
                }
                if (c[1] > maxY) {
                    maxY = c[1];
                }
            }

            let extent = MapUtil.constrainExtent([minX, minY, maxX, maxY], false);

            return {
                type: appStrings.GEOMETRY_BOX,
                id: Math.random(),
                proj: this.map.getView().getProjection().getCode(),
                coordinates: extent.map((x) => parseFloat(x.toFixed(3))),
                coordinateType: appStringsCore.COORDINATE_TYPE_CARTOGRAPHIC,
            };
        } else {
            return MapWrapperOpenlayersCore.prototype.retrieveGeometryFromEvent.call(
                this,
                event,
                geometryType
            );
        }
    }

    enableAreaSelection(geometryType) {
        try {
            // remove double-click zoom while drawing so we can double-click complete
            this.setDoubleClickZoomEnabled(false);

            // Get drawHandler by geometryType
            let drawInteraction = this.miscUtil.findObjectInArray(
                this.map.getInteractions().getArray(),
                "_id",
                appStrings.INTERACTION_AREA_SELECTION + geometryType
            );
            if (drawInteraction) {
                // Call setActive(true) on handler to enable
                drawInteraction.setActive(true);
                // Check that handler is active
                return drawInteraction.getActive();
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.enableAreaSelection:", err);
            return false;
        }
    }

    disableAreaSelection(delayDblClickEnable = true) {
        try {
            // Call setActive(false) on all handlers
            let drawInteractions = this.miscUtil.findAllMatchingObjectsInArray(
                this.map.getInteractions().getArray(),
                appStrings.INTERACTION_AREA_SELECTION,
                true
            );
            drawInteractions.map((handler) => {
                handler.setActive(false);

                // Check that handler is not active
                if (handler.getActive()) {
                    console.warn("could not disable openlayers draw handler:", handler.get("_id"));
                }
            });

            // re-enable double-click zoom
            if (delayDblClickEnable) {
                setTimeout(() => {
                    this.setDoubleClickZoomEnabled(true);
                }, 251);
            } else {
                this.setDoubleClickZoomEnabled(true);
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.disableAreaSelection:", err);
            return false;
        }
    }

    completeAreaSelection() {
        try {
            let drawInteractions = this.miscUtil.findAllMatchingObjectsInArray(
                this.map.getInteractions().getArray(),
                appStrings.INTERACTION_AREA_SELECTION,
                true
            );
            drawInteractions.map((handler) => {
                if (handler.getActive()) {
                    handler.finishDrawing();
                }
            });
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.completeAreaSelection:", err);
            return false;
        }
    }

    removeAllAreaSelections() {
        let mapLayers = this.map.getLayers().getArray();
        let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", "_vector_drawings");
        if (!mapLayer) {
            console.warn("could not remove all geometries in openlayers map");
            return false;
        }
        // Remove geometries
        let mapLayerFeatures = mapLayer.getSource().getFeatures();
        let featuresToRemove = mapLayerFeatures.filter(
            (x) => x.get("interactionType") === appStrings.INTERACTION_AREA_SELECTION
        );
        for (let i = 0; i < featuresToRemove.length; i++) {
            mapLayer.getSource().removeFeature(featuresToRemove[i]);
        }
        return (
            mapLayer
                .getSource()
                .getFeatures()
                .filter((x) => x.get("interactionType") === appStrings.INTERACTION_AREA_SELECTION)
                .length === 0
        );
    }

    addGeometry(geometry, interactionType, geodesic = false) {
        if (interactionType === appStrings.INTERACTION_AREA_SELECTION) {
            this.removeAllAreaSelections();

            if (geometry.coordinates.length !== 4) {
                return true;
            }

            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(
                mapLayers,
                "_layerId",
                "_vector_drawings"
            );
            if (!mapLayer) {
                console.warn("could not find drawing layer in openlayers map");
                return false;
            }
            return this.addGeometryToMapLayer(geometry, interactionType, mapLayer);
        } else if (interactionType === appStrings.INTERACTION_AREA_DISPLAY) {
            if (geometry.coordinates.length !== 4) {
                return true;
            }
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(
                mapLayers,
                "_layerId",
                "_area_display_layer"
            );
            if (!mapLayer) {
                console.warn("could not find area display layer in openlayers map");
                return false;
            }
            return this.addGeometryToMapLayer(
                geometry,
                interactionType,
                mapLayer.getLayers().item(0)
            );
        } else {
            return MapWrapperOpenlayersCore.prototype.addGeometry.call(
                this,
                geometry,
                interactionType,
                geodesic
            );
        }
    }

    addGeometryToMapLayer(geometry, interactionType, mapLayer) {
        if (geometry.type === appStrings.GEOMETRY_BOX) {
            if (geometry.coordinateType === appStringsCore.COORDINATE_TYPE_CARTOGRAPHIC) {
                let minLon = geometry.coordinates[0];
                let maxLon = geometry.coordinates[2];
                let minLat = geometry.coordinates[1];
                let maxLat = geometry.coordinates[3];

                // deal with wrap
                minLon = MapUtil.constrainCoordinates([minLon, 0], false)[0];
                maxLon = MapUtil.constrainCoordinates([maxLon, 0], false)[0];
                if (minLon > maxLon) {
                    minLon = MapUtil.deconstrainLongitude(minLon);
                }

                let ulCoord = [minLon, maxLat];
                let urCoord = [maxLon, maxLat];
                let blCoord = [minLon, minLat];
                let brCoord = [maxLon, minLat];

                let lineStringFeature = new Ol_Feature({
                    geometry: new Ol_Geom_Polygon([[ulCoord, urCoord, brCoord, blCoord]]),
                });

                lineStringFeature.set("interactionType", interactionType);
                lineStringFeature.setId(geometry.id);
                mapLayer.getSource().addFeature(lineStringFeature);
                return true;
            } else {
                console.warn(
                    "Unsupported geometry coordinateType ",
                    geometry.coordinateType,
                    " for openlayers lineString"
                );
                return false;
            }
        }
        return false;
    }

    removeGeometry(geometry, interactionType) {
        if (interactionType === appStrings.INTERACTION_AREA_SELECTION) {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(
                mapLayers,
                "_layerId",
                "_vector_drawings"
            );
            if (!mapLayer) {
                console.warn("could not find drawing layer in openlayers map");
                return false;
            }
            let source = mapLayer.getSource();
            let feature = source.getFeatureById(geometry.id);
            if (typeof geometry === "undefined") {
                console.warn("could not feature with id: ", geometry.id);
                return false;
            }

            source.removeFeature(feature);

            return true;
        } else if (interactionType === appStrings.INTERACTION_AREA_DISPLAY) {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(
                mapLayers,
                "_layerId",
                "_area_display_layer"
            );
            if (!mapLayer) {
                console.warn("could not find area display layer in openlayers map");
                return false;
            }

            let outerSource = mapLayer.getLayers().item(0).getSource();
            let innerSource = mapLayer.getLayers().item(1).getSource();

            let outerFeature = outerSource.getFeatureById(geometry.id);
            let innerFeature = innerSource.getFeatureById(geometry.id);
            if (typeof outerFeature === "undefined" || typeof innerFeature === "undefined") {
                console.warn("could not feature with id: ", geometry.id);
                return true;
            }

            outerSource.removeFeature(outerFeature);
            innerSource.removeFeature(innerFeature);

            return true;
        } else {
            console.warn(
                "Failed to remove geometry for unknown interaction type: ",
                interactionType
            );
            return true;
        }
    }

    recolorLayer(layer, paletteMap) {
        try {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayer = this.miscUtil.findObjectInArray(mapLayers, "_layerId", layer.get("id"));
            this.tileHandler.setLayerPaletteMap(layer.get("id"), paletteMap);
            this.clearCacheForLayer(layer.get("id"));
            if (mapLayer) {
                mapLayer.set("_layerRef", layer);
                mapLayer.getSource().refresh();
            }
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.recolorLayer:", err);
            return false;
        }
    }

    updateLayer(layer, color = false) {
        try {
            if (layer.get("handleAs") === appStrings.LAYER_VECTOR_POINT_TRACK) {
                let mapLayers = this.map.getLayers().getArray();
                let mapLayer = this.miscUtil.findObjectInArray(
                    mapLayers,
                    "_layerId",
                    layer.get("id")
                );
                if (mapLayer) {
                    // update the layer
                    this.setLayerRefInfo(layer, mapLayer);

                    this.highlightTrackPoints(
                        mapLayer.getSource().getFeatures(),
                        layer.get("timeFormat"),
                        color || layer.get("vectorColor")
                    );
                }

                return true;
            } else {
                return MapWrapperOpenlayersCore.prototype.updateLayer.call(this, layer);
            }
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.updateLayer:", err);
            return false;
        }
    }

    highlightTrackPoints(features, timeFormat = "YYYY-MM-DD", color = "#000") {
        let mapLayers = this.map.getLayers().getArray();
        let mapLayer = this.miscUtil.findObjectInArray(
            mapLayers,
            "_layerId",
            "_point_highlight_layer"
        );
        if (!mapLayer) {
            console.warn("could not find point highlight layer in openlayers map");
            return false;
        }
        let source = mapLayer.getSource();

        if (features.length > 0) {
            let date = moment.utc(this.mapDate);
            let endTime = date.valueOf();
            let startTime = date
                .subtract(this.dateInterval.size, this.dateInterval.scale)
                .valueOf();
            let refFeature = features[0];
            let layerId = refFeature.get("_layerId");
            let highlightFeatures = [];
            if (layerId) {
                let currFeatureList = source.getFeatures();
                for (let i = 0; i < currFeatureList.length; ++i) {
                    let feature = currFeatureList[i];
                    if (feature.get("_layerId") === layerId) {
                        source.removeFeature(feature);
                    }
                }
            }

            for (let i = 0; i < features.length; ++i) {
                let feature = features[i];
                if (feature.getGeometry() instanceof Ol_Geom_Point) {
                    let featureTimeArr = feature.get("position_date_time") || [];
                    for (let j = 0; j < featureTimeArr.length; ++j) {
                        if (featureTimeArr[j] > startTime && featureTimeArr[j] <= endTime) {
                            let highlightFeature = feature.clone();
                            highlightFeature.set("_color", color);
                            highlightFeature.set("_matchIndex", j);
                            highlightFeatures.push(highlightFeature);
                            break;
                        }
                    }
                }
            }

            // aggregate multiple points into a line
            if (highlightFeatures.length > 1) {
                highlightFeatures.sort((a, b) => {
                    return (
                        a.get("position_date_time")[a.get("_matchIndex")] -
                        b.get("position_date_time")[b.get("_matchIndex")]
                    );
                });

                const points = highlightFeatures.map((feature, i) => {
                    return feature.getGeometry().getCoordinates();
                });
                const splitPoints = this.splitPointsArray(points);

                let lineFeature = new Ol_Feature({
                    geometry: new Ol_Geom_MultiLineString(splitPoints),
                });
                lineFeature.set("_color", highlightFeatures[0].get("_color"));
                lineFeature.set("_layerId", highlightFeatures[0].get("_layerId"));
                source.addFeature(lineFeature);
            } else {
                source.addFeatures(highlightFeatures);
            }
        }
    }

    clearCacheForLayer(layerId) {
        this.layerCache.clearByKeyMatch(layerId);
    }

    handleTileLoad(layer, mapLayer, tile, url, origFunc) {
        MapWrapperOpenlayersCore.prototype.handleTileLoad.call(
            this,
            mapLayer.get("_layerRef"),
            mapLayer,
            tile,
            url,
            origFunc
        );
    }

    fillAnimationBuffer(layersToBuffer, startDate, endDate, stepResolution, callback = false) {
        try {
            // make sure the previous buffer is cleared
            this.animationBuffer.clear();

            // make sure the previous tile loading queue is clear
            this.tileLoadingQueue.clear(true);

            // clear the tile loading counter
            _tilesLoading = 0;

            // sort the array of layers according to current display order
            layersToBuffer = layersToBuffer.sort((a, b) => {
                let indexA = this.getLayerIndex(a);
                let indexB = this.getLayerIndex(b);

                return indexA - indexB;
            });

            // initialize the buffer with the new animation config
            this.animationBuffer.initializeBuffer({
                layers: layersToBuffer,
                startDate: startDate,
                endDate: endDate,
                stepResolution: stepResolution,
                createLayer: (layer, date) => {
                    return this.createBufferLayer(layer, date, callback);
                },
                checkLayerStatus: (mapLayer) => {
                    return this.loadTiles(mapLayer);
                },
                clearFrameLayer: (mapLayer) => {
                    return this.clearBufferLayer(mapLayer);
                },
            });

            // start the buffering
            this.animationBuffer.bufferLayers();
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.fillAnimationBuffer:", err);
            return false;
        }
    }

    clearAnimationBuffer() {
        try {
            // remove the current frame from the map
            this.clearDisplay();

            // clear the buffer
            this.animationBuffer.clear();

            // clear the loading queue
            this.tileLoadingQueue.clear(true);

            // reset counter
            _tilesLoading = 0;

            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.clearAnimationBuffer:", err);
            return false;
        }
    }

    nextAnimationFrame() {
        try {
            // get the next frame
            return this.animationBuffer.getNextFrame();
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.nextAnimationFrame:", err);
            return false;
        }
    }

    previousAnimationFrame() {
        try {
            // return the frame object
            return this.animationBuffer.getPreviousFrame();
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.previousAnimationFrame:", err);
            return false;
        }
    }

    getBufferStatus() {
        this.tileLoadingQueue.clear();
        return this.animationBuffer.getBufferStatus();
    }

    getCurrentFrameStatus() {
        return this.animationBuffer.getCurrentFrameStatus();
    }

    getNextFrameStatus() {
        return this.animationBuffer.getNextFrameStatus();
    }

    getPreviousFrameStatus() {
        return this.animationBuffer.getPreviousFrameStatus();
    }

    clearDisplay() {
        try {
            this.animationBuffer.getMapLayers().forEach((mapLayer) => {
                this.clearLayerTileListeners(mapLayer);
            });

            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.clearDisplay:", err);
            return false;
        }
    }

    createBufferLayer(layer, date, callback = false) {
        try {
            // create a new layer for the map
            let mapLayer = this.createLayer(layer, date);
            let status = this.getLoadingStatus(mapLayer);

            if (
                mapLayer.get("_layerRef").get("handleAs") === appStrings.LAYER_MULTI_FILE_VECTOR_KML
            ) {
                this.addMultiFileKMLLoadListeners(mapLayer, callback);

                // prep the canvas with tiles
                mapLayer
                    .getLayers()
                    .item(0)
                    .getSource()
                    .getImage(
                        this.getExtent(),
                        this.map.getView().getResolution(),
                        1,
                        this.map.getView().getProjection()
                    );
            } else {
                this.addRasterLayerLoadListeners(mapLayer, callback);
            }

            // add the layer to cache for faster access later
            this.layerCache.set(mapLayer.get("_layerCacheHash"), mapLayer);

            // check if this is coming from the cache
            if (!status.isLoaded) {
                // begin loading tiles for this source
                this.loadTiles(mapLayer);
            }

            return mapLayer;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createBufferLayer:", err);
            return false;
        }
    }

    addRasterLayerLoadListeners(mapLayer, callback = false) {
        // handle the tile loading complete
        let tileComplete = () => {
            // load more tiles
            _tilesLoading = this.tileLoadingQueue.loadMoreTiles(_tilesLoading - 1);

            // run the callback
            if (callback && typeof callback === "function") {
                callback();
            }
        };

        // start listening for the tile load events
        let source = mapLayer.getSource();
        if (typeof source.get("_tileLoadEndListener") === "undefined") {
            source.set(
                "_tileLoadEndListener",
                source.on("tileloadend", () => tileComplete())
            );
        }
        if (typeof source.get("_tileLoadErrorListener") === "undefined") {
            source.set(
                "_tileLoadErrorListener",
                source.on("tileloaderror", () => tileComplete())
            );
        }
    }

    addMultiFileKMLLoadListeners(mapLayer, callback = false) {
        // handle the tile loading complete
        let tileComplete = () => {
            // load more tiles
            _tilesLoading = this.tileLoadingQueue.loadMoreTiles(_tilesLoading - 1);

            // run the callback
            if (callback && typeof callback === "function") {
                callback();
            }
        };

        if (typeof mapLayer.get("_tileLoadEndListener") === "undefined") {
            mapLayer.set(
                "_tileLoadEndListener",
                mapLayer.on(appStrings.VECTOR_FEATURE_LOAD, () => tileComplete())
            );
        }
    }

    clearBufferLayer(mapLayer) {
        try {
            this.clearLayerTileListeners(mapLayer);
            return true;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.clearBufferLayer: ", err);
            throw err;
        }
    }

    clearLayerTileListeners(mapLayer) {
        unByKey(mapLayer.getSource().get("_tileLoadEndListener"));
        mapLayer.getSource().unset("_tileLoadEndListener");
        unByKey(mapLayer.getSource().get("_tileLoadErrorListener"));
        mapLayer.getSource().unset("_tileLoadErrorListener");
    }

    loadTiles(mapLayer) {
        // add the layer to cache for faster access later
        let layerInCache = this.layerCache.get(mapLayer.get("_layerCacheHash")) !== false;
        if (!layerInCache) {
            this.layerCache.set(mapLayer.get("_layerCacheHash"), mapLayer);
        }

        return this.loadRasterLayerTiles(mapLayer);
    }

    loadRasterLayerTiles(mapLayer) {
        let source = mapLayer.getSource();

        // to determine if all tiles are loaded, we check if all the expected tiles
        // are in the tileCache and have a loaded state
        let tilesTotal = 0;
        let tilesLoaded = 0;
        let tileGrid = source.getTileGrid();
        let extent = this.map.getView().calculateExtent(this.map.getSize());
        let resolution = this.map.getView().getResolution();
        let zoom = tileGrid.getZForResolution(resolution);
        tileGrid.forEachTileCoord(extent, zoom, (tileCoord) => {
            // If the tile has not been created, it should create a new one. If the tile has been created
            // it should return a cached reference to that tile
            let tile = source.getTile(
                tileCoord[0],
                tileCoord[1],
                tileCoord[2],
                Ol_Has.DEVICE_PIXEL_RATIO,
                source.getProjection()
            );
            if (LOAD_COMPLETE_STATES.indexOf(tile.state) !== -1) {
                tilesLoaded++;
            } else if (NO_LOAD_STATES.indexOf(tile.state) === -1) {
                this.tileLoadingQueue.enqueue(
                    mapLayer.get("_layerCacheHash") + tileCoord.join("/"),
                    tile
                );
            }
            tilesTotal++;
        });

        let isLoaded = tilesTotal === tilesLoaded && tilesTotal !== 0;

        // load more tiles
        _tilesLoading = this.tileLoadingQueue.loadMoreTiles(_tilesLoading);

        return { isLoaded, tilesTotal, tilesLoaded };
    }

    getLoadingStatus(mapLayer) {
        return this.getRasterLayerLoadingStatus(mapLayer);
    }

    getRasterLayerLoadingStatus(mapLayer) {
        let source = mapLayer.getSource();

        // to determine if all tiles are loaded, we check if all the expected tiles
        // are in the tileCache and have a loaded state
        let tilesTotal = 0;
        let tilesLoaded = 0;
        let tileGrid = source.getTileGrid();
        let extent = this.map.getView().calculateExtent(this.map.getSize());
        let resolution = this.map.getView().getResolution();
        let zoom = tileGrid.getZForResolution(resolution);
        tileGrid.forEachTileCoord(extent, zoom, (tileCoord) => {
            let tileCoordStr = tileCoord.join("/");
            if (
                source.tileCache.containsKey(tileCoordStr) &&
                LOAD_COMPLETE_STATES.indexOf(source.tileCache.get(tileCoordStr).state) !== -1
            ) {
                tilesLoaded++;
            }
            tilesTotal++;
        });

        let isLoaded = tilesTotal === tilesLoaded && tilesTotal !== 0;

        return { isLoaded, tilesTotal, tilesLoaded };
    }

    getCacheHash(layer, date = false) {
        if (date) {
            return `${layer.get("id")}_${moment
                .utc(date)
                .format(layer.get("timeFormat"))}_${layer.get("vectorColor")}`;
        } else if (layer.get("handleAs") === appStrings.LAYER_MULTI_FILE_VECTOR_KML) {
            const date = moment.utc(this.mapDate);
            const endTime = date.format(layer.get("timeFormat"));
            const startTime = date
                .subtract(this.dateInterval.size, this.dateInterval.scale)
                .format(layer.get("timeFormat"));
            return `${layer.get("id")}_${startTime}_${endTime}_${layer.get("vectorColor")}`;
        } else {
            return `${layer.get("id")}_${moment
                .utc(this.mapDate)
                .format(layer.get("timeFormat"))}_${layer.get("vectorColor")}`;
        }
    }

    getLayerIndex(layer) {
        try {
            let mapLayers = this.map.getLayers().getArray();
            let mapLayerWithIndex = this.miscUtil.findObjectWithIndexInArray(
                mapLayers,
                "_layerId",
                layer.get("id")
            );
            if (mapLayerWithIndex) {
                return mapLayerWithIndex.index;
            }
            return -1;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.getLayerIndex:", err);
            return false;
        }
    }

    findTopInsertIndexForLayer(mapLayer) {
        let mapLayers = this.map.getLayers();
        let index = mapLayers.getLength();

        if (mapLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_REFERENCE) {
            // referece layers always on top
            return index;
        } else if (mapLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_BASEMAP) {
            // basemaps always on bottom
            return 0;
        } else if (
            mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_INSITU_DATA ||
            mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_INSITU_DATA_ERROR
        ) {
            // data layers in the middle
            for (let i = index - 1; i >= 0; --i) {
                let compareLayer = mapLayers.item(i);
                if (
                    compareLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_DATA_REFERENCE ||
                    compareLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_DATA ||
                    compareLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_BASEMAP
                ) {
                    return i + 1;
                }
            }
            index = 0;
        } else {
            // data layers in the middle
            for (let i = index - 1; i >= 0; --i) {
                let compareLayer = mapLayers.item(i);
                if (
                    compareLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_DATA ||
                    compareLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_BASEMAP
                ) {
                    return i + 1;
                }
            }
            index = 0;
        }
        return index;
    }

    splitPointsArray(points) {
        let pointsSplitted = [];
        const pointsArray = [];
        pointsSplitted.push(points[0]);
        let lastLambda = points[0][0];

        for (let i = 1; i < points.length; i++) {
            const lastPoint = points[i - 1];
            const nextPoint = points[i];
            if (Math.abs(nextPoint[0] - lastLambda) > 180) {
                const deltaX = this.xToValueRange(nextPoint[0] - lastPoint[0]);
                const deltaY = nextPoint[1] - lastPoint[1];
                const deltaXS = this.xToValueRange(180 - nextPoint[0]);
                let deltaYS;
                if (deltaX === 0) {
                    deltaYS = 0;
                } else {
                    deltaYS = (deltaY / deltaX) * deltaXS;
                }
                const sign = lastPoint[0] < 0 ? -1 : 1;
                pointsSplitted.push([180 * sign, nextPoint[1] + deltaYS]);
                pointsArray.push(pointsSplitted);
                pointsSplitted = [];
                pointsSplitted.push([-180 * sign, nextPoint[1] + deltaYS]);
            }
            pointsSplitted.push(nextPoint);
            lastLambda = nextPoint[0];
        }
        pointsArray.push(pointsSplitted);

        return pointsArray;
    }

    xToValueRange(x) {
        if (Math.abs(x) > 180) {
            var sign = x < 0 ? -1 : 1;
            return x - 2 * 180 * sign;
        } else {
            return x;
        }
    }
}
