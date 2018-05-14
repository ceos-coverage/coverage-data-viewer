import React, { Component } from "react";
import PropTypes from "prop-types";
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
        let { label, checked, onChange, color, ...other } = this.props;
        return (
            <FormControlLabel
                control={
                    <CheckboxMui
                        value={checked.toString()}
                        checked={checked}
                        onChange={(evt, checked) => {
                            this.handleChange(checked);
                        }}
                        onClick={evt => {
                            this.handleChange(!(evt.target.value === "true"));
                        }}
                        color={color || "primary"}
                        {...other}
                        tabIndex="-1"
                    />
                }
                label={label}
            />
        );
    }
}

Checkbox.propTypes = {
    checked: PropTypes.bool.isRequired,
    label: PropTypes.string,
    color: PropTypes.string,
    onChange: PropTypes.func
};

export default Checkbox;
