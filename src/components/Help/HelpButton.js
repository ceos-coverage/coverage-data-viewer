import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { IconButtonSmall } from "_core/components/Reusables";
import * as appActions from "actions/appActions";

export class HelpButton extends Component {
    render() {
        return (
            <IconButtonSmall onClick={() => this.props.setHelpPage(this.props.pageKey)}>
                <HelpOutlineIcon />
            </IconButtonSmall>
        );
    }
}

HelpButton.propTypes = {
    pageKey: PropTypes.string.isRequired,
    setHelpPage: PropTypes.func.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        setHelpPage: bindActionCreators(appActions.setHelpPage, dispatch)
    };
}

export default connect(
    null,
    mapDispatchToProps
)(HelpButton);
