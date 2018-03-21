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
import {
    LabelPopover,
    SearchInput,
    DateRangePicker,
    AreaSelectionForm
} from "components/Reusables";
import * as appActions from "actions/appActions";
import styles from "components/MainMenu/LayerSearch/LayerSearchForm.scss";

export class LayerSearchForm extends Component {
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
                <DateRangePicker
                    className={styles.topField}
                    startDate={this.props.layerSearch.get("startDate")}
                    endDate={this.props.layerSearch.get("endDate")}
                    onUpdate={this.props.appActions.setSearchDateRange}
                />
                <div className={styles.facetRow}>
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
                    <LabelPopover label="Platform" subtitle="Tuna" className={styles.facet}>
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
                    <LabelPopover label="Project" subtitle="2 Selected" className={styles.facet}>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={true} value="tuna_a303" />}
                                label="PO.DAAC"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={false} value="tuna_a304" />}
                                label="Project Name"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={true} value="tuna_a304" />}
                                label="SPURS"
                            />
                        </FormGroup>
                    </LabelPopover>
                </div>
            </Paper>
        );
    }
}

LayerSearchForm.propTypes = {
    layerSearch: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        layerSearch: state.view.get("layerSearch")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerSearchForm);
