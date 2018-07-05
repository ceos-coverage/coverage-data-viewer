/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import appConfig from "constants/appConfig";

export default class GeoServerUtil {
    static getUrlForTrack(track) {
        let baseUrl = appConfig.URLS.geoserverBase;

        let query = [
            "service=WFS",
            "version=1.0.0",
            "request=GetFeature",
            "outputFormat=json",
            "typeName=oiip:mview_vis_geom_" + track.getIn(["insituMeta", "project"]),
            "CQL_FILTER=source_id=" + track.getIn(["insituMeta", "source_id"])
        ].join("&");

        return baseUrl + "?" + query;
    }

    static getUrlForTrackError(track, errTrackId = "") {
        // http://oiip.jpl.nasa.gov/gwc/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=oiip:err_tagbase_4&STYLE=&TILEMATRIX=EPSG:4326:8&TILEMATRIXSET=EPSG:4326&FORMAT=application/x-protobuf;type=mapbox-vector&TILECOL=135&TILEROW=94

        let baseUrl = "http://oiip.jpl.nasa.gov/gwc/wmts";

        if (errTrackId === "") {
            errTrackId =
                "oiip:err_poly_" +
                track.getIn(["insituMeta", "project"]) +
                "_" +
                track.getIn(["insituMeta", "source_id"]);
        }

        let query = [
            "service=WMTS",
            "version=1.0.0",
            "request=GetTile",
            "FORMAT=application/x-protobuf;type=mapbox-vector",
            "TILEMATRIXSET=EPSG:4326",
            "LAYER=" + errTrackId,
            "TILEMATRIX=EPSG:4326:{z}",
            "TILECOL={x}",
            "TILEROW={y}"
        ].join("&");

        return baseUrl + "?" + query;
    }
}
