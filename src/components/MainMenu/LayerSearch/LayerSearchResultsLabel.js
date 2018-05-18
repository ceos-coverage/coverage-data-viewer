import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Typography } from "material-ui";
import MiscUtil from "utils/MiscUtil";

export class LayerSearchResultsLabel extends Component {
    render() {
        let trackList = this.props.searchResults.get("results");

        let containerClasses = MiscUtil.generateStringFromSet({
            [this.props.className]: typeof this.props.className !== "undefined"
        });
        return (
            <Typography className={containerClasses} variant="body2">
                Track Results ({trackList.size})
            </Typography>
        );
    }
}

LayerSearchResultsLabel.propTypes = {
    className: PropTypes.string,
    searchResults: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        searchResults: state.view.getIn(["layerSearch", "searchResults"])
    };
}

export default connect(mapStateToProps, null)(LayerSearchResultsLabel);
