/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import {
    SatelliteLayerSearchForm,
    SatelliteLayerSearchList
} from "components/MainMenu/SatelliteLayerSearch";
import styles from "components/MainMenu/SatelliteLayerSearch/SatelliteLayerSearchMenu.scss";

export class SatelliteLayerSearchMenu extends Component {
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.form}>
                    <SatelliteLayerSearchForm />
                </div>
                <div className={styles.list}>
                    <SatelliteLayerSearchList />
                </div>
            </div>
        );
    }
}

export default SatelliteLayerSearchMenu;
