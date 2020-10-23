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
import moment from "moment";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import InfoIcon from "mdi-material-ui/InformationOutline";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import * as appActions from "actions/appActions";
import styles from "components/MainMenu/LayerSearch/LayerSearchResult.scss";

export class LayerSearchResult extends Component {
    handleSelect() {
        if (typeof this.props.onSelect === "function") {
            this.props.onSelect(this.props.layer.get("id"), !this.props.selected);
        }
    }
    render() {
        const startStr = moment
            .unix(this.props.layer.getIn(["insituMeta", "start_date"]))
            .utc()
            .format("MMM DD, YYYY");
        const endStr = moment
            .unix(this.props.layer.getIn(["insituMeta", "end_date"]))
            .utc()
            .format("MMM DD, YYYY");

        const secondaryText = (
            <span>
                id: {this.props.layer.get("shortId")} ·{" "}
                {this.props.layer.getIn(["insituMeta", "instrument"])}
                <br />
                {startStr + " – " + endStr}
            </span>
        );

        return (
            <ListItem dense button onClick={() => this.handleSelect()}>
                <Checkbox
                    color="primary"
                    checked={this.props.selected}
                    tabIndex={-1}
                    disableRipple
                />
                <ListItemText
                    primary={this.props.layer.get("title")}
                    secondary={secondaryText}
                    classes={{ primary: styles.title, secondary: styles.subtitle }}
                />
                <ListItemSecondaryAction>
                    <IconButton
                        aria-label="info"
                        onClick={() => this.props.appActions.setLayerInfo(this.props.layer)}
                    >
                        <InfoIcon />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        );
    }
}

LayerSearchResult.propTypes = {
    layer: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    appActions: PropTypes.object.isRequired,
    onSelect: PropTypes.func
};

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(
    null,
    mapDispatchToProps
)(LayerSearchResult);
