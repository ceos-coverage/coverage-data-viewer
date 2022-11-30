/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import DownloadIcon from "@material-ui/icons/GetApp";
import GraphIcon from "@material-ui/icons/Grain";
import MiscUtil from "_core/utils/MiscUtil";
import * as appActions from "actions/appActions";
import * as subsettingActions from "actions/subsettingActions";
import styles from "_core/components/Reusables/MapToolsMenu.scss";

export class ExtraToolsMenu extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.mapToolsMenu]: true,
            [this.props.className]: typeof this.props.className !== "undefined",
        });
        return (
            <Paper className={containerClasses}>
                <MenuList dense>
                    <MenuItem
                        className={styles.contextMenuItem}
                        onClick={() => {
                            this.props.subsettingActions.setSubsettingOptions({ isOpen: true });
                            this.props.handleRequestClose();
                        }}
                        aria-label="Download Data"
                    >
                        <ListItemIcon classes={{ root: styles.listItemIcon }}>
                            <DownloadIcon />
                        </ListItemIcon>
                        <ListItemText inset primary="Download Data" />
                    </MenuItem>
                    <MenuItem
                        className={styles.contextMenuItem}
                        onClick={() => {
                            this.props.subsettingActions.setSubsettingOptions({ isOpen: false });
                            this.props.handleRequestClose();
                        }}
                        aria-label="CDMS: Advanced Charting"
                    >
                        <ListItemIcon classes={{ root: styles.listItemIcon }}>
                            <GraphIcon />
                        </ListItemIcon>
                        <ListItemText inset primary="CDMS: Advanced Charting" />
                    </MenuItem>
                </MenuList>
            </Paper>
        );
    }
}

ExtraToolsMenu.propTypes = {
    handleRequestClose: PropTypes.func.isRequired,
    appActions: PropTypes.object.isRequired,
    subsettingActions: PropTypes.object.isRequired,
    className: PropTypes.string,
};

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        subsettingActions: bindActionCreators(subsettingActions, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(ExtraToolsMenu);
