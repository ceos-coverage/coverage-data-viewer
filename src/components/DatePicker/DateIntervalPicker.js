/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import StepIcon from "mdi-material-ui/DebugStepOver";
import Typography from "@material-ui/core/Typography";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import { IconPopover } from "components/Reusables";
import * as mapActions from "actions/mapActions";
import appConfig from "constants/appConfig";
import styles from "components/DatePicker/DateIntervalPicker.scss";

export class DateIntervalPicker extends Component {
    handleIntervalSelect(valueStr) {
        if (typeof valueStr !== "undefined") {
            let pieces = valueStr.split("/");
            this.props.mapActions.setDateInterval(parseInt(pieces[0]), pieces[1]);
        }
    }
    render() {
        return (
            <IconPopover
                icon={<StepIcon />}
                className={styles.root}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right"
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                contentClass={styles.content}
            >
                <div className={styles.list}>
                    <Typography variant="subheading" className={styles.subheader}>
                        Date Interval
                    </Typography>
                    <FormGroup className={styles.form}>
                        <RadioGroup
                            aria-label="search_list_sort"
                            name="search_list_sort"
                            value={this.props.dateIntervalSize + "/" + this.props.dateIntervalScale}
                            onChange={(evt, val) => this.handleIntervalSelect(val)}
                            onClick={evt => this.handleIntervalSelect(evt.target.value)}
                        >
                            {appConfig.DATE_INTERVALS.map(entry => (
                                <FormControlLabel
                                    key={"interval_" + entry.size + entry.scale}
                                    value={entry.size + "/" + entry.scale}
                                    control={<Radio color="primary" />}
                                    className={styles.intervalOption}
                                    label={entry.size + "/" + entry.scale}
                                />
                            ))}
                        </RadioGroup>
                    </FormGroup>
                </div>
            </IconPopover>
        );
    }
}

DateIntervalPicker.propTypes = {
    dateIntervalSize: PropTypes.number.isRequired,
    dateIntervalScale: PropTypes.string.isRequired,
    mapActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        dateIntervalSize: state.map.get("dateIntervalSize"),
        dateIntervalScale: state.map.get("dateIntervalScale")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DateIntervalPicker);
