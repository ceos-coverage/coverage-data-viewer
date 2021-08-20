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
        this.helpPageConfig = [
            {
                label: "About",
                items: [
                    {
                        key: "ABOUT",
                        label: "About",
                        content: cvt.makeHtml(require("default-data/help/about.md"))
                    }
                ]
            },
            {
                label: "Interface",
                items: [
                    {
                        key: "ui-insitu-search",
                        label: "In-Situ Search",
                        content: cvt.makeHtml(require("default-data/help/ui-insitu-search.md"))
                    },
                    {
                        key: "ui-satellite-search",
                        label: "Satellite Search",
                        content: cvt.makeHtml(require("default-data/help/ui-satellite-search.md"))
                    },
                    {
                        key: "ui-insitu-datasets",
                        label: "In-Situ Datasets",
                        content: cvt.makeHtml(require("default-data/help/ui-insitu-datasets.md"))
                    },
                    {
                        key: "ui-satellite-datasets",
                        label: "Satellite Datasets",
                        content: cvt.makeHtml(require("default-data/help/ui-satellite-datasets.md"))
                    },
                    {
                        key: "ui-map-controls",
                        label: "Map Controls",
                        content: cvt.makeHtml(require("default-data/help/ui-map-controls.md"))
                    },
                    {
                        key: "ui-charting",
                        label: "Charting",
                        content: cvt.makeHtml(require("default-data/help/ui-charting.md"))
                    }
                ]
            },
            {
                label: "Search",
                items: [
                    {
                        key: "search-insitu",
                        label: "In-Situ Search",
                        content: cvt.makeHtml(require("default-data/help/search-insitu.md"))
                    },
                    {
                        key: "search-satellite",
                        label: "Satellite Search",
                        content: cvt.makeHtml(require("default-data/help/search-satellite.md"))
                    }
                ]
            },
            {
                label: "Mapping",
                items: [
                    {
                        key: "mapping-general",
                        label: "General Mapping",
                        content: cvt.makeHtml(require("default-data/help/mapping-general.md"))
                    },
                    {
                        key: "mapping-insitu",
                        label: "In-Situ Data",
                        content: cvt.makeHtml(require("default-data/help/mapping-insitu.md"))
                    },
                    {
                        key: "mapping-satellite",
                        label: "Satellite Data",
                        content: cvt.makeHtml(require("default-data/help/mapping-satellite.md"))
                    }
                ]
            },
            {
                label: "Time & Animation",
                items: [
                    {
                        key: "time-current",
                        label: "Current Date",
                        content: cvt.makeHtml(require("default-data/help/time-current.md"))
                    },
                    {
                        key: "time-animation",
                        label: "Animation",
                        content: cvt.makeHtml(require("default-data/help/time-animation.md"))
                    }
                ]
            },
            {
                label: "Charting",
                items: [
                    {
                        key: "charting-create",
                        label: "Creating Charts",
                        content: cvt.makeHtml(require("default-data/help/charting-create.md"))
                    },
                    {
                        key: "charting-usage",
                        label: "Using Charts",
                        content: cvt.makeHtml(require("default-data/help/charting-usage.md"))
                    }
                ]
            }
        ];

        this.state = {
            modalOpen: false,
            helpPage: "ABOUT"
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

    getPage = key => {
        let ret = null;
        this.helpPageConfig.forEach(section => {
            section.items.forEach(item => {
                if (item.key === key) {
                    ret = item;
                }
            });
        });
        return ret;
    };

    render() {
        const { modalOpen, helpPage } = this.state;

        let pageContent = helpPage ? this.getPage(helpPage).content : "";

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
                                <List className={styles.list}>
                                    {this.helpPageConfig.map((section, i) => (
                                        <React.Fragment key={`help_sec_${i}`}>
                                            <ListSubheader>{section.label}</ListSubheader>
                                            {section.items.map((item, j) => (
                                                <ListItem
                                                    key={`help_item_${i}_${j}`}
                                                    button
                                                    selected={helpPage === item.key}
                                                    onClick={() => this.selectHelpPage(item.key)}
                                                >
                                                    <ListItemText inset primary={item.label} />
                                                </ListItem>
                                            ))}
                                        </React.Fragment>
                                    ))}
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
