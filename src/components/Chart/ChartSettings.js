import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { InputLabel } from "material-ui/Input";
import { MenuItem } from "material-ui/Menu";
import Select from "material-ui/Select";
import { FormControl, FormGroup } from "material-ui/Form";
import Button from "material-ui/Button";
import Typography from "material-ui/Typography";
import Paper from "material-ui/Paper";
import ClickAwayListener from "material-ui/utils/ClickAwayListener";
import Slide from "material-ui/transitions/Slide";
import appConfig from "constants/appConfig";
import * as chartActions from "actions/chartActions";
import MiscUtil from "utils/MiscUtil";
import { Checkbox } from "components/Reusables";
import styles from "components/Chart/ChartSettings.scss";

export class ChartSettings extends Component {
    closeSettings() {
        this.props.chartActions.setChartDisplayOptions(this.props.chartId, {
            isOpen: false
        });
    }
    render() {
        return (
            <ClickAwayListener
                onClickAway={() => {
                    this.closeSettings();
                }}
            >
                <Slide direction="left" in={this.props.displayOptions.get("isOpen")}>
                    <Paper elevation={2} className={styles.root}>
                        <Typography variant="subheading" className={styles.label}>
                            Chart Settings
                        </Typography>
                        <div className={styles.content}>
                            <FormGroup className={styles.formGroup}>
                                <FormControl>
                                    <InputLabel htmlFor="markerType">Display Style</InputLabel>
                                    <Select
                                        native={true}
                                        value={this.props.displayOptions.get("markerType")}
                                        onChange={evt => {
                                            this.props.chartActions.setChartDisplayOptions(
                                                this.props.chartId,
                                                {
                                                    markerType: evt.target.value
                                                }
                                            );
                                        }}
                                        inputProps={{
                                            name: "markerType",
                                            id: "markerType"
                                        }}
                                    >
                                        {appConfig.CHART_DISPLAY_TYPES.TIME_SERIES.map(
                                            (entry, i) => {
                                                return (
                                                    <option
                                                        key={"chart-display-" + i}
                                                        value={entry.value}
                                                        tabIndex="-1"
                                                    >
                                                        {entry.label}
                                                    </option>
                                                );
                                            }
                                        )}
                                    </Select>
                                </FormControl>
                            </FormGroup>
                            <FormGroup className={styles.formGroup}>
                                <Checkbox
                                    label="Invert Y-Axis"
                                    checked={this.props.displayOptions.get("yAxisReversed")}
                                    onChange={checked => {
                                        this.props.chartActions.setChartDisplayOptions(
                                            this.props.chartId,
                                            {
                                                yAxisReversed: checked
                                            }
                                        );
                                    }}
                                />
                            </FormGroup>
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
                        </div>
                    </Paper>
                </Slide>
            </ClickAwayListener>
        );
    }
}

ChartSettings.propTypes = {
    chartId: PropTypes.string.isRequired,
    displayOptions: PropTypes.object.isRequired,
    chartActions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        chartActions: bindActionCreators(chartActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(ChartSettings);
