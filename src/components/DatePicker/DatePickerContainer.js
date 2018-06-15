/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import VideoIcon from "@material-ui/icons/Videocam";
import RightIcon from "mdi-material-ui/MenuRight";
import LeftIcon from "mdi-material-ui/MenuLeft";
import { IconButtonSmall } from "_core/components/Reusables";
import Tooltip from "@material-ui/core/Tooltip";
import * as mapActions from "actions/mapActions";
import * as mapActionsCore from "_core/actions/mapActions";
import { DatePicker, DateIntervalPicker } from "components/DatePicker";
import MiscUtil from "_core/utils/MiscUtil";
import stylesCore from "_core/components/DatePicker/DatePickerContainer.scss";
import styles from "components/DatePicker/DatePickerContainer.scss";
import displayStyles from "_core/styles/display.scss";

export class DatePickerContainer extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [stylesCore.datePickerContainer]: true,
            [displayStyles.hiddenFadeOut]: this.props.distractionFreeMode,
            [displayStyles.hiddenFadeIn]: !this.props.distractionFreeMode,
            [this.props.className]: typeof this.props.className !== "undefined"
        });
        return (
            <div className={containerClasses}>
                <DatePicker
                    date={this.props.date}
                    setDate={this.props.mapActionsCore.setDate}
                    className={styles.picker}
                />
                <div className={styles.btns}>
                    <Tooltip title="Step Back" placement="top">
                        <IconButtonSmall
                            className={styles.thinBtn}
                            onClick={() => this.props.mapActions.stepDate(false)}
                        >
                            <LeftIcon />
                        </IconButtonSmall>
                    </Tooltip>
                    <Tooltip title="Step Forward" placement="top">
                        <IconButtonSmall
                            className={styles.thinBtn}
                            onClick={() => this.props.mapActions.stepDate(true)}
                        >
                            <RightIcon />
                        </IconButtonSmall>
                    </Tooltip>
                    <DateIntervalPicker />
                    <Tooltip title="Animation" placement="top">
                        <IconButtonSmall>
                            <VideoIcon />
                        </IconButtonSmall>
                    </Tooltip>
                </div>
            </div>
        );
    }
}

DatePickerContainer.propTypes = {
    date: PropTypes.object.isRequired,
    distractionFreeMode: PropTypes.bool.isRequired,
    mapActions: PropTypes.object.isRequired,
    mapActionsCore: PropTypes.object.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        date: state.map.get("date"),
        distractionFreeMode: state.view.get("distractionFreeMode")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
        mapActionsCore: bindActionCreators(mapActionsCore, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DatePickerContainer);
