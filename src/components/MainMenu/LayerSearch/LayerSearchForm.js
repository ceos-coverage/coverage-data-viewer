import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Radio, { RadioGroup } from "material-ui/Radio";
import Checkbox from "material-ui/Checkbox";
import {
    FormLabel,
    FormControl,
    FormGroup,
    FormControlLabel,
    FormHelperText
} from "material-ui/Form";
import Typography from "material-ui/Typography";
import { LabelPopover, SearchInput } from "components/Reusables";
import styles from "components/MainMenu/LayerSearch/LayerSearchForm.scss";

export class LayerSearchForm extends Component {
    render() {
        return (
            <div className={styles.root}>
                <SearchInput label="Select Area" placeholder="placeholder">
                    Area Selection tool
                </SearchInput>
                <SearchInput label="Select time" placeholder="placeholder">
                    Time Selection tool
                </SearchInput>
            </div>
        );
    }
}

LayerSearchForm.propTypes = {};

export default connect()(LayerSearchForm);
