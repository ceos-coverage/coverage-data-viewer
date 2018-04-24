import appConfig from "constants/appConfig";

export default class GeoServerUtil {
    static getUrlForTrack(track) {
        let baseUrl = appConfig.URLS.trackGeometry.geoserverBase;

        let query = [
            "service=WFS",
            "version=1.0.0",
            "request=GetFeature",
            "outputFormat=json",
            "typeName=oiip:mview_vis_geom_" + track.get("project"),
            "CQL_FILTER=source_id=" + track.get("source_id")
        ].join("&");

        return baseUrl + "?" + query;
    }
}
