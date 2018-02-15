import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import CheckboxMui from "material-ui/Checkbox";
import { FormControlLabel } from "material-ui/Form";
import styles from "components/Chart/ChartSettings.scss";

export class Checkbox extends Component {
    handleChange(checked) {
        if (typeof this.props.onChange === "function") {
            this.props.onChange(checked);
        }
    }
    render() {
        return (
            <FormControlLabel
                control={
                    <CheckboxMui
                        value={this.props.checked.toString()}
                        checked={this.props.checked}
                        onChange={(evt, checked) => {
                            this.handleChange(checked);
                        }}
                        onClick={evt => {
                            this.handleChange(!(evt.target.value === "true"));
                        }}
                        tabIndex="-1"
                    />
                }
                label={this.props.label}
            />
        );
    }
}

Checkbox.propTypes = {
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func
};

export default connect()(Checkbox);
