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
}
