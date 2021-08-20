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
import Tooltip from "@material-ui/core/Tooltip";
import ShareIcon from "@material-ui/icons/Share";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import * as appActions from "actions/appActions";
import MiscUtil from "utils/MiscUtil";
import { MapButton, MarkdownPage } from "_core/components/Reusables";
import styles from "components/Share/ShareControl.scss";

export class ShareControl extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false
        };
    }

    openModal = () => {
        this.setState({ modalOpen: true });
    };

    closeModal = () => {
        this.setState({ modalOpen: false });
    };

    render() {
        const { modalOpen } = this.state;

        let containerClasses = MiscUtil.generateStringFromSet({
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        return (
            <>
                <Tooltip disableFocusListener={true} title="Share" placement="right">
                    <MapButton
                        onClick={this.openModal}
                        aria-label="Help"
                        className={containerClasses}
                    >
                        <ShareIcon />
                    </MapButton>
                </Tooltip>
                {modalOpen ? (
                    <Dialog
                        classes={{ paper: styles.modalRoot }}
                        open={modalOpen}
                        onClose={this.closeModal}
                    >
                        <DialogContent classes={{ root: styles.content }}>boats</DialogContent>
                    </Dialog>
                ) : null}
            </>
        );
    }
}

ShareControl.propTypes = {
    appActions: PropTypes.object.isRequired,
    className: PropTypes.string
};

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(
    null,
    mapDispatchToProps
)(ShareControl);
