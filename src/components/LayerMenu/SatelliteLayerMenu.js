/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Colorbar } from "_core/components/Colorbar";
import { SatelliteLayerItem } from "components/LayerMenu";
import * as mapActionsCore from "_core/actions/mapActions";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/LayerMenu/SatelliteLayerMenu.scss";
import displayStyles from "_core/styles/display.scss";

export class SatelliteLayerMenu extends Component {
    renderLayerList(layerList) {
        return layerList.map((layer, i) => (
            <SatelliteLayerItem
                key={`sate_layer_${i}`}
                layer={layer}
                palettes={this.props.palettes}
            />
        ));
    }

    render() {
        let layerList = this.props.layers
            .filter(layer => !layer.get("isDisabled") && layer.get("isActive"))
            .toList()
            .sort(MiscUtil.getImmutableObjectSort("title"));

        let warningClasses = MiscUtil.generateStringFromSet({
            [styles.empty]: true,
            [displayStyles.hidden]: layerList.size > 0
        });

        return (
            <Paper elevation={2} className={styles.root}>
                <Grid container className={styles.header} alignItems="center">
                    <Grid item xs={12}>
                        <Typography variant="body2" color="inherit" className={styles.title}>
                            Satellite Datasets
                        </Typography>
                    </Grid>
                </Grid>
                <div className={styles.listWrapper}>
                    {this.renderLayerList(layerList)}
                    <Typography variant="caption" color="inherit" className={warningClasses}>
                        None Selected
                    </Typography>
                </div>
            </Paper>
        );
    }
}

SatelliteLayerMenu.propTypes = {
    layers: PropTypes.object.isRequired,
    palettes: PropTypes.object.isRequired,
    mapActionsCore: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        layers: state.map.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_DATA]),
        palettes: state.map.get("palettes")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActionsCore: bindActionCreators(mapActionsCore, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SatelliteLayerMenu);
