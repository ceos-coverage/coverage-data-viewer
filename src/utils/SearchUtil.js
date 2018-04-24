import Immutable from "immutable";
import moment from "moment";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "utils/MiscUtil";
import appConfig from "constants/appConfig";

export default class SearchUtil {
    static searchForTracks(options) {
        return new Promise((resolve, reject) => {
            let { area, dateRange, facets } = options;

            let baseUrl = appConfig.URLS.layerSearch.solrBase;

            let sDateStr = moment.utc(dateRange[0]).toISOString();
            let eDateStr = moment.utc(dateRange[1]).toISOString();

            area = area.length === 4 ? area : [-180, -90, 180, 90];
            let bl = [area[1], area[0]].join(",");
            let ur = [area[3], area[2]].join(",");

            let query = [
                "q=position_date_time:[" + sDateStr + " TO " + eDateStr + "]",
                "fq=geom:[" + bl + " TO " + ur + "]",
                "fl=source_id,project,id",
                "group=true",
                "group.field=source_id",
                "rows=1000",
                "wt=json"
            ];

            let tagbaseQ = encodeURI(
                baseUrl + "?" + query.concat(["fq=project:tagbase"]).join("&")
            );
            let spursQ = encodeURI(baseUrl + "?" + query.concat(["fq=project:spurs"]).join("&"));

            let tagbasePromise = MiscUtil.asyncFetch({
                url: tagbaseQ,
                handleAs: appStringsCore.FILE_TYPE_JSON
            });
            let spursPromise = MiscUtil.asyncFetch({
                url: spursQ,
                handleAs: appStringsCore.FILE_TYPE_JSON
            });

            Promise.all([tagbasePromise, spursPromise]).then(
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
        return data.reduce((results, projGroup) => {
            let groups = projGroup.grouped.source_id.groups;
            for (let i = 0; i < groups.length; ++i) {
                let entry = groups[i].doclist.docs[0];
                entry.title = entry.title || entry.id;
                results.push(Immutable.fromJS(groups[i].doclist.docs[0]));
            }
            return results;
        }, []);
    }
}
