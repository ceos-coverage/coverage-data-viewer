/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import WebWorkerCore from "_core/utils/WebWorker";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import { largestTriangleThreeBucket } from "d3fc-sample";
import MiscUtil from "utils/MiscUtil";

const NO_DECIMATION_TARGET = -1;

export default class WebWorker extends WebWorkerCore {
    constructor(options) {
        super(options);

        this._remoteData = {};
    }

    /*
    Edit this function to handle worker jobs.
    Whatever is sent back by the promise will be
    sent back to the main thread under the key `data`.
    See `_core/utils/WebWorker.js` as an example of handling
    a message

    message: object passed to the WorkerManager in queueJob()
    workerRef: reference to the worker object

    return: a Promise. When this promise is resolved, the worker
    will send the data back to the main thread.
    */
    handleMessage(message, workerRef) {
        let operation = message.operation;
        switch (operation) {
            case appStrings.WORKER_TASK_RETRIEVE_DATA:
                return this._retrieveRemoteData(message);
            case appStrings.WORKER_TASK_DECIMATE_POINTS_LTTB:
                return this._decimateLTTB(message);
            case appStrings.WORKER_TASK_FORMAT_DAG_DATA:
                return this._formatDataFromDAG(message);
            case appStrings.WORKER_TASK_CLEAR_CACHE_ENTRY:
                return this._clearCacheEntry(message);
            default:
                return WebWorkerCore.prototype.handleMessage.call(this, message, workerRef);
        }
    }

    _retrieveRemoteData(eventData) {
        return new Promise((resolve, reject) => {
            let options = eventData.options;
            let url = options.url;

            // check if we've retrieved this data before
            if (!options.force && typeof this._remoteData[url] !== "undefined") {
                resolve("success");
            } else {
                console.time("fetching");
                MiscUtil.asyncFetch({
                    url: url,
                    handleAs: appStringsCore.FILE_TYPE_JSON,
                }).then(
                    (data) => {
                        console.timeEnd("fetching");

                        let dataArr = options.formatColumns
                            ? data.data.map((row) => {
                                  return data.meta.columns.reduce((acc, col, i) => {
                                      acc[col] = row[i];
                                      return acc;
                                  }, {});
                              })
                            : data;

                        this._remoteData[url] = { data: dataArr, meta: data.meta };

                        if (options.processMeta) {
                            this._processExtremes({ url });
                        }

                        resolve("success");
                    },
                    (err) => reject(err)
                );
            }
        });
    }

    _clearCacheEntry(eventData) {
        return new Promise((resolve, reject) => {
            try {
                if (typeof eventData.url !== "undefined") {
                    this._remoteData[eventData.url] = undefined;
                }
                resolve("success");
            } catch (err) {
                reject(err);
            }
        });
    }

    _processExtremes(options) {
        let { url, dataRows, keys, readKeys, readFuncs } = options;

        dataRows = dataRows || this._remoteData[url].data;
        keys = keys || this._remoteData[url].meta.columns;

        // seed the extremes
        let extremes = keys.reduce((acc, key) => {
            acc[key] = { min: Number.MAX_VALUE, max: -Number.MAX_VALUE };
            return acc;
        }, {});

        // get the read functions
        readFuncs =
            readFuncs ||
            keys.reduce((acc, key, i) => {
                acc[key] = this._getReadFuncForKey(key, readKeys ? readKeys[i] : undefined);
                return acc;
            }, {});

        // find the min/max for each key
        extremes = dataRows.reduce((acc, row) => {
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let keyVal = readFuncs[key](row);
                acc[key].min = Math.min(acc[key].min, keyVal);
                acc[key].max = Math.max(acc[key].max, keyVal);
            }
            return acc;
        }, extremes);

        this._remoteData[url].meta.extremes = extremes;
    }

    _formatDataFromDAG(eventData) {
        return new Promise((resolve, reject) => {
            let dagData = eventData.data
                ? eventData.data
                : eventData.url
                ? this._remoteData[eventData.url].data
                : [];

            let chartDataObj = dagData.result.chart.find((x) => x.type === "xy_line_point");
            if (!!!chartDataObj) {
                // if we don't find an xy plot, assume its a set of histogram plot info just marge them together
                // TODO - need to get better format
                chartDataObj = dagData.result.chart.reduce((acc, obj) => {
                    return Object.assign(acc, obj);
                }, {});
            }

            let xySeriesData = chartDataObj.xySeries_data;
            let xFunc = this._getReadFuncForKey(chartDataObj.xAxis_units, 0);
            let yFunc = this._getReadFuncForKey(chartDataObj.yAxis_units, 1);

            let data = this._transformRowData(xySeriesData, eventData.format, xFunc, yFunc);

            const columns = [chartDataObj.xAxis_label, chartDataObj.yAxis_label];
            this._remoteData[eventData.url].meta = {
                columns,
                dec_size: data.length,
                sub_size: data.length,
                dag_output: chartDataObj,
            };
            this._processExtremes({
                url: eventData.url,
                dataRows: data,
                keys: columns,
                readKeys: [0, 1],
                readFuncs: { [columns[0]]: xFunc, [columns[1]]: yFunc },
            });

            resolve({ data, meta: this._remoteData[eventData.url].meta });
        });
    }

    _decimateLTTB(eventData) {
        return new Promise((resolve, reject) => {
            let dataRows = eventData.dataRows
                ? eventData.dataRows
                : eventData.url
                ? this._remoteData[eventData.url].data
                : [];
            let xFunc = this._getReadFuncForKey(eventData.keys.xKey);
            let yFunc = this._getReadFuncForKey(eventData.keys.yKey);
            let zFunc = this._getReadFuncForKey(eventData.keys.zKey);
            let target = eventData.target || NO_DECIMATION_TARGET;
            let range = eventData.xRange || [];
            if (range && range.length == 2) {
                let startIndex = Math.max(
                    this._binaryIndexOf(dataRows, range[0], (index) => {
                        return xFunc(dataRows[index]);
                    }),
                    0
                );
                let endIndex = Math.min(
                    this._binaryIndexOf(dataRows, range[1], (index) => {
                        return xFunc(dataRows[index]);
                    }),
                    dataRows.length
                );
                dataRows = dataRows.slice(startIndex, endIndex);
            }

            // Create the sampler
            const sampler = largestTriangleThreeBucket();

            // Configure the x / y value accessors
            sampler.x(xFunc).y(yFunc);

            let decData = dataRows;
            if (target !== NO_DECIMATION_TARGET) {
                // attempt to find a good bucket number
                let buckets = 1;
                if (target <= 1) {
                    // assume target is percentage
                    let numRows = dataRows.length;
                    target = numRows * target;
                    if (numRows > target) {
                        buckets = Math.round(numRows / target);
                    }
                } else {
                    // assume target is actual count
                    let numRows = dataRows.length;
                    if (numRows > target) {
                        buckets = Math.round(numRows / target);
                    }
                }

                // Configure the size of the buckets used to downsample the data.
                sampler.bucketSize(buckets);

                // Run the sampler
                decData = sampler(dataRows);
            }

            // format the downsampled data
            let data = this._transformRowData(decData, eventData.format, xFunc, yFunc, zFunc);

            resolve({ data, meta: this._remoteData[eventData.url].meta });
        });
    }

    _transformRowData(rowData, format, xFunc, yFunc, zFunc = undefined) {
        if (typeof zFunc !== "undefined") {
            return rowData.map((entry) => {
                if (format === "array") {
                    return [xFunc(entry), yFunc(entry), zFunc(entry)];
                } else {
                    return {
                        x: xFunc(entry),
                        y: yFunc(entry),
                        z: zFunc(entry),
                    };
                }
            });
        } else {
            return rowData.map((entry) => {
                if (format === "array") {
                    return [xFunc(entry), yFunc(entry)];
                } else {
                    return {
                        x: xFunc(entry),
                        y: yFunc(entry),
                    };
                }
            });
        }
    }

    _getReadFuncForKey(key, readKey) {
        if (typeof key === "undefined") {
            return undefined;
        }

        switch (key.toLowerCase()) {
            case "time":
            // falls through
            case "datetime":
            // falls through
            case "date_time":
            // falls through
            case "measurement_date_time":
            // falls through
            case "position_date_time":
                return this._readTime(key, readKey);
            default:
                return this._readFloat(key, readKey);
        }
    }

    _readTime(key, readKey) {
        readKey = typeof readKey === "undefined" ? key : readKey;
        return (entry) => {
            let time = Date.parse(entry[readKey]);
            if (isNaN(time)) {
                time = parseFloat(entry[readKey]);
                if (Math.floor(Math.log10(time)) <= 9) {
                    time *= 1000;
                }
            }
            return time;
        };
    }

    _readFloat(key, readKey) {
        readKey = typeof readKey === "undefined" ? key : readKey;
        return (entry) => {
            return parseFloat(entry[readKey]);
        };
    }

    _binaryIndexOf(arr, searchElement, readFunc) {
        let minIndex = 0;
        let maxIndex = arr.length - 1;
        let currentIndex = 0;
        let currentElement = null;

        while (minIndex <= maxIndex) {
            currentIndex = ((minIndex + maxIndex) / 2) | 0;
            currentElement = readFunc(currentIndex);

            if (currentElement < searchElement) {
                minIndex = currentIndex + 1;
            } else if (currentElement > searchElement) {
                maxIndex = currentIndex - 1;
            } else {
                return currentIndex;
            }
        }

        // if we cannot find the actual value, return the nearest
        console.warn("Could not find value: " + searchElement + " returning: ", readFunc(minIndex));
        return minIndex;
    }
}
