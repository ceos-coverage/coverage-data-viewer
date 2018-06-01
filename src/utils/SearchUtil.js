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

            let sDateStr = moment.utc(dateRange[0]).unix();
            let eDateStr = moment.utc(dateRange[1]).unix();

            area = area.length === 4 ? area : [-180, -90, 180, 90];
            let bl = [area[1], area[0]].join(",");
            let ur = [area[3], area[2]].join(",");

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
        return data.reduce((results, dataSet) => {
            let entries = dataSet.response.docs;
            for (let i = 0; i < entries.length; ++i) {
                let entry = Immutable.fromJS(entries[i]);
                let formattedTrack = Immutable.Map({
                    id: entry.get("id") || entry.get("project") + "_" + entry.get("source_id"),
                    title: entry.get("title") || entry.get("platform") || entry.get("id"),
                    insituMeta: entry.set(
                        "variables",
                        SearchUtil.readVariables(entry.get("variables"))
                    )
                });
                results.push(Immutable.fromJS(formattedTrack));
            }
            return results;
        }, []);
    }

    static readVariables(varList) {
        // hack: add in known variables
        if (!varList.contains("time")) {
            varList = varList.push("time");
        }
        if (!varList.contains("depth (dbar)")) {
            varList = varList.push("depth (dbar)");
        }

        return varList.reduce((acc, varStr) => {
            let labelRe = /^[\w\d\s/]+/;
            let unitsRe = /\([\w\d\s/]+\)/;
            let label = varStr.match(labelRe);
            let units = varStr.match(unitsRe);

            if (label !== null && units !== null) {
                return acc.add(
                    Immutable.Map({
                        value: label[0].trim(),
                        label: label[0].trim(),
                        units: units[0]
                            .replace("(", "")
                            .replace(")", "")
                            .trim()
                    })
                );
            } else {
                return acc.add(Immutable.Map({ value: varStr, label: varStr, units: "" }));
            }
        }, Immutable.Set());
    }
}
