import Immutable from 'immutable';
import moment from 'moment';
import * as config from '../../constants/mapConfig';

export const mapState = Immutable.fromJS({
    layers: {
        data: [],
        reference: [],
        basemap: [],
        partial: []
    },
    maps: {},
    palettes: {},
    date: config.DEFAULT_DATE,
    view: {
        in3DMode: false,
        zoom: config.DEFAULT_ZOOM,
        maxZoom: config.MAX_ZOOM,
        minZoom: config.MIN_ZOOM,
        maxZoomDistance3D: config.MAX_ZOOM_DISTANCE_3D,
        minZoomDistance3D: config.MIN_ZOOM_DISTANCE_3D,
        center: config.DEFAULT_CENTER,
        extent: config.DEFAULT_EXTENT,
        projection: config.DEFAULT_PROJECTION,
        pixelHoverCoordinate: {
            lat: 0.0,
            lon: 0.0,
            x: 0,
            y: 0,
            isValid: false
        }
    },
    displaySettings: {
        enableTerrain: true,
        selectedScaleUnits: "metric"
    },
    alerts: []
});

export const layerModel = Immutable.fromJS({
    id: "",
    title: "",
    isActive: false,
    isChangingOpacity: false,
    isChangingPosition: false,
    opacity: 1.0,
    url: "",
    palette: {
        name: "",
        url: "",
        handleAs: "",
        min: 0,
        max: 0
    },
    min: 0,
    max: 0,
    units: "",
    timeFormat: "YYYY-MM-DD",
    time: moment(config.DEFAULT_DATE).format("YYYY-MM-DD"),
    type: "",
    isDefault: false,
    wmtsOptions: {
        urlFunction: "",
        tileFunction: "",
        urlFunctions: {},
        tileFunctions: {},
        url: "",
        layer: "",
        format: "",
        requestEncoding: "",
        matrixSet: "",
        projection: "",
        extents: [],
        tileGrid: {
            origin: [],
            resolutions: [],
            matrixIds: [],
            tileSize: 256
        }
    },
    metadata: {
        platform: "",
        spatialResolution: "",
        dateRange: "",
        description: ""
    },
    // One of these should work well...
    thumbnailImage: "https://unsplash.it/700/400?image=1025",
    // thumbnailImage: "https://unsplash.it/700/400?image=1002",
    // thumbnailImage: "https://unsplash.it/700/400?image=966",
    // thumbnailImage: "https://unsplash.it/700/400?image=967",
    // thumbnailImage: "https://unsplash.it/700/400?image=1032",
    fromJson: false,
    clusterVector: false,
    handleAs: "generic",
    updateParameters: {"time": true}
});

export const paletteModel = Immutable.fromJS({
    id: "",
    values: []
});
