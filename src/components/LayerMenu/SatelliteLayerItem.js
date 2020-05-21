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
import Typography from "@material-ui/core/Typography";
import RemoveIcon from "@material-ui/icons/Close";
import { IconButtonSmall } from "_core/components/Reusables";
import { Colorbar } from "_core/components/Colorbar";
import * as appActions from "actions/appActions";
import * as mapActions from "actions/mapActions";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/LayerMenu/SatelliteLayerItem.scss";
import displayStyles from "_core/styles/display.scss";

export class SatelliteLayerItem extends Component {
    renderColorbar(layer) {
        const palette = this.props.palettes.get(layer.getIn(["palette", "name"]));
        let colorbarClasses = MiscUtil.generateStringFromSet({
            [styles.colorbarWrapper]: true,
            [displayStyles.hidden]:
                typeof layer === "undefined" || layer.getIn(["palette", "handleAs"]) === ""
        });
        if (layer) {
            return (
                <div className={colorbarClasses}>
                    <Colorbar
                        palette={palette}
                        min={layer.get("min")}
                        max={layer.get("max")}
                        displayMin={layer.getIn(["palette", "min"])}
                        displayMax={layer.getIn(["palette", "max"])}
                        units={layer.get("units")}
                        handleAs={layer.getIn(["palette", "handleAs"])}
                        url={layer.getIn(["palette", "url"])}
                    />
                </div>
            );
        } else {
            return <div className={colorbarClasses} />;
        }
    }

    render() {
        const layer = this.props.layer;

        return (
            <div className={styles.root}>
                <div className={styles.header}>
                    <div className={styles.centerItem}>
                        <Typography
                            variant="body2"
                            color="inherit"
                            component="span"
                            className={styles.label}
                        >
                            {layer.get("title")}
                        </Typography>
                        {this.renderColorbar(layer)}
                    </div>
                    <div className={styles.rightItem}>
                        <IconButtonSmall
                            color="inherit"
                            className={styles.actionBtn}
                            onClick={() =>
                                this.props.appActions.setTrackSelected(
                                    this.props.layer.get("id"),
                                    false
                                )
                            }
                        >
                            <RemoveIcon />
                        </IconButtonSmall>
                    </div>
                </div>
                <div className={styles.footer}>
                    <Typography
                        variant="caption"
                        color="inherit"
                        component="span"
                        className={styles.subtitle}
                    >
                        {layer.getIn(["insituMeta", "program"])}
                    </Typography>
                </div>
            </div>
        );
    }
}

SatelliteLayerItem.propTypes = {
    layer: PropTypes.object.isRequired,
    palettes: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        layers: state.map.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_DATA]),
        palettes: state.map.get("palettes")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        mapActions: bindActionCreators(mapActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SatelliteLayerItem);
