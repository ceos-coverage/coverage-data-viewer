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
import Button from "material-ui/Button";
import { LabelPopover } from "components/Reusables";
import styles from "components/Chart/ChartCreateForm.scss";
import * as chartActions from "actions/chartActions";

export class ChartCreateForm extends Component {
    submitChartOptions() {
        // this.props.chartActions.createChart(this.props.formOptions);
        this.props.chartActions.createChart({ xAxis: "Time", yAxis: "Depth", zAxis: "Ext_Temp" });
    }

    render() {
        return (
            <div className={styles.root}>
                <LabelPopover label="Datasets" subtitle="1 Selected" className={styles.chartOption}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={true} value="tuna_a303" />}
                            label="Tuna A303"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={false} value="tuna_a304" />}
                            label="Tuna A304"
                        />
                    </FormGroup>
                </LabelPopover>
                <LabelPopover label="X-Axis" subtitle="Time" className={styles.chartOption}>
                    <FormLabel component="legend">Shared Variables</FormLabel>
                    <FormGroup>
                        <RadioGroup aria-label="xaxis" name="xaxis" value="time">
                            <FormControlLabel value="time" control={<Radio />} label="Time" />
                            <FormControlLabel
                                value="ext_temp"
                                control={<Radio />}
                                label="Ext_Temp"
                            />
                            <FormControlLabel value="Depth" control={<Radio />} label="Depth" />
                        </RadioGroup>
                    </FormGroup>
                    <FormLabel component="legend">Non-Shared Variables</FormLabel>
                    <FormGroup>
                        <Typography variant="body1" component="span">
                            Salinity, Pressure, Light
                        </Typography>
                    </FormGroup>
                </LabelPopover>
                <LabelPopover label="Y-Axis" subtitle="Depth" className={styles.chartOption}>
                    <FormLabel component="legend">Shared Variables</FormLabel>
                    <FormGroup>
                        <RadioGroup aria-label="yaxis" name="yaxis" value="depth">
                            <FormControlLabel value="time" control={<Radio />} label="Time" />
                            <FormControlLabel
                                value="ext_temp"
                                control={<Radio />}
                                label="Ext_Temp"
                            />
                            <FormControlLabel value="depth" control={<Radio />} label="Depth" />
                        </RadioGroup>
                    </FormGroup>
                    <FormLabel component="legend">Non-Shared Variables</FormLabel>
                    <FormGroup>
                        <Typography variant="body1" component="span">
                            Salinity, Pressure, Light
                        </Typography>
                    </FormGroup>
                </LabelPopover>
                <LabelPopover label="Z-Axis" subtitle="Ext_Temp" className={styles.chartOption}>
                    <FormLabel component="legend">Shared Variables</FormLabel>
                    <FormGroup>
                        <RadioGroup aria-label="zaxis" name="zaxis" value="ext_temp">
                            <FormControlLabel value="time" control={<Radio />} label="Time" />
                            <FormControlLabel
                                value="ext_temp"
                                control={<Radio />}
                                label="Ext_Temp"
                            />
                            <FormControlLabel value="Depth" control={<Radio />} label="Depth" />
                        </RadioGroup>
                    </FormGroup>
                    <FormLabel component="legend">Non-Shared Variables</FormLabel>
                    <FormGroup>
                        <Typography variant="body1" component="span">
                            Salinity, Pressure, Light
                        </Typography>
                    </FormGroup>
                </LabelPopover>
                <Button
                    variant="raised"
                    size="small"
                    color="primary"
                    className={styles.createBtn}
                    onClick={() => this.submitChartOptions()}
                >
                    Create Chart
                </Button>
            </div>
        );
    }
}

ChartCreateForm.propTypes = {
    chartActions: PropTypes.object.isRequired,
    formOptions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        formOptions: state.chart.get("formOptions")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        chartActions: bindActionCreators(chartActions, dispatch)
    };
}

// export default connect()(ChartCreateForm);
export default connect(mapStateToProps, mapDispatchToProps)(ChartCreateForm);