import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ListItem, ListItemSecondaryAction, ListItemText } from "material-ui/List";
import InfoIcon from "material-ui-icons/InfoOutline";
import Checkbox from "material-ui/Checkbox";
import IconButton from "material-ui/IconButton";
import * as mapActions from "_core/actions/mapActions";
import MiscUtil from "utils/MiscUtil";

export class LayerSearchResult extends Component {
    render() {
        return (
            <ListItem
                dense
                button
                onClick={() =>
                    this.props.mapActions.setLayerActive(
                        this.props.layer.get("id"),
                        !this.props.layer.get("isActive")
                    )
                }
            >
                <Checkbox
                    color="primary"
                    checked={this.props.layer.get("isActive")}
                    tabIndex={-1}
                    disableRipple
                />
                <ListItemText primary={this.props.layer.get("title")} />
                <ListItemSecondaryAction>
                    <IconButton aria-label="info">
                        <InfoIcon />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        );
    }
}

LayerSearchResult.propTypes = {
    layer: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(LayerSearchResult);
