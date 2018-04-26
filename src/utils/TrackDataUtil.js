import appConfig from "constants/appConfig";

export default class TrackDataUtil {
    static getUrlsForQuery(options) {
        return TrackDataUtil.getDecimationQuery(options);
        // return TrackDataUtil.getSolrQuery(options);
    }

    static getDecimationQuery(options) {
        let { selectedTracks, xAxis, yAxis, zAxis } = options;
        let baseUrl = appConfig.URLS.decimatorMiddleware;
        return selectedTracks.map(track => {
            return encodeURI(
                baseUrl +
                    "?" +
                    ["project=" + track.project, "source_id=" + track.source_id].join("&")
            );
        });
    }

    static getSolrQuery(options) {
        let { selectedTracks, xAxis, yAxis, zAxis } = options;
        let baseUrl = appConfig.URLS.solrBase;
        let query = [
            "facet=on",
            "wt=csv",
            "rows=3000000",
            "sort=measurement_date_time asc",
            "fl=measurement_date_time,depth,measurement_value"
        ];
        return selectedTracks.map(track => {
            return encodeURI(
                baseUrl +
                    "?" +
                    query
                        .concat([
                            "q=project:" +
                                track.project +
                                " AND source_id:" +
                                track.source_id +
                                " AND measurement_name:temperature"
                        ])
                        .join("&")
            );
        });
    }
}
