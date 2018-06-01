import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import { ListItem, ListItemSecondaryAction, ListItemText } from "material-ui/List";
import InfoIcon from "material-ui-icons/InfoOutline";
import Checkbox from "material-ui/Checkbox";
import IconButton from "material-ui/IconButton";
import * as appActions from "actions/appActions";

export class LayerSearchResult extends Component {
    handleSelect() {
        if (typeof this.props.onSelect === "function") {
            this.props.onSelect(this.props.layer.get("id"), !this.props.selected);
        }
    }
    render() {
        let startStr = moment
            .unix(this.props.layer.getIn(["insituMeta", "start_date"]))
            .utc()
            .format("MMM DD, YYYY");
        let endStr = moment
            .unix(this.props.layer.getIn(["insituMeta", "end_date"]))
            .utc()
            .format("MMM DD, YYYY");
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
                    secondary={startStr + " – " + endStr}
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

export default connect(null, mapDispatchToProps)(LayerSearchResult);
