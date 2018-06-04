import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Immutable from "immutable";
import { InputLabel } from "material-ui/Input";
import { MenuItem } from "material-ui/Menu";
import Select from "material-ui/Select";
import { FormControl, FormGroup } from "material-ui/Form";
import Grid from "material-ui/Grid";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";
import Typography from "material-ui/Typography";
import Paper from "material-ui/Paper";
import Divider from "material-ui/Divider";
import ClickAwayListener from "material-ui/utils/ClickAwayListener";
import Slide from "material-ui/transitions/Slide";
import appConfig from "constants/appConfig";
import * as chartActions from "actions/chartActions";
import MiscUtil from "utils/MiscUtil";
import { Checkbox } from "components/Reusables";
import styles from "components/Chart/ChartSettings.scss";

export class ChartSettings extends Component {
    constructor(props) {
        super(props);

        this.displayOptions = Immutable.Map();
        this.updateTimeout = undefined;
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.displayOptions.get("isOpen") && this.props.displayOptions.get("isOpen")) {
            this.displayOptions = Immutable.Map();
        }
    }

    bufferDisplayOptionsUpdate(options) {
        this.displayOptions = this.displayOptions.mergeDeep(options);
        if (typeof this.updateTimeout !== "undefined") {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = undefined;
        }
        this.updateTimeout = setTimeout(() => {
            this.props.chartActions.setChartDisplayOptions(
                this.props.chartId,
                this.displayOptions.toJS()
            );

            if (typeof this.displayOptions.get("decimationRate") !== "undefined") {
                this.props.chartActions.refreshChart(this.props.chartId);
            }
            this.displayOptions = this.displayOptions.clear();
            clearTimeout(this.updateTimeout);
            this.updateTimeout = undefined;
        }, 500);
    }

    closeSettings() {
        if (this.props.displayOptions.get("isOpen")) {
            this.props.chartActions.setChartDisplayOptions(this.props.chartId, {
                isOpen: false
            });
        }
    }

    renderZMinMaxInput() {
        if (typeof this.props.formOptions.get("zAxis") !== "undefined") {
            return (
                <FormGroup className={styles.formMargin}>
                    <Typography variant="caption">Set Z-Axis Bounds</Typography>
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item xs={2}>
                            <Checkbox
                                color="primary"
                                checked={this.props.displayOptions.get("useCustomZAxisBounds")}
                                onChange={checked => {
                                    this.bufferDisplayOptionsUpdate({
                                        useCustomZAxisBounds: checked
                                    });
                                }}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                id="min_bound"
                                defaultValue={this.props.displayOptions
                                    .get("customZMin")
                                    .toString()}
                                disabled={!this.props.displayOptions.get("useCustomZAxisBounds")}
                                label="Z-Axis Min"
                                margin="dense"
                                fullWidth={true}
                                onChange={evt =>
                                    this.bufferDisplayOptionsUpdate({
                                        customZMin: parseFloat(evt.target.value) || 0.0
                                    })
                                }
                                inputProps={{
                                    type: "number"
                                }}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                id="max_bound"
                                defaultValue={this.props.displayOptions
                                    .get("customZMax")
                                    .toString()}
                                disabled={!this.props.displayOptions.get("useCustomZAxisBounds")}
                                label="Z-Axis Max"
                                margin="dense"
                                fullWidth={true}
                                onChange={evt =>
                                    this.bufferDisplayOptionsUpdate({
                                        customZMax: parseFloat(evt.target.value) || 0.0
                                    })
                                }
                                inputProps={{
                                    type: "number"
                                }}
                            />
                        </Grid>
                    </Grid>
                </FormGroup>
            );
        } else {
            return "";
        }
    }

    render() {
        return (
            <Slide direction="left" in={this.props.displayOptions.get("isOpen")}>
                <Paper elevation={2} className={styles.root}>
                    <Paper elevation={0} className={styles.header}>
                        <Typography variant="body2" className={styles.label}>
                            Chart Settings
                        </Typography>
                        <Button
                            size="small"
                            color="primary"
                            className={styles.doneBtn}
                            onClick={() => {
                                this.closeSettings();
                            }}
                        >
                            Done
                        </Button>
                    </Paper>
                    <div className={styles.content}>
                        <FormGroup className={styles.formMargin}>
                            <Typography variant="caption">Set Y-Axis Bounds</Typography>
                            <Grid container alignItems="center">
                                <Grid item xs={2}>
                                    <Checkbox
                                        color="primary"
                                        checked={this.props.displayOptions.get(
                                            "useCustomYAxisBounds"
                                        )}
                                        onChange={checked => {
                                            this.bufferDisplayOptionsUpdate({
                                                useCustomYAxisBounds: checked
                                            });
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        id="min_bound"
                                        defaultValue={this.props.displayOptions
                                            .get("customYMin")
                                            .toString()}
                                        disabled={
                                            !this.props.displayOptions.get("useCustomYAxisBounds")
                                        }
                                        label="Y-Axis Min"
                                        margin="dense"
                                        fullWidth={true}
                                        onChange={evt =>
                                            this.bufferDisplayOptionsUpdate({
                                                customYMin: parseFloat(evt.target.value) || 0.0
                                            })
                                        }
                                        inputProps={{
                                            type: "number"
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        id="max_bound"
                                        defaultValue={this.props.displayOptions
                                            .get("customYMax")
                                            .toString()}
                                        disabled={
                                            !this.props.displayOptions.get("useCustomYAxisBounds")
                                        }
                                        label="Y-Axis Max"
                                        margin="dense"
                                        fullWidth={true}
                                        onChange={evt =>
                                            this.bufferDisplayOptionsUpdate({
                                                customYMax: parseFloat(evt.target.value) || 0.0
                                            })
                                        }
                                        inputProps={{
                                            type: "number"
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </FormGroup>
                        {this.renderZMinMaxInput()}
                        <Divider />
                        <FormGroup>
                            <Checkbox
                                color="primary"
                                label="Invert Y-Axis"
                                checked={this.props.displayOptions.get("yAxisReversed")}
                                onChange={checked => {
                                    this.bufferDisplayOptionsUpdate({
                                        yAxisReversed: checked
                                    });
                                }}
                            />
                        </FormGroup>
                        <Divider />
                        <FormGroup className={styles.formMargin}>
                            <TextField
                                id={this.props.chartId + "_dec_rate"}
                                defaultValue={this.props.displayOptions
                                    .get("decimationRate")
                                    .toString()}
                                label="Decimation Target"
                                margin="dense"
                                fullWidth={true}
                                onChange={evt =>
                                    this.bufferDisplayOptionsUpdate({
                                        decimationRate:
                                            parseFloat(evt.target.value) ||
                                            appConfig.DEFAULT_DECIMATION_RATE
                                    })
                                }
                                inputProps={{
                                    type: "number"
                                }}
                            />
                        </FormGroup>
                        <FormGroup className={styles.formMargin}>
                            <FormControl>
                                <InputLabel htmlFor="markerType">Display Style</InputLabel>
                                <Select
                                    native={true}
                                    value={this.props.displayOptions.get("markerType")}
                                    onChange={evt => {
                                        this.bufferDisplayOptionsUpdate({
                                            markerType: evt.target.value
                                        });
                                    }}
                                    inputProps={{
                                        name: "markerType",
                                        id: "markerType"
                                    }}
                                >
                                    {appConfig.CHART_DISPLAY_TYPES.TIME_SERIES.map((entry, i) => {
                                        return (
                                            <option
                                                key={"chart-display-" + i}
                                                value={entry.value}
                                                tabIndex="-1"
                                            >
                                                {entry.label}
                                            </option>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </FormGroup>
                    </div>
                </Paper>
            </Slide>
        );
    }
}

ChartSettings.propTypes = {
    chartId: PropTypes.string.isRequired,
    displayOptions: PropTypes.object.isRequired,
    formOptions: PropTypes.object.isRequired,
    chartActions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        chartActions: bindActionCreators(chartActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(ChartSettings);
