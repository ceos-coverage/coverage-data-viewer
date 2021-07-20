/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "utils/MiscUtil";
import appConfig from "constants/appConfig";

export default class SearchUtil {
    static searchForFacets(options) {
        return new Promise((resolve, reject) => {
            let { area, dateRange, facets, datatype } = options;

            let baseUrl = appConfig.URLS.solrBase;

            let sDateStr = moment.utc(dateRange[0]).unix();
            let eDateStr = moment.utc(dateRange[1]).unix();

            area = area.length === 4 ? area : [-180, -90, 180, 90];
            let bl = [area[1], area[0]].join(",");
            let ur = [area[3], area[2]].join(",");

            let query = [
                "q=" + datatype,
                "fq=lon_max:[" + area[0] + " TO *]",
                "fq=lon_min:[* TO " + area[2] + "]",
                "fq=lat_max:[" + area[1] + " TO *]",
                "fq=lat_min:[* TO " + area[3] + "]",
                "fq=start_date:[* TO " + eDateStr + "]",
                "fq=end_date:[" + sDateStr + " TO *]",
                "facet.mincount=1",
                "facet=on",
                "rows=0",
                "wt=json"
            ];

            // add facet queries
            let keys = Object.keys(facets);
            for (let i = 0; i < keys.length; ++i) {
                let key = keys[i];
                if (facets[key].length > 0) {
                    query.push(
                        "fq=" + key + ":(" + facets[key].map(x => '"' + x + '"').join(" OR ") + ")"
                    );
                }
            }

            // add configured faceting
            let configFacets = appConfig.LAYER_SEARCH.FACETS;
            for (let i = 0; i < configFacets.length; ++i) {
                query.push("facet.field=" + configFacets[i].value);
            }

            let url = encodeURI(baseUrl + "?" + query.join("&"));

            MiscUtil.asyncFetch({
                url: url,
                handleAs: appStringsCore.FILE_TYPE_JSON
            }).then(
                data => {
                    let results = SearchUtil.processFacetResults([data]);
                    resolve(results);
                },
                err => {
                    reject(err);
                }
            );
        });
    }
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
                "fq=start_date:[* TO " + eDateStr + "]",
                "fq=end_date:[" + sDateStr + " TO *]",
                "rows=1000",
                "wt=json"
            ];

            // add facet queries
            let keys = Object.keys(facets);
            for (let i = 0; i < keys.length; ++i) {
                let key = keys[i];
                if (facets[key].length > 0) {
                    query.push(
                        "fq=" + key + ":(" + facets[key].map(x => '"' + x + '"').join(" OR ") + ")"
                    );
                }
            }

            let url = encodeURI(baseUrl + "?" + query.join("&"));

            MiscUtil.asyncFetch({
                url: url,
                handleAs: appStringsCore.FILE_TYPE_JSON
            }).then(
                data => {
                    let results = SearchUtil.processLayerSearchResults([data], { isTrack: true });
                    resolve(results);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    static searchForSingleTrack(id) {
        return new Promise((resolve, reject) => {
            const baseUrl = appConfig.URLS.solrBase;
            const query = ["q=datatype:track", `fq=id:${id}`, "wt=json"];
            const url = encodeURI(baseUrl + "?" + query.join("&"));
            MiscUtil.asyncFetch({
                url: url,
                handleAs: appStringsCore.FILE_TYPE_JSON
            }).then(
                data => {
                    const results = SearchUtil.processLayerSearchResults([data], { isTrack: true });
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        resolve(null);
                    }
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    static searchForSingleSatellite(id) {
        return new Promise((resolve, reject) => {
            const baseUrl = appConfig.URLS.solrBase;
            const query = ["q=datatype:layer", `fq=layer_id:${id}`, "wt=json"];
            const url = encodeURI(baseUrl + "?" + query.join("&"));
            MiscUtil.asyncFetch({
                url: url,
                handleAs: appStringsCore.FILE_TYPE_JSON
            }).then(
                data => {
                    const results = SearchUtil.processSatelliteLayerSearchResults([data], {
                        isSatellite: true
                    });
                    if (results.length > 0) {
                        resolve(results.find(x => x.get("id") === id));
                    } else {
                        resolve(null);
                    }
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    static searchForSatelliteSets(options) {
        return new Promise((resolve, reject) => {
            let { area, dateRange, facets } = options;

            let baseUrl = appConfig.URLS.solrBase;

            let sDateStr = moment.utc(dateRange[0]).unix();
            let eDateStr = moment.utc(dateRange[1]).unix();

            area = area.length === 4 ? area : [-180, -90, 180, 90];
            let bl = [area[1], area[0]].join(",");
            let ur = [area[3], area[2]].join(",");

            let query = [
                "q=datatype:layer",
                "fq=lon_max:[" + area[0] + " TO *]",
                "fq=lon_min:[* TO " + area[2] + "]",
                "fq=lat_max:[" + area[1] + " TO *]",
                "fq=lat_min:[* TO " + area[3] + "]",
                "fq=start_date:[* TO " + eDateStr + "]",
                "fq=end_date:[" + sDateStr + " TO *]",
                "rows=1000",
                "wt=json"
            ];

            // add facet queries
            let keys = Object.keys(facets);
            for (let i = 0; i < keys.length; ++i) {
                let key = keys[i];
                if (facets[key].length > 0) {
                    query.push(
                        "fq=" + key + ":(" + facets[key].map(x => '"' + x + '"').join(" OR ") + ")"
                    );
                }
            }

            let url = encodeURI(baseUrl + "?" + query.join("&"));

            MiscUtil.asyncFetch({
                url: url,
                handleAs: appStringsCore.FILE_TYPE_JSON
            }).then(
                data => {
                    let results = SearchUtil.processSatelliteLayerSearchResults([data], {
                        isSatellite: true
                    });
                    resolve(results);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    static processFacetResults(data) {
        let retFacets = {};
        try {
            if (data.length > 0) {
                let fields = data[0].facet_counts.facet_fields;
                let facets = appConfig.LAYER_SEARCH.FACETS;
                for (let i = 0; i < facets.length; ++i) {
                    let facet = facets[i].value;
                    let values = fields[facet];
                    retFacets[facet] = values.reduce((acc, valueStr, i) => {
                        if (i % 2 === 0) {
                            acc.push({ label: valueStr, value: valueStr, cnt: values[i + 1] });
                        }
                        return acc;
                    }, []);
                }
            }
            return Immutable.fromJS(retFacets);
        } catch (err) {
            console.warn("Error in SearchUtil.processFacetResults: ", err);
            return Immutable.fromJS(retFacets);
        }
    }

    static processLayerSearchResults(data, extraOps = {}) {
        return data.reduce((results, dataSet) => {
            let entries = dataSet.response.docs;
            for (let i = 0; i < entries.length; ++i) {
                let entry = Immutable.fromJS(entries[i]);
                const id = entry.get("id") || entry.get("project") + "_" + entry.get("source_id");
                const idNumMatch = id.match(/\d+/g);
                let formattedTrack = Immutable.Map({
                    id: id,
                    shortId: entry.get("platform_id") || idNumMatch[0],
                    title: entry.get("title") || entry.get("platform") || entry.get("id"),
                    insituMeta: entry.set(
                        "variables",
                        SearchUtil.readVariables(
                            entry.get("variables"),
                            entry.get("variables_units"),
                            false,
                            extraOps.isTrack
                        )
                    )
                }).mergeDeep(extraOps);
                results.push(Immutable.fromJS(formattedTrack));
            }
            return results;
        }, []);
    }

    static processSatelliteLayerSearchResults(data, extraOps = {}) {
        return data.reduce((results, dataSet) => {
            let entries = dataSet.response.docs;
            for (let i = 0; i < entries.length; ++i) {
                let entry = Immutable.fromJS(entries[i]);
                const variables = SearchUtil.readVariables(
                    entry.get("variables"),
                    entry.get("variables_units"),
                    entry.get("layer_id"),
                    extraOps.isTrack
                );
                variables.forEach((v, i) => {
                    const id =
                        v.get("layerId") ||
                        (entry.get("id") || entry.get("project") + "_" + entry.get("source_id")) +
                            v.get("label");
                    const idNumMatch = id.match(/\d+/g);
                    const formattedTrack = Immutable.Map({
                        id: id,
                        shortId: entry.get("platform_id") || idNumMatch[0],
                        title:
                            v.get("label") ||
                            entry.get("title") ||
                            entry.get("platform") ||
                            entry.get("id"),
                        colorbarUrl: entry.get("colorbar_url")
                            ? entry.getIn(["colorbar_url", i])
                            : "",
                        insituMeta: entry.set("variables", Immutable.Set().add(v))
                    }).mergeDeep(extraOps);
                    results.push(Immutable.fromJS(formattedTrack));
                });
            }
            return results;
        }, []);
    }

    static readVariables(varList, unitsList, layerList = false, addMissing = false) {
        // hack: add in known variables
        if (addMissing) {
            if (!varList.contains("time")) {
                varList = varList.push("time");
                unitsList = unitsList.push("");
            }
            if (!varList.contains("depth")) {
                varList = varList.push("depth");
                unitsList = unitsList.push("dbar");
            }
        }

        return varList
            .reduce((acc, varStr, i) => {
                if (layerList) {
                    return acc.add(
                        Immutable.Map({
                            label: varStr,
                            units: unitsList.get(i) || "",
                            layerId: layerList.get(i) || ""
                        })
                    );
                }
                return acc.add(
                    Immutable.Map({
                        label: varStr,
                        units: unitsList.get(i) || ""
                    })
                );
            }, Immutable.OrderedSet())
            .toList();
    }
}
