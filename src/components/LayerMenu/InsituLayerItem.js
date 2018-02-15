import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import IconButton from "material-ui/IconButton";
import MiscUtil from "utils/MiscUtil";
import { LabelPopover } from "components/Reusables";
import appConfig from "constants/appConfig";
import * as mapActions from "actions/mapActions";
import * as mapActionsCore from "_core/actions/mapActions";
import * as appStrings from "constants/appStrings";

export class InsituLayerItem extends Component {
    render() {
        return (
            <div key={this.props.layer.get("id") + "-insitu-menu-item"} className="layer-item">
                <LabelPopover label="" style={{ color: this.props.layer.get("vectorColor") }}>
                    <div className="color-selection-list">
                        {appConfig.INSITU_VECTOR_COLORS.map((colorStr, i) => {
                            return (
                                <div
                                    key={"color-option-" + i}
                                    className={
                                        "layer-color" +
                                        (colorStr === this.props.layer.get("vectorColor")
                                            ? " selected"
                                            : " ")
                                    }
                                    style={{ background: colorStr }}
                                    onClick={() =>
                                        this.props.mapActions.setInsituLayerColor(
                                            this.props.layer.get("id"),
                                            colorStr
                                        )
                                    }
                                />
                            );
                        })}
                    </div>
                </LabelPopover>
                <div className="layer-title">{this.props.layer.get("title")}</div>
                <div className="layer-close">
                    <IconButton
                        icon="close"
                        onClick={() =>
                            this.props.mapActionsCore.setLayerActive(
                                this.props.layer.get("id"),
                                false
                            )
                        }
                    />
                </div>
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
