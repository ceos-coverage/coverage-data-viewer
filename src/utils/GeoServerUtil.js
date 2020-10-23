/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import appConfig from "constants/appConfig";
import * as appStrings from "constants/appStrings";

export default class GeoServerUtil {
    static getUrlForTrack(track) {
        if (track.getIn(["insituMeta", "handle_as"]) === appStrings.LAYER_VECTOR_POINTS_WFS) {
            // query = query.concat([
            //     "count=1000000",
            //     `typeName=${track.getIn(["insituMeta", "layer_id", 0])}`,
            //     `CQL_FILTER=fishery='${track.getIn([
            //         "insituMeta",
            //         "instrument",
            //         0
            //     ])}' AND species='${track.getIn([
            //         "insituMeta",
            //         "platform",
            //         0
            //     ])}' AND dates AFTER {DATETIMEmin} AND dates BEFORE {DATETIMEmax} AND BBOX(geom,{LONmin},{LATmin},{LONmax},{LATmax})`
            // ]);
            return track.getIn(["insituMeta", "service_url"]);
        } else {
            let baseUrl = appConfig.URLS.geoserverBase;
            let query = ["service=WFS", "version=2.0.0", "request=GetFeature", "outputFormat=json"];
            query = query.concat([
                `typeName=${track.getIn(["insituMeta", "project"])}`,
                `CQL_FILTER=source_id=${track.getIn(["insituMeta", "source_id"])}`
            ]);
            return `${baseUrl}?${query.join("&")}`;
        }
    }

    static getUrlForTrackError(track, errTrackId = "") {
        let baseUrl = appConfig.URLS.geoserverVectorTileBase;

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
