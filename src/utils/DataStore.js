import * as appStrings from "constants/appStrings";
import WorkerManger from "_core/utils/WorkerManager";

/**
 * Thin wrapper around the woker manager interface. Provides
 * a simple api for retrieving subsets of remote point data
 *
 * @export
 * @class DataStore
 */
export default class DataStore {
    /**
     * Creates an instance of DataStore.
     * @param {any} options {workerManager: optional worker manager instance to use}
     * @memberof DataStore
     */
    constructor(options) {
        this._workerManager = options.workerManager;
        if (typeof this._workerManager === "undefined") {
            this._workerManager = new WorkerManger(1);
        }
    }
    /**
     * retrieve data via a worker thread
     *
     * @param {object} fetchOptions {url, force, processMeta} options for the worker for fetching the remote data
     * @param {any} decimateOptions {format, xRange, target} options for the worker to decimate the retrieved data
     * @returns
     * @memberof DataStore
     */
    getData(fetchOptions, decimateOptions) {
        return new Promise((resolve, reject) => {
            try {
                this._workerManager
                    .queueJob({
                        operation: appStrings.WORKER_TASK_RETRIEVE_DATA,
                        options: fetchOptions
                    })
                    .then(
                        result => {
                            this._workerManager
                                .queueJob({
                                    operation: appStrings.WORKER_TASK_DECIMATE_POINTS_LTTB,
                                    url: fetchOptions.url,
                                    keys: decimateOptions.keys,
                                    format: decimateOptions.format,
                                    xRange: decimateOptions.xRange,
                                    target: decimateOptions.target
                                })
                                .then(
                                    result => {
                                        resolve(result.data);
                                    },
                                    err => {
                                        console.warn("ERROR in DataStore.getData: ", err);
                                        reject(err);
                                    }
                                );
                        },
                        err => {
                            console.warn("ERROR in DataStore.getData: ", err);
                            reject(err);
                        }
                    );
            } catch (err) {
                reject(err);
            }
        });
    }
}