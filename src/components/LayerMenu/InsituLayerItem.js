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
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import Typography from "@material-ui/core/Typography";
import { IconButtonSmall, EnhancedTooltip, LoadingSpinner } from "_core/components/Reusables";
import { SingleColorSelector } from "components/Reusables";
import { InsituLayerItemTools } from "components/LayerMenu";
import * as appStrings from "constants/appStrings";
import * as appActions from "actions/appActions";
import * as mapActions from "actions/mapActions";
import * as mapActionsCore from "_core/actions/mapActions";
import styles from "components/LayerMenu/InsituLayerItem.scss";
import textStyles from "_core/styles/text.scss";
import MiscUtil from "utils/MiscUtil";

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
        let subtitle =
            this.props.layer.get("title") === this.props.layer.getIn(["insituMeta", "instrument"])
                ? this.props.layer.getIn(["insituMeta", "platform"])
                : this.props.layer.getIn(["insituMeta", "instrument"]);

        let title =
            this.props.layer.get("title").size > 0
                ? this.props.layer.getIn(["title", 0])
                : this.props.layer.get("title");

        subtitle = subtitle.size > 0 ? subtitle.get(0) : subtitle;

        const bubbleLegend =
            this.props.layer.get("handleAs") === appStrings.LAYER_VECTOR_POINTS_WFS;

        const visible = this.props.layer.get("opacity") === 1;
        const visIcon = visible ? <VisibilityIcon /> : <VisibilityOffIcon />;

        const rootClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [styles.visibilityOff]: !visible
        });

        const color = this.props.layer.get("vectorColor");
        const units = this.props.layer.getIn(["insituMeta", "variables_units", 0]);

        return (
            <div key={this.props.layer.get("id") + "-insitu-menu-item"} className={rootClasses}>
                <div className={styles.main}>
                    <div className={styles.leftItem}>{this.renderLeftAction()}</div>
                    <div className={styles.centerItem}>
                        <EnhancedTooltip
                            disableFocusListener={true}
                            title={subtitle}
                            placement="bottom"
                            PopperProps={{
                                modifiers: {
                                    preventOverflow: {
                                        enabled: false
                                    },
                                    hide: {
                                        enabled: false
                                    }
                                }
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="inherit"
                                component="span"
                                className={styles.label}
                            >
                                {`${title} (id: ${this.props.layer.get("shortId")})`}
                            </Typography>
                        </EnhancedTooltip>
                    </div>
                    <div className={styles.rightItem}>
                        <InsituLayerItemTools layer={this.props.layer} />
                        <IconButtonSmall
                            color="inherit"
                            className={styles.actionBtn}
                            disabled={this.props.layer.get("isLoading")}
                            onClick={() =>
                                this.props.setLayerOpacity(this.props.layer, visible ? 0 : 1)
                            }
                        >
                            {visIcon}
                        </IconButtonSmall>
                    </div>
                </div>
                {bubbleLegend ? (
                    <div className={styles.bubbleLegend}>
                        <div className={styles.bubbleWrapper}>
                            <div
                                style={{ background: color }}
                                className={`${styles.bubble} ${styles.bubbleSize1}`}
                            />
                            <div className={`${styles.value} ${textStyles.fontRobotoMono}`}>0</div>
                        </div>
                        <div className={styles.bubbleWrapper}>
                            <div
                                style={{ background: color }}
                                className={`${styles.bubble} ${styles.bubbleSize2}`}
                            />
                            <div className={`${styles.value} ${textStyles.fontRobotoMono}`}>1</div>
                        </div>
                        <div className={styles.bubbleWrapper}>
                            <div
                                style={{ background: color }}
                                className={`${styles.bubble} ${styles.bubbleSize3}`}
                            />
                            <div className={`${styles.value} ${textStyles.fontRobotoMono}`}>
                                3.5
                            </div>
                        </div>
                        <div className={styles.bubbleWrapper}>
                            <div
                                style={{ background: color }}
                                className={`${styles.bubble} ${styles.bubbleSize4}`}
                            />
                            <div className={`${styles.value} ${textStyles.fontRobotoMono}`}>10</div>
                        </div>
                        <div className={styles.bubbleWrapper}>
                            <div
                                style={{ background: color }}
                                className={`${styles.bubble} ${styles.bubbleSize5}`}
                            />
                            <div className={`${styles.value} ${textStyles.fontRobotoMono}`}>20</div>
                        </div>
                        <div className={styles.bubbleWrapper}>
                            <div
                                style={{ background: color }}
                                className={`${styles.bubble} ${styles.bubbleSize6}`}
                            />
                            <div className={`${styles.value} ${textStyles.fontRobotoMono}`}>50</div>
                        </div>
                        <div className={styles.bubbleWrapper}>
                            <div className={`${styles.bubble} ${styles.invisibleBubble}`} />
                            <div className={`${styles.value} ${textStyles.fontRobotoMono}`}>
                                {units}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
}

InsituLayerItem.propTypes = {
    layer: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    setLayerOpacity: PropTypes.func.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        mapActions: bindActionCreators(mapActions, dispatch),
        setLayerOpacity: bindActionCreators(mapActionsCore.setLayerOpacity, dispatch)
    };
}

export default connect(
    null,
    mapDispatchToProps
)(InsituLayerItem);
