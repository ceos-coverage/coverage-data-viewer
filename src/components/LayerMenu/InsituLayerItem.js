import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import RemoveIcon from "material-ui-icons/Close";
import TargetIcon from "mdi-material-ui/Target";
import Typography from "material-ui/Typography";
import MiscUtil from "utils/MiscUtil";
import { IconButtonSmall } from "_core/components/Reusables";
import { SingleColorSelector } from "components/Reusables";
import appConfig from "constants/appConfig";
import * as mapActions from "actions/mapActions";
import * as mapActionsCore from "_core/actions/mapActions";
import * as appStrings from "constants/appStrings";
import styles from "components/LayerMenu/InsituLayerItem.scss";

export class InsituLayerItem extends Component {
    render() {
        return (
            <div key={this.props.layer.get("id") + "-insitu-menu-item"} className={styles.root}>
                <SingleColorSelector
                    color={this.props.layer.get("vectorColor")}
                    className={styles.color}
                    onSelect={colorStr =>
                        this.props.mapActions.setInsituLayerColor(
                            this.props.layer.get("id"),
                            colorStr
                        )
                    }
                />
                <Typography
                    variant="body1"
                    color="inherit"
                    component="span"
                    className={styles.label}
                >
                    {this.props.layer.get("title")}
                </Typography>
                <IconButtonSmall
                    color="inherit"
                    className={styles.actionBtn}
                    onClick={() => this.props.mapActions.zoomToLayer(this.props.layer.get("id"))}
                >
                    <TargetIcon />
                </IconButtonSmall>
                <IconButtonSmall
                    color="inherit"
                    className={styles.actionBtn}
                    onClick={() =>
                        this.props.mapActionsCore.setLayerActive(this.props.layer.get("id"), false)
                    }
                >
                    <RemoveIcon />
                </IconButtonSmall>
            </div>
        );
    }
}

InsituLayerItem.propTypes = {
    layer: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    mapActionsCore: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsCore: bindActionCreators(mapActionsCore, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(InsituLayerItem);
