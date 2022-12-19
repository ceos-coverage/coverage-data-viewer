/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import moment from "moment";
import appConfig from "constants/appConfig";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "utils/MiscUtil";

export default class CDMSDataUtil {
    static getCDMSQuery(options) {
        const {
            primaryDataset,
            secondaryDataset,
            depthMin,
            depthMax,
            timeTolerance,
            radiusTolerance,
            startDate,
            endDate,
            area,
        } = options;

        const baseUrl = `${appConfig.URLS.domsBase}/match_spark`;

        const query = [
            `primary=${primaryDataset.get("id")}`,
            `secondary=${secondaryDataset.get("id")}`,
            `b=${area.join(",")}`,
            `startTime=${moment.utc(startDate).format("YYYY-MM-DDTHH:mm:ss")}Z`,
            `endTime=${moment.utc(endDate).format("YYYY-MM-DDTHH:mm:ss")}Z`,
            `depthMin=${depthMin}`,
            `depthMax=${depthMax}`,
            `tt=${timeTolerance}`,
            `rt=${radiusTolerance}`,
            "platforms=3B,6A,0,16,17,23,30,31,41,42,46,48", // TODO - select the right platform based on the dataset?
            `matchOnce=${true}`, // TODO - make this selectable
        ];

        const queryUrl = encodeURI(baseUrl + "?" + query.join("&"));

        // return queryUrl;

        // TODO - remove hardcoded query for demo purposes only
        return "https://doms.jpl.nasa.gov/match_spark?primary=MUR25-JPL-L4-GLOB-v04.2&secondary=shark-2018&b=-125.582,27.658,-115.061,37.725&startTime=2018-04-01T07:00:00Z&endTime=2018-06-30T07:00:00Z&depthMin=-5&depthMax=5&tt=86400&rt=50000&platforms=3B,6A,0,16,17,23,30,31,41,42,46,48&matchOnce=true";
    }

    static getCDMSMatchup(options) {
        return new Promise((resolve, reject) => {
            const url = this.getCDMSQuery(options);

            MiscUtil.asyncFetch({
                url: url,
                handleAs: appStringsCore.FILE_TYPE_JSON,
            }).then(
                (data) => {
                    resolve(data);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    static formatResults(data) {
        return data;
    }
}
