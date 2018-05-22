import Immutable from "immutable";
import moment from "moment";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "utils/MiscUtil";
import appConfig from "constants/appConfig";

// https://oiip.jpl.nasa.gov/solr/?q=project:tagbase&fq=datatype:title&indent=on&wt=json&rows=1000

export default class SearchUtil {
    static searchForTracks(options) {
        return new Promise((resolve, reject) => {
            let { area, dateRange, facets } = options;

            let baseUrl = appConfig.URLS.solrBase;

            // let sDateStr = moment.utc(dateRange[0]).toISOString();
            // let eDateStr = moment.utc(dateRange[1]).toISOString();
            let sDateStr = moment.utc(dateRange[0]).unix();
            let eDateStr = moment.utc(dateRange[1]).unix();

            area = area.length === 4 ? area : [-180, -90, 180, 90];
            let bl = [area[1], area[0]].join(",");
            let ur = [area[3], area[2]].join(",");

            // let query = [
            //     "q=position_date_time:[" + sDateStr + " TO " + eDateStr + "]",
            //     "fq=geom:[" + bl + " TO " + ur + "]",
            //     "fl=source_id,project,id",
            //     "group=true",
            //     "group.field=source_id",
            //     "rows=1000",
            //     "wt=json"
            // ];

            // let tagbaseQ = encodeURI(
            //     baseUrl + "?" + query.concat(["fq=project:tagbase"]).join("&")
            // );
            // let spursQ = encodeURI(baseUrl + "?" + query.concat(["fq=project:spurs"]).join("&"));

            // let tagbasePromise = MiscUtil.asyncFetch({
            //     url: tagbaseQ,
            //     handleAs: appStringsCore.FILE_TYPE_JSON
            // });
            // let spursPromise = MiscUtil.asyncFetch({
            //     url: spursQ,
            //     handleAs: appStringsCore.FILE_TYPE_JSON
            // });

            // Promise.all([tagbasePromise, spursPromise]).then(
            //     data => {
            //         let results = SearchUtil.processLayerSearchResults(data);
            //         resolve(results);
            //     },
            //     err => {
            //         reject(err);
            //     }
            // );

            let query = [
                "q=datatype:track",
                "fq=lon_max:[" + area[0] + " TO *]",
                "fq=lon_min:[* TO " + area[2] + "]",
                "fq=lat_max:[" + area[1] + " TO *]",
                "fq=lat_min:[* TO " + area[3] + "]",
                "fq=start_date:[" + sDateStr + " TO *]",
                "fq=end_date:[* TO " + eDateStr + "]",
                "rows=1000",
                "wt=json"
            ];

            let url = encodeURI(baseUrl + "?" + query.join("&"));

            let promise = MiscUtil.asyncFetch({
                url: url,
                handleAs: appStringsCore.FILE_TYPE_JSON
            });

            Promise.all([promise]).then(
                data => {
                    let results = SearchUtil.processLayerSearchResults(data);
                    resolve(results);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    static processLayerSearchResults(data) {
        // return data.reduce((results, projGroup) => {
        //     let groups = projGroup.grouped.source_id.groups;
        //     for (let i = 0; i < groups.length; ++i) {
        //         let entry = groups[i].doclist.docs[0];
        //         entry.id = entry.project + "_" + entry.source_id;
        //         entry.title = entry.title || entry.id;
        //         results.push(Immutable.fromJS(groups[i].doclist.docs[0]));
        //     }
        //     return results;
        // }, []);
        return data.reduce((results, dataSet) => {
            let entries = dataSet.response.docs;
            for (let i = 0; i < entries.length; ++i) {
                let entry = entries[i];
                let formattedTrack = Immutable.Map({
                    id: entry.id || entry.project + "_" + entry.source_id,
                    title: entry.title || entry.platform || entry.id,
                    insituMeta: Immutable.fromJS(entry).delete("variables")
                });
                results.push(Immutable.fromJS(formattedTrack));
            }
            return results;
        }, []);
    }
}
