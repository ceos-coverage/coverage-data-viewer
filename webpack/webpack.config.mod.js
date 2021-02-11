/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

"use strict";

// modify this file to add/remove/change
// the cmc-core webpack config

const path = require("path");
const BASE_DIR = path.resolve("./");

module.exports = config => {
    // EXAMPLE: to add a new loader
    /*
    config.module.rules.push({
        test: /\.ts$/,
        use: ["babel-loader", "eslint-loader"]
    });
    */

    config.output.globalObject = "this";

    config.module.rules.push({
        test: /\.json$/,
        type: "javascript/auto",
        exclude: [path.join(BASE_DIR, "node_modules/")],
        use: "raw-loader"
    });

    return config;
};
