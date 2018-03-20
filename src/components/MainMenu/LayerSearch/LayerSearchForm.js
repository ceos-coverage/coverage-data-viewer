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
import { LabelPopover, SearchInput, AreaSelectionForm } from "components/Reusables";
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
                    <AreaSelectionForm />
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
                <div className={styles.facetRow}>
                    <LabelPopover label="Sensor" subtitle="Any" className={styles.facet}>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a303" />}
                                label="Animal Tag X3K"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Buoy 44Z"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Ship Sensor Line"
                            />
                        </FormGroup>
                    </LabelPopover>
                    <LabelPopover label="Provider" subtitle="2 Selected" className={styles.facet}>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={true} value="tuna_a303" />}
                                label="PO.DAAC"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Provider Name"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={true} value="tuna_a304" />}
                                label="SPURS"
                            />
                        </FormGroup>
                    </LabelPopover>
                    <LabelPopover label="Variable" subtitle="Any" className={styles.facet}>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="depth"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a303" />}
                                label="ext_temp"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a303" />}
                                label="light"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="pressure"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="salinity"
                            />
                        </FormGroup>
                    </LabelPopover>
                    <LabelPopover label="Species" subtitle="Tuna" className={styles.facet}>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Buoy"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a303" />}
                                label="Dolphin"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Shark"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Ship"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={true} value="tuna_a303" />}
                                label="Tuna"
                            />
                        </FormGroup>
                    </LabelPopover>
                    <LabelPopover label="Sample Rate" subtitle="Any" className={styles.facet}>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Second"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Minute"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a303" />}
                                label="Hour"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Day"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Week"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a303" />}
                                label="Month"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a303" />}
                                label="Year"
                            />
                        </FormGroup>
                    </LabelPopover>
                </div>
            </Paper>
        );
    }
}

LayerSearchForm.propTypes = {};

export default connect()(LayerSearchForm);
