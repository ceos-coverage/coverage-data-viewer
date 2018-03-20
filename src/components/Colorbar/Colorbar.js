/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import { Colorbar as ColorbarCore } from "_core/components/Colorbar/Colorbar.js";
import styles from "_core/components/Colorbar/Colorbar.scss";

export class Colorbar extends ColorbarCore {
    renderRange() {
        if (this.props.handleAs) {
            return (
                <div className={styles.labelContainer}>
                    <span className={styles.min}>{this.props.displayMin || this.props.min}</span>
                    <span className={styles.max}>{this.props.displayMax || this.props.max}</span>
                    <span className={styles.units}>{this.props.units}</span>
                </div>
            );
        } else {
            return <div />;
        }
    }
}

export default connect()(Colorbar);
