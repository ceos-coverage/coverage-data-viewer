import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import RemoveIcon from "material-ui-icons/Close";
import TargetIcon from "mdi-material-ui/Target";
import PointErrorIcon from "mdi-material-ui/ImageFilterTiltShift";
import Typography from "material-ui/Typography";
import MiscUtil from "utils/MiscUtil";
import { IconButtonSmall, LoadingSpinner } from "_core/components/Reusables";
import { SingleColorSelector } from "components/Reusables";
import appConfig from "constants/appConfig";
import * as appActions from "actions/appActions";
import * as mapActions from "actions/mapActions";
import * as appStrings from "constants/appStrings";
import styles from "components/LayerMenu/InsituLayerItem.scss";

export class InsituLayerItem extends Component {
    renderLeftAction() {
        if (this.props.layer.get("isLoading")) {
            return <LoadingSpinner className={styles.loader} />;
        } else {
            return (
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
            );
        }
    }
    render() {
        return (
            <div key={this.props.layer.get("id") + "-insitu-menu-item"} className={styles.root}>
                <div className={styles.leftItem}>{this.renderLeftAction()}</div>
                <div className={styles.centerItem}>
                    <Typography
                        variant="body1"
                        color="inherit"
                        component="span"
                        className={styles.label}
                    >
                        {this.props.layer.get("title")}
                    </Typography>
                </div>
                <div className={styles.rightItem}>
                    <IconButtonSmall
                        color="inherit"
                        className={styles.actionBtn}
                        disabled={this.props.layer.get("isLoading")}
                        onClick={() =>
                            this.props.mapActions.zoomToLayer(this.props.layer.get("id"))
                        }
                    >
                        <TargetIcon />
                    </IconButtonSmall>
                    <IconButtonSmall
                        color="inherit"
                        className={styles.actionBtn}
                        disabled={this.props.layer.get("isLoading")}
                        onClick={() =>
                            this.props.mapActions.zoomToLayer(this.props.layer.get("id"))
                        }
                    >
                        <PointErrorIcon />
                    </IconButtonSmall>
                    <IconButtonSmall
                        color="inherit"
                        className={styles.actionBtn}
                        disabled={this.props.layer.get("isLoading")}
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
        );
    }
}

InsituLayerItem.propTypes = {
    layer: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        mapActions: bindActionCreators(mapActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(InsituLayerItem);
