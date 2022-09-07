/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import moment from "moment";
import appConfig from "constants/appConfig";
import * as appStrings from "constants/appStrings";

export default class DAGDataUtil {
    static getUrlsForQuery(options) {
        return DAGDataUtil.getDAGQuery(options);
    }

    static getDAGQuery(options) {
        const { selectedTracks, selectedArea, startDate, endDate, satelliteChartType } = options;
        const baseUrl = appConfig.URLS.dagBase;

        const typeQuery = [
            "analysisName=spatial_summary_statistics",
            `analysis_sub_type=${DAGDataUtil.chartTypeToDAGType(satelliteChartType)}`,
        ];

        const areaQuery = [
            `lon_min=${selectedArea[0]}`,
            `lat_min=${selectedArea[1]}`,
            `lon_max=${selectedArea[2]}`,
            `lat_max=${selectedArea[3]}`,
        ];

        const dateQuery = [
            `time_min=${moment.utc(startDate).format("YYYY-MM-DD")}`,
            `time_max=${moment.utc(endDate).format("YYYY-MM-DD")}`,
        ];

        return selectedTracks.map((track) => {
            let query = [
                `datasetName=${track.id}`,
                `colormapurl=${track.colormap}`,
                "format=json",
                ...typeQuery,
                ...areaQuery,
                ...dateQuery,
            ];

            return encodeURI(baseUrl + "?" + query.join("&"));
        });
    }

    static chartTypeToDAGType(chartType) {
        switch (chartType) {
            case appStrings.SATELLITE_CHART_TYPE_TIME_SERIES:
                return "Time Series";
            case appStrings.SATELLITE_CHART_TYPE_TIME_RANGE_HIST:
                return "Time Range";
            default:
                return "Time Range";
        }
    }

    static deriveFormOptions(dataArrs) {
        // data obj is the output from WebWorker
        const dataObj = Array.isArray(dataArrs) ? dataArrs[0] : dataArrs;
        if (dataObj) {
            const xAxis = dataObj.meta.columns[0];
            const yAxis = dataObj.meta.columns[1];
            return { xAxis, xAxisLabel: xAxis, yAxis, yAxisLabel: yAxis };
        }
        return {};
    }
}
