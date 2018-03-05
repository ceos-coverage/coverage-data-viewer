import Ol_Map from "ol/map";
import Ol_View from "ol/view";
import Ol_Has from "ol/has";
import Ol_Interaction from "ol/interaction";
import Ol_Interaction_Draw from "ol/interaction/draw";
import Ol_Layer_Vector from "ol/layer/vector";
import Ol_Layer_Group from "ol/layer/group";
import Ol_Layer_Image from "ol/layer/image";
import Ol_Layer_VectorTile from "ol/layer/vectortile";
import Ol_Source_Vector from "ol/source/vector";
import Ol_Source_VectorTile from "ol/source/vectortile";
import Ol_Source_ImageCanvas from "ol/source/imagecanvas";
import Ol_Source_ImageWMS from "ol/source/imagewms";
import Ol_Format_KML from "ol/format/kml";
import Ol_Format_MVT from "ol/format/mvt";
import Ol_Format_WFS from "ol/format/wfs";
import Ol_Style from "ol/style/style";
import Ol_Style_Stroke from "ol/style/stroke";
import Ol_Style_Fill from "ol/style/fill";
import Ol_Proj from "ol/proj";
import Ol_Collection from "ol/collection";
import Ol_Observable from "ol/observable";
import Ol_Graticule from "ol/graticule";
import Ol_Style_Circle from "ol/style/circle";
import Ol_Feature from "ol/feature";
import Ol_Geom_Polygon from "ol/geom/polygon";
import Ol_FeatureLoader from "ol/featureloader";
import Ol_Overlay from "ol/overlay";
import Ol_Format_GeoJSON from "ol/format/geojson";
import Ol_Geom_LineString from "ol/geom/linestring";
import Ol_Geom_Point from "ol/geom/point";
import Ol_TileGrid from "ol/tilegrid";
import Ol_Filter from "ol/format/filter";
import Ol_Extent from "ol/extent";
import moment from "moment";
import MapWrapperOpenlayersCore from "_core/utils/MapWrapperOpenlayers";
import AnimationBuffer from "utils/AnimationBuffer";
import TileLoadingQueue from "utils/TileLoadingQueue";
import appConfig from "constants/appConfig";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "utils/MiscUtil";

const TILE_STATE_IDLE = 0; // loading states found in ol.tile.js
const TILE_STATE_LOADING = 1;
const TILE_STATE_LOADED = 2;
const TILE_STATE_ERROR = 3;
const TILE_STATE_EMPTY = 4;
const TILE_STATE_ABORT = 5;
const NO_LOAD_STATES = [TILE_STATE_LOADING, TILE_STATE_LOADED, TILE_STATE_ERROR, TILE_STATE_EMPTY];
const LOAD_COMPLETE_STATES = [TILE_STATE_LOADED, TILE_STATE_ERROR, TILE_STATE_EMPTY];
let _tilesLoading = 0;

export default class MapWrapperOpenlayers extends MapWrapperOpenlayersCore {
    initStaticClasses(container, options) {
        MapWrapperOpenlayersCore.prototype.initStaticClasses.call(this, container, options);
        this.miscUtil = MiscUtil;
    }

    initObjects(container, options) {
        MapWrapperOpenlayersCore.prototype.initObjects.call(this, container, options);
        this.animationBuffer = new AnimationBuffer(22);
        this.tileLoadingQueue = new TileLoadingQueue();
    }

    createMap(container, options) {
        let map = MapWrapperOpenlayersCore.prototype.createMap.call(this, container, options);
        if (map) {
            map.on("precompose", function(evt) {
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

        this.defaultGeometryStyle = new Ol_Style({
            fill: new Ol_Style_Fill({
                color: appConfig.GEOMETRY_FILL_COLOR
            }),
            stroke: new Ol_Style_Stroke({
                color: appConfig.GEOMETRY_STROKE_COLOR,
                width: appConfig.GEOMETRY_STROKE_WEIGHT
            }),
            image: new Ol_Style_Circle({
                radius: 7,
                fill: new Ol_Style_Fill({
                    color: appConfig.GEOMETRY_STROKE_COLOR
                })
            })
        });

        this.areaDisplayInnerStyle = new Ol_Style({
            fill: new Ol_Style_Fill({
                color: "rgba(255, 255, 255, 0)"
            }),
            stroke: new Ol_Style_Stroke({
                color: "rgba(255, 255, 255, 1)",
                width: 3
            })
        });
        this.areaDisplayOuterStyle = new Ol_Style({
            fill: new Ol_Style_Fill({
                color: "rgba(255, 255, 255, 0)"
            }),
            stroke: new Ol_Style_Stroke({
                color: appConfig.GEOMETRY_STROKE_COLOR,
                width: 4
            })
        });

        this.areaDisplayHighlightStyle = new Ol_Style({
            fill: new Ol_Style_Fill({
                color: "rgba(255, 255, 255, 0)"
            }),
            stroke: new Ol_Style_Stroke({
                color: "rgba(2, 136, 209, 1)",
                width: 3
            })
        });
    }

    setExtent(extent, padView = false) {
        try {
            if (extent) {
                let mapSize = this.map.getSize() || [];
                this.map.getView().fit(extent, {
                    size: mapSize,
                    constrainResolution: false,
                    padding: padView ? [70, 70, 70, 70] : undefined
                });
                return true;
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.setExtent:", err);
            return false;
        }
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
            if (layer.get("handleAs") === appStrings.LAYER_VECTOR_TILE_TRACK) {
                cachedLayer.setStyle(this.createVectorTileTrackLayerStyles(layer));
            }

            return cachedLayer;
        }

        // create a new layer
        switch (layer.get("handleAs")) {
            case appStrings.LAYER_VECTOR_TILE_TRACK:
                mapLayer = this.createVectorTileTrackLayer(layer, fromCache);
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
                mapLayer.set("_layerTime", moment(date).format(layer.get("timeFormat")));
                mapLayer.set("_layerCacheHash", this.getCacheHash(layer, date));
            } else {
                mapLayer.set("_layerCacheHash", this.getCacheHash(layer));
                mapLayer.set("_layerTime", moment(this.mapDate).format(layer.get("timeFormat")));
            }
        }

        return mapLayer;
    }

    createVectorTileTrackLayer(layer, fromCache = true) {
        try {
            // layer for vector display
            // let vectorLayer = new Ol_Layer_Vector({
            //     renderMode: "image",
            //     style: this.createVectorTileTrackLayerStyles(layer),
            //     source: new Ol_Source_Vector({
            //         features: []
            //     })
            // });

            // // generate a GetFeature request
            // let wfsFormat = new Ol_Format_WFS();
            // let geojsonFormat = new Ol_Format_GeoJSON();
            // let featureRequest = wfsFormat.writeGetFeature({
            //     srsName: "EPSG:4326",
            //     featureNS: "oiip.jpl.nasa.gov",
            //     featurePrefix: "oiip",
            //     featureTypes: ["mview_vis_geom"],
            //     outputFormat: "application/json",
            //     filter: Ol_Filter.equalTo("tag_id", 1)
            // });

            // // fetch the data
            // // let parsedData = false;
            // MiscUtil.asyncFetch({
            //     url: "https://oiip.jpl.nasa.gov/geoserver/ows",
            //     options: {
            //         method: "POST",
            //         body: new XMLSerializer().serializeToString(featureRequest)
            //     },
            //     handleAs: appStringsCore.FILE_TYPE_TEXT
            // }).then(
            //     resp => {
            //         let featureSet = [];
            //         let features = geojsonFormat.readFeatures(resp);
            //         for (let i = 0; i < features.length - 1; ++i) {
            //             let feature = features[i];
            //             feature.set("_layerId", layer.get("id"));
            //             let geom = feature.getGeometry();
            //             let coords = geom.getCoordinates();

            //             // get next point
            //             let nextFeature = features[i + 1];
            //             let nextGeom = nextFeature.getGeometry();
            //             let nextCoords = nextGeom.getCoordinates();

            //             // create new feature
            //             let newFeature = feature.clone();
            //             newFeature.setGeometry(new Ol_Geom_LineString([coords, nextCoords]));
            //             featureSet.push(newFeature);
            //             featureSet.push(feature);
            //         }

            //         // catch the last feature
            //         if (features.length > 0) {
            //             featureSet.push(features[features.length - 1]);
            //         }

            //         let vectorSource = new Ol_Source_Vector({
            //             features: featureSet
            //         });
            //         vectorLayer.setSource(vectorSource);
            //     },
            //     err => {
            //         console.warn("Failed to fetch", err);
            //     }
            // );
            // return vectorLayer;

            let layerSource = this.createVectorTileTrackSource(layer, {
                url: layer.get("url")
            });

            return new Ol_Layer_Vector({
                source: layerSource,
                renderMode: "image",
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
                style: this.createVectorTileTrackLayerStyles(layer)
            });
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createVectorTileTrackLayer:", err);
            return false;
        }
    }

    createVectorTileTrackSource(layer, options) {
        // customize the layer url if needed
        if (
            typeof options.url !== "undefined" &&
            typeof layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D]) !== "undefined"
        ) {
            let urlFunction = this.tileHandler.getUrlFunction(
                layer.getIn(["urlFunctions", appStrings.MAP_LIB_2D])
            );
            options.url = urlFunction({
                layer: layer,
                url: options.url
            });
        }

        let geojsonFormat = new Ol_Format_GeoJSON();
        return new Ol_Source_Vector({
            url: options.url,
            loader: function(extent, resolution, projection) {
                MiscUtil.asyncFetch({
                    url: options.url,
                    handleAs: appStringsCore.FILE_TYPE_TEXT
                }).then(
                    dataStr => {
                        let data = geojsonFormat.readFeatures(dataStr);
                        for (let i = 0; i < data.length - 1; ++i) {
                            let feature = data[i];
                            feature.set("_layerId", layer.get("id"));
                            let geom = feature.getGeometry();
                            let coords = geom.getCoordinates();

                            // get next point
                            let nextFeature = data[i + 1];
                            let nextGeom = nextFeature.getGeometry();
                            let nextCoords = nextGeom.getCoordinates();

                            // create new feature
                            let newFeature = feature.clone();
                            newFeature.setGeometry(new Ol_Geom_LineString([coords, nextCoords]));
                            this.addFeature(newFeature);
                            this.addFeature(feature);
                        }

                        // catch the last feature
                        if (data.length > 0) {
                            this.addFeature(data[data.length - 1]);
                        }
                    },
                    err => {
                        console.warn("Error fetching vector data", err);
                    }
                );
            },
            format: geojsonFormat
        });
    }

    createVectorTileTrackLayerStyles(layer, color = false) {
        if (!color) {
            color = layer.get("vectorColor");
        }

        return new Ol_Style({
            fill: new Ol_Style_Fill({
                color: color
            }),
            stroke: new Ol_Style_Stroke({
                color: color,
                width: 1
            }),
            image: new Ol_Style_Circle({
                radius: 3,
                fill: new Ol_Style_Fill({
                    color: color
                })
            })
        });
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

        mapLayer.setStyle(this.createVectorTileTrackLayerStyles(layer, color));
        return true;
    }

    zoomToLayer(layer) {
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
            this.map.getView().fit(extent, {
                size: this.map.getSize() || [],
                padding: [120, 120, 120, 120],
                duration: 350,
                constrainResolution: false
            });
        }

        return true;
    }

    getDataAtPoint(coords, pixel, palettes) {
        try {
            let data = []; // the collection of pixel data to return
            let mapLayers = this.map.getLayers(); // the layers to search
            this.map.forEachFeatureAtPixel(
                pixel,
                (feature, mapLayer) => {
                    if (mapLayer) {
                        if (feature.getGeometry() instanceof Ol_Geom_Point) {
                            data.push({
                                layerId: mapLayer.get("_layerId"),
                                properties: feature.getProperties(),
                                coords: feature.getGeometry().getCoordinates()
                            });
                            return false;
                        }
                    }
                },
                undefined,
                mapLayer => {
                    return (
                        mapLayer.getVisible() &&
                        mapLayer.get("_layerType") === appStrings.LAYER_GROUP_TYPE_INSITU_DATA
                    );
                }
            );

            // pull just one feature to display
            return data.slice(0, 1);

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
                    isValid: coordinate[1] <= 90 && coordinate[1] >= -90
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
                        let drawInteraction = new Ol_Interaction_Draw({
                            source: mapLayer.getSource(),
                            type: "Circle",
                            geometryFunction: Ol_Interaction_Draw.createBox(),
                            style: this.defaultMeasureStyle,
                            wrapX: true
                        });

                        if (appConfig.DEFAULT_MAP_EXTENT) {
                            // Override creation of overlay_ so we can pass in an extent
                            // since OL doesn't let you do this via options
                            drawInteraction.overlay_ = new Ol_Layer_Vector({
                                extent: appConfig.DEFAULT_MAP_EXTENT,
                                source: new Ol_Source_Vector({
                                    useSpatialIndex: false,
                                    wrapX: true
                                }),
                                style: this.defaultGeometryStyle
                            });
                        }

                        // Set callback
                        drawInteraction.on("drawend", event => {
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
            return {
                type: appStrings.GEOMETRY_BOX,
                id: Math.random(),
                proj: this.map
                    .getView()
                    .getProjection()
                    .getCode(),
                coordinates: [
                    parseFloat(minX.toFixed(3)),
                    parseFloat(minY.toFixed(3)),
                    parseFloat(maxX.toFixed(3)),
                    parseFloat(maxY.toFixed(3))
                ],
                coordinateType: appStringsCore.COORDINATE_TYPE_CARTOGRAPHIC
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
            drawInteractions.map(handler => {
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
            drawInteractions.map(handler => {
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
            x => x.get("interactionType") === appStrings.INTERACTION_AREA_SELECTION
        );
        for (let i = 0; i < featuresToRemove.length; i++) {
            mapLayer.getSource().removeFeature(featuresToRemove[i]);
        }
        return (
            mapLayer
                .getSource()
                .getFeatures()
                .filter(x => x.get("interactionType") === appStrings.INTERACTION_AREA_SELECTION)
                .length === 0
        );
    }

    addGeometry(geometry, interactionType, geodesic = false) {
        if (interactionType === appStrings.INTERACTION_AREA_SELECTION) {
            this.removeAllAreaSelections();
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
            if (geometry.type === appStrings.GEOMETRY_BOX) {
                if (geometry.coordinateType === appStringsCore.COORDINATE_TYPE_CARTOGRAPHIC) {
                    let ulCoord = [geometry.coordinates[0], geometry.coordinates[3]];
                    let urCoord = [geometry.coordinates[2], geometry.coordinates[3]];
                    let blCoord = [geometry.coordinates[0], geometry.coordinates[1]];
                    let brCoord = [geometry.coordinates[2], geometry.coordinates[1]];

                    // // generate geodesic arcs from points
                    // if (geodesic) {
                    //     geomCoords = this.mapUtil.generateGeodesicArcsForLineString(geomCoords);
                    // }

                    let lineStringFeature = new Ol_Feature({
                        geometry: new Ol_Geom_Polygon([[ulCoord, urCoord, brCoord, blCoord]])
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
            if (geometry.type === appStrings.GEOMETRY_BOX) {
                if (geometry.coordinateType === appStringsCore.COORDINATE_TYPE_CARTOGRAPHIC) {
                    let ulCoord = [geometry.coordinates[0], geometry.coordinates[3]];
                    let urCoord = [geometry.coordinates[2], geometry.coordinates[3]];
                    let blCoord = [geometry.coordinates[0], geometry.coordinates[1]];
                    let brCoord = [geometry.coordinates[2], geometry.coordinates[1]];

                    // // generate geodesic arcs from points
                    // if (geodesic) {
                    //     geomCoords = this.mapUtil.generateGeodesicArcsForLineString(geomCoords);
                    // }

                    let lineStringFeature = new Ol_Feature({
                        geometry: new Ol_Geom_Polygon([[ulCoord, urCoord, brCoord, blCoord]])
                    });

                    lineStringFeature.set("interactionType", interactionType);
                    lineStringFeature.setId(geometry.id);
                    // mapLayer.getSource().addFeature(lineStringFeature);
                    mapLayer
                        .getLayers()
                        .item(0)
                        .getSource()
                        .addFeature(lineStringFeature);
                    mapLayer
                        .getLayers()
                        .item(1)
                        .getSource()
                        .addFeature(lineStringFeature);
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
        } else if (interactionType === appStrings.INTERACTION_AREA_HIGHLIGHT) {
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

            let feature = mapLayer
                .getLayers()
                .item(0)
                .getSource()
                .getFeatureById(geometry.id)
                .clone();
            feature.setId(geometry.id);

            if (typeof feature === "undefined") {
                console.warn("could not feature with id: ", geometry.id);
                return true;
            }

            let source = mapLayer
                .getLayers()
                .item(2)
                .getSource();
            source.clear();
            source.addFeature(feature);

            return true;
        } else {
            return MapWrapperOpenlayersCore.prototype.addGeometry.call(
                this,
                geometry,
                interactionType,
                geodesic
            );
        }
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

            let outerSource = mapLayer
                .getLayers()
                .item(0)
                .getSource();
            let innerSource = mapLayer
                .getLayers()
                .item(1)
                .getSource();

            let outerFeature = outerSource.getFeatureById(geometry.id);
            let innerFeature = innerSource.getFeatureById(geometry.id);
            if (typeof outerFeature === "undefined" || typeof innerFeature === "undefined") {
                console.warn("could not feature with id: ", geometry.id);
                return true;
            }

            outerSource.removeFeature(outerFeature);
            innerSource.removeFeature(innerFeature);

            return true;
        } else if (interactionType === appStrings.INTERACTION_AREA_HIGHLIGHT) {
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

            let source = mapLayer
                .getLayers()
                .item(2)
                .getSource();

            if (typeof geometry.id !== "undefined") {
                let feature = source.getFeatureById(geometry.id);
                if (typeof feature === "undefined") {
                    console.warn("could not feature with id: ", geometry.id);
                    return true;
                }

                source.removeFeature(feature);
            } else {
                source.clear();
            }

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
            console.warn("Error in MapWrapperOpenlayers.updateLayer:", err);
            return false;
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
                checkLayerStatus: mapLayer => {
                    return this.loadTiles(mapLayer);
                },
                clearFrameLayer: mapLayer => {
                    return this.clearBufferLayer(mapLayer);
                }
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
            this.animationBuffer.getMapLayers().forEach(mapLayer => {
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

            // // add the layer to cache for faster access later
            // this.layerCache.set(mapLayer.get("_layerCacheHash"), mapLayer);

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
            source.set("_tileLoadEndListener", source.on("tileloadend", () => tileComplete()));
        }
        if (typeof source.get("_tileLoadErrorListener") === "undefined") {
            source.set("_tileLoadErrorListener", source.on("tileloaderror", () => tileComplete()));
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
        Ol_Observable.unByKey(mapLayer.getSource().get("_tileLoadEndListener"));
        mapLayer.getSource().unset("_tileLoadEndListener");
        Ol_Observable.unByKey(mapLayer.getSource().get("_tileLoadErrorListener"));
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
        tileGrid.forEachTileCoord(extent, zoom, tileCoord => {
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
        tileGrid.forEachTileCoord(extent, zoom, tileCoord => {
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
            return layer.get("id") + moment(date).format(layer.get("timeFormat"));
        } else {
            return layer.get("id") + moment(this.mapDate).format(layer.get("timeFormat"));
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
}
