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
import showdown from "showdown";
import Tooltip from "@material-ui/core/Tooltip";
import HelpIcon from "@material-ui/icons/Help";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListSubheader from "@material-ui/core/ListSubheader";
import DescriptionIcon from "@material-ui/icons/Description";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import * as appActions from "actions/appActions";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "utils/MiscUtil";
import { MapButton, MarkdownPage } from "_core/components/Reusables";
import mapStylesCore from "_core/components/Map/MapControlsContainer.scss";
import styles from "components/Help/HelpControl.scss";

export class HelpControl extends Component {
    constructor(props) {
        super(props);

        // set up our markdown converter
        let cvt = new showdown.Converter();
        cvt.setFlavor("github");

        // set up our pages config
        this.helpPageConfig = {
            ABOUT: {
                key: "ABOUT",
                label: "About",
                content: cvt.makeHtml(require("default-data/help/about.md"))
            },
            FAQ: {
                key: "FAQ",
                label: "FAQ",
                content: cvt.makeHtml(require("default-data/help/faq.md"))
            }
        };

        this.state = {
            modalOpen: false,
            helpPage: this.helpPageConfig.FAQ.key
        };
    }

    selectHelpPage = page => {
        this.setState({ helpPage: page });
    };

    openModal = () => {
        this.setState({ modalOpen: true });
    };

    closeModal = () => {
        this.setState({ modalOpen: false });
    };

    render() {
        const { modalOpen, helpPage } = this.state;

        let pageContent = helpPage ? this.helpPageConfig[helpPage].content : "";

        let containerClasses = MiscUtil.generateStringFromSet({
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        return (
            <>
                <Tooltip disableFocusListener={true} title="Help" placement="right">
                    <MapButton
                        onClick={this.openModal}
                        aria-label="Help"
                        className={containerClasses}
                    >
                        <HelpIcon />
                    </MapButton>
                </Tooltip>
                {modalOpen ? (
                    <Dialog
                        classes={{ paper: styles.modalRoot }}
                        open={modalOpen}
                        onClose={this.closeModal}
                    >
                        <DialogContent classes={{ root: styles.content }}>
                            <div className={styles.leftContent}>
                                <List>
                                    <ListSubheader>Help</ListSubheader>
                                    <ListItem
                                        button
                                        selected={helpPage === this.helpPageConfig.ABOUT.key}
                                        onClick={() =>
                                            this.selectHelpPage(this.helpPageConfig.ABOUT.key)
                                        }
                                    >
                                        <ListItemIcon>
                                            <DescriptionIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            inset
                                            primary={this.helpPageConfig.ABOUT.label}
                                        />
                                    </ListItem>
                                    <ListItem
                                        button
                                        selected={helpPage === this.helpPageConfig.FAQ.key}
                                        onClick={() =>
                                            this.selectHelpPage(this.helpPageConfig.FAQ.key)
                                        }
                                    >
                                        <ListItemIcon>
                                            <DescriptionIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            inset
                                            primary={this.helpPageConfig.FAQ.label}
                                        />
                                    </ListItem>
                                </List>
                            </div>
                            <div className={styles.rightContent}>
                                <MarkdownPage
                                    content={pageContent}
                                    converted={true}
                                    className={styles.markdown}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : null}
            </>
        );
    }
}

HelpControl.propTypes = {
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
)(HelpControl);
