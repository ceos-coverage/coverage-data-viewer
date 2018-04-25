import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Radio, { RadioGroup } from "material-ui/Radio";
import {
    FormLabel,
    FormControl,
    FormGroup,
    FormControlLabel,
    FormHelperText
} from "material-ui/Form";
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import Button from "material-ui/Button";
import { LabelPopover, Checkbox } from "components/Reusables";
import styles from "components/Chart/ChartCreateForm.scss";
import * as chartActions from "actions/chartActions";
import * as appStrings from "constants/appStrings";
import MiscUtil from "utils/MiscUtil";

export class ChartCreateForm extends Component {
    renderTrackList() {
        let trackList = this.props.availableTracks
            .filter(track => !track.get("isDisabled") && track.get("isActive"))
            .toList()
            .sort(MiscUtil.getImmutableObjectSort("title"));

        if (trackList.size > 0) {
            return trackList.map(track => (
                <Checkbox
                    key={track.get("id") + "_chart_checkbox"}
                    label={track.get("title")}
                    checked={this.props.formOptions.get("selectedTracks").includes(track.get("id"))}
                    onChange={isSelected =>
                        this.props.chartActions.setTrackSelected(track.get("id"), isSelected)
                    }
                />
            ));
        } else {
            return "No datasets selected";
        }
    }

    render() {
        return (
            <Paper elevation={3} className={styles.root}>
                <div className={styles.options}>
                    <LabelPopover
                        label="Datasets"
                        subtitle={this.props.formOptions.get("selectedTracks").size + " Selected"}
                        className={styles.chartOption}
                    >
                        <FormGroup>{this.renderTrackList()}</FormGroup>
                    </LabelPopover>
                    <LabelPopover label="X-Axis" subtitle="Time" className={styles.chartOption}>
                        <FormLabel component="legend">Shared Variables</FormLabel>
                        <FormGroup>
                            <RadioGroup aria-label="xaxis" name="xaxis" value="time">
                                <FormControlLabel
                                    value="time"
                                    control={<Radio color="primary" />}
                                    label="Time"
                                />
                                <FormControlLabel
                                    value="ext_temp"
                                    control={<Radio color="primary" />}
                                    label="Ext_Temp"
                                />
                                <FormControlLabel
                                    value="Depth"
                                    control={<Radio color="primary" />}
                                    label="Depth"
                                />
                            </RadioGroup>
                        </FormGroup>
                        <FormLabel component="legend">Non-Shared Variables</FormLabel>
                        <FormGroup>
                            <Typography
                                variant="body1"
                                component="span"
                                className={styles.nonShared}
                            >
                                Salinity, Pressure, Light
                            </Typography>
                        </FormGroup>
                    </LabelPopover>
                    <LabelPopover label="Y-Axis" subtitle="Depth" className={styles.chartOption}>
                        <FormLabel component="legend">Shared Variables</FormLabel>
                        <FormGroup>
                            <RadioGroup aria-label="yaxis" name="yaxis" value="depth">
                                <FormControlLabel
                                    value="time"
                                    control={<Radio color="primary" />}
                                    label="Time"
                                />
                                <FormControlLabel
                                    value="ext_temp"
                                    control={<Radio color="primary" />}
                                    label="Ext_Temp"
                                />
                                <FormControlLabel
                                    value="depth"
                                    control={<Radio color="primary" />}
                                    label="Depth"
                                />
                            </RadioGroup>
                        </FormGroup>
                        <FormLabel component="legend">Non-Shared Variables</FormLabel>
                        <FormGroup>
                            <Typography
                                variant="body1"
                                component="span"
                                className={styles.nonShared}
                            >
                                Salinity, Pressure, Light
                            </Typography>
                        </FormGroup>
                    </LabelPopover>
                    <LabelPopover label="Z-Axis" subtitle="Ext_Temp" className={styles.chartOption}>
                        <FormLabel component="legend">Shared Variables</FormLabel>
                        <FormGroup>
                            <RadioGroup aria-label="zaxis" name="zaxis" value="ext_temp">
                                <FormControlLabel
                                    value="time"
                                    control={<Radio color="primary" />}
                                    label="Time"
                                />
                                <FormControlLabel
                                    value="ext_temp"
                                    control={<Radio color="primary" />}
                                    label="Ext_Temp"
                                />
                                <FormControlLabel
                                    value="Depth"
                                    control={<Radio color="primary" />}
                                    label="Depth"
                                />
                            </RadioGroup>
                        </FormGroup>
                        <FormLabel component="legend">Non-Shared Variables</FormLabel>
                        <FormGroup>
                            <Typography
                                variant="body1"
                                component="span"
                                className={styles.nonShared}
                            >
                                Salinity, Pressure, Light
                            </Typography>
                        </FormGroup>
                    </LabelPopover>
                </div>
                <Button
                    variant="raised"
                    size="small"
                    color="primary"
                    onClick={this.props.chartActions.createChart}
                >
                    Create Chart
                </Button>
            </Paper>
        );
    }
}

ChartCreateForm.propTypes = {
    chartActions: PropTypes.object.isRequired,
    formOptions: PropTypes.object.isRequired,
    availableTracks: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        formOptions: state.chart.get("formOptions"),
        availableTracks: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        chartActions: bindActionCreators(chartActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartCreateForm);
