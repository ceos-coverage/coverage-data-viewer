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
import Button from "material-ui/Button";
import Tabs, { Tab } from "material-ui/Tabs";
import Paper from "material-ui/Paper";
import * as appActions from "actions/appActions";
import styles from "components/MainMenu/MainMenu.scss";

export class MainMenu extends Component {
    render() {
        return (
            <Paper elevation={1} className={styles.root}>
                <Tabs
                    value={this.props.tabIndex}
                    onChange={(evt, value) => this.props.appActions.setMainMenuTabIndex(value)}
                    indicatorColor="primary"
                >
                    <Tab label="Datasets" />
                    <Tab label="Charts" />
                    <Tab label="Options" />
                    <Tab label="Help" />
                </Tabs>
                {this.props.tabIndex === 0 && <div>Datasets</div>}
                {this.props.tabIndex === 1 && <div>Charts</div>}
                {this.props.tabIndex === 2 && <div>Options</div>}
                {this.props.tabIndex === 3 && <div>Help</div>}
            </Paper>
        );
    }
}

MainMenu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    tabIndex: PropTypes.number.isRequired,
    appActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        isOpen: state.view.get("isMainMenuOpen"),
        tabIndex: state.view.get("mainMenuTabIndex")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainMenu);
