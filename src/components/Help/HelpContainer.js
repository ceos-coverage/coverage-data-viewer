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
import showdown from "showdown";
import Paper from "material-ui/Paper";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import Divider from "material-ui/Divider";
import ListSubheader from "material-ui/List/ListSubheader";
import DescriptionIcon from "material-ui-icons/Description";
import LinkIcon from "material-ui-icons/Link";
import OpenInNewIcon from "material-ui-icons/OpenInNew";
import Typography from "material-ui/Typography";
import * as appActions from "_core/actions/appActions";
import appConfig from "constants/appConfig";
import { ModalMenu } from "_core/components/ModalMenu";
import { MarkdownPage } from "_core/components/Reusables";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "_core/components/Help/HelpContainer.scss";
import displayStyles from "_core/styles/display.scss";

export class HelpContainer extends Component {
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
                content: cvt.makeHtml(require("default-data/_core_default-data/help/about.md"))
            },
            FAQ: {
                key: "FAQ",
                label: "FAQ",
                content: cvt.makeHtml(require("default-data/_core_default-data/help/faq.md"))
            },
            SYS_REQ: {
                key: "SYS_REQ",
                label: "System Requirements",
                content: cvt.makeHtml(require("default-data/_core_default-data/help/systemReqs.md"))
            }
        };
    }

    render() {
        let pageContent = this.props.helpPage
            ? this.helpPageConfig[this.props.helpPage].content
            : "";
        let listClasses = MiscUtil.generateStringFromSet({
            [styles.menu]: true,
            [displayStyles.hidden]: this.props.helpPage !== "",
            [this.props.className]: typeof this.props.className !== "undefined"
        });
        let pageClasses = MiscUtil.generateStringFromSet({
            [displayStyles.hidden]: this.props.helpPage === ""
        });
        let versionClasses = MiscUtil.generateStringFromSet({
            [styles.versionTagContainer]: true,
            [displayStyles.hidden]: this.props.helpPage !== ""
        });
        return (
            <div>
                <Paper elevation={2} square={true} className={listClasses}>
                    <List>
                        <ListSubheader>General</ListSubheader>
                        <ListItem
                            button
                            onClick={() =>
                                this.props.appActions.selectHelpPage(this.helpPageConfig.ABOUT.key)
                            }
                        >
                            <ListItemIcon>
                                <DescriptionIcon />
                            </ListItemIcon>
                            <ListItemText inset primary={this.helpPageConfig.ABOUT.label} />
                        </ListItem>
                        <ListItem
                            button
                            onClick={() =>
                                this.props.appActions.selectHelpPage(this.helpPageConfig.FAQ.key)
                            }
                        >
                            <ListItemIcon>
                                <DescriptionIcon />
                            </ListItemIcon>
                            <ListItemText inset primary={this.helpPageConfig.FAQ.label} />
                        </ListItem>
                        <ListItem
                            button
                            onClick={() =>
                                this.props.appActions.selectHelpPage(
                                    this.helpPageConfig.SYS_REQ.key
                                )
                            }
                        >
                            <ListItemIcon>
                                <DescriptionIcon />
                            </ListItemIcon>
                            <ListItemText inset primary={this.helpPageConfig.SYS_REQ.label} />
                        </ListItem>
                        <Divider />
                        <ListSubheader>Get More Help</ListSubheader>
                        <ListItem
                            button
                            onClick={() => {
                                MiscUtil.openLinkInNewTab(
                                    "https://github.com/nasa/common-mapping-client"
                                );
                            }}
                        >
                            <ListItemIcon>
                                <LinkIcon />
                            </ListItemIcon>
                            <ListItemText inset primary="View Source Code" />
                        </ListItem>
                    </List>
                </Paper>
                <MarkdownPage className={pageClasses} content={pageContent} converted={true} />
                <div className={versionClasses}>
                    <Typography align="right" variant="caption">
                        Version: {appConfig.APP_VERSION}
                    </Typography>
                </div>
            </div>
        );
    }
}

HelpContainer.propTypes = {
    appActions: PropTypes.object.isRequired,
    helpOpen: PropTypes.bool.isRequired,
    helpPage: PropTypes.string.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        helpOpen: state.help.get("isOpen"),
        helpPage: state.help.get("helpPage")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HelpContainer);
