import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { InsituLayerItem } from "components/LayerMenu";
import * as mapActions from "actions/mapActions";
import * as appStrings from "constants/appStrings";
import MiscUtil from "utils/MiscUtil";
import styles from "components/LayerMenu/InsituLayerMenu.scss";

export class InsituLayerMenu extends Component {
    renderLayerList(layerList) {
        return layerList.map(layer => {
            return <InsituLayerItem key={layer.get("id") + "-insitu-menu-item"} layer={layer} />;
        });
    }

    render() {
        let layerList = this.props.layers
            .filter(layer => !layer.get("isDisabled") && layer.get("isActive"))
            .toList()
            .sort(MiscUtil.getImmutableObjectSort("title"));

        let listClasses = MiscUtil.generateStringFromSet({
            "insitu-list": true,
            hidden: layerList.size === 0
        });
        let warningClasses = MiscUtil.generateStringFromSet({
            "no-layers-warning": true,
            hidden: layerList.size > 0
        });
        return (
            <div className={styles.root}>
                <div className="title">In-Situ Datasets</div>
                <div className="intsitu-list-wrapper">
                    <div className={listClasses}>{this.renderLayerList(layerList)}</div>
                    <div className={warningClasses}>None Selected</div>
                </div>
            </div>
        );
    }
}

InsituLayerMenu.propTypes = {
    layers: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        layers: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InsituLayerMenu);
