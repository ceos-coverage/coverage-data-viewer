import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import moment from "moment";
import Radio, { RadioGroup } from "material-ui/Radio";
import Checkbox from "material-ui/Checkbox";
import {
    FormLabel,
    FormControl,
    FormGroup,
    FormControlLabel,
    FormHelperText
} from "material-ui/Form";
import Paper from "material-ui/Paper";
import EarthIcon from "material-ui-icons/Public";
import EditIcon from "material-ui-icons/ModeEdit";
import TodayIcon from "material-ui-icons/Today";
import ArrowForward from "material-ui-icons/ArrowForward";
import Typography from "material-ui/Typography";
import { LabelPopover, SearchInput } from "components/Reusables";
import styles from "components/MainMenu/LayerSearch/LayerSearchForm.scss";

export class LayerSearchForm extends Component {
    renderDateRange() {
        let end = moment(new Date());
        let start = end.subtract(2, "months");

        return (
            <div className={styles.dateRange}>
                {start.format("MMM DD, YYYY")}
                <ArrowForward />
                {end.format("MMM DD, YYYY")}
            </div>
        );
    }
    render() {
        return (
            <Paper elevation={3} className={styles.root}>
                <SearchInput
                    label="Select Area"
                    placeholder="placeholder"
                    className={styles.topField}
                    leftAction={{
                        icon: <EarthIcon />
                    }}
                    rightAction={{
                        icon: <EditIcon />,
                        onClick: () => {
                            console.log("BOO");
                        }
                    }}
                >
                    Area selection tool
                </SearchInput>
                <SearchInput
                    label={this.renderDateRange()}
                    placeholder="placeholder"
                    className={styles.topField}
                    leftAction={{
                        icon: <TodayIcon />
                    }}
                >
                    Date selection tool
                </SearchInput>
            </Paper>
        );
    }
}

LayerSearchForm.propTypes = {};

export default connect()(LayerSearchForm);
