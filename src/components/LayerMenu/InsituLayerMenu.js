import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import { InsituLayerItem } from "components/LayerMenu";
import * as mapActions from "actions/mapActions";
import * as appStrings from "constants/appStrings";
import MiscUtil from "utils/MiscUtil";
import styles from "components/LayerMenu/InsituLayerMenu.scss";
import displayStyles from "_core/styles/display.scss";

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

        let warningClasses = MiscUtil.generateStringFromSet({
            [styles.empty]: true,
            [displayStyles.hidden]: layerList.size > 0
        });
        return (
            <Paper elevation={2} className={styles.root}>
                <Typography variant="body2" color="inherit" className={styles.label}>
                    In-Situ Datasets
                </Typography>
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
