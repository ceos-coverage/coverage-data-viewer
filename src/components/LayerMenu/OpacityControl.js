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
import { OpacityIcon } from "components/LayerMenu";
import { LayerOpacityControl } from "_core/components/LayerMenu";
import { IconPopover } from "components/Reusables";
import * as mapActionsCore from "_core/actions/mapActions";
import styles from "components/LayerMenu/OpacityControl.scss";

export class OpacityControl extends Component {
    changeOpacity(value) {
        const { layerId, setLayerOpacity } = this.props;

        let opacity = value / 100.0;
        setLayerOpacity(layerId, opacity);
    }

    render() {
        const { opacity } = this.props;

        const icon = <OpacityIcon opacity={opacity} />;
        return (
            <IconPopover
                icon={icon}
                buttonClass={styles.iconButton}
                contentClass={styles.content}
                tooltip="Opacity"
            >
                <LayerOpacityControl
                    isActive={true}
                    opacity={opacity}
                    onChange={value => this.changeOpacity(value)}
                />
            </IconPopover>
        );
    }
}

OpacityControl.propTypes = {
    layerId: PropTypes.string.isRequired,
    opacity: PropTypes.number.isRequired,
    setLayerOpacity: PropTypes.func.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        setLayerOpacity: bindActionCreators(mapActionsCore.setLayerOpacity, dispatch)
    };
}

export default connect(
    null,
    mapDispatchToProps
)(OpacityControl);
