/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";
import TodayIcon from "@material-ui/icons/Today";
import ArrowForward from "@material-ui/icons/ArrowForward";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DatePicker from "react-datepicker";
import { SearchInput } from "components/Reusables";
import MiscUtil from "utils/MiscUtil";
import appConfig from "constants/appConfig";
import "react-datepicker/dist/react-datepicker.css";
import styles from "components/Reusables/DateRangePicker.scss";

export class LayerSearchForm extends Component {
    constructor(props) {
        super(props);

        this.popoverOpen = false;
        this.selectsStart = true;
    }

    handleDatePickerUpdate(value) {
        const date = moment(value);
        if (typeof this.props.onUpdate === "function") {
            if (this.selectsStart) {
                let endDate = date.isAfter(moment.utc(this.props.endDate))
                    ? date.toDate()
                    : this.props.endDate;
                this.props.onUpdate(date.toDate(), endDate);
                this.toggleSelectStartEnd();
            } else {
                let startDate = date.isBefore(moment.utc(this.props.startDate))
                    ? date.toDate()
                    : this.props.startDate;
                this.props.onUpdate(startDate, date.toDate());
                this.handleClose();
            }
        }
    }

    toggleSelectStartEnd() {
        this.selectsStart = !this.selectsStart;
        this.forceUpdate();
    }

    handleOpen() {
        this.selectsStart = true;
        this.popoverOpen = true;
        this.forceUpdate();
    }

    handleClose() {
        this.popoverOpen = false;
        this.forceUpdate();
    }

    renderDateRange(start, end) {
        let startClass = MiscUtil.generateStringFromSet({
            [styles.dateStr]: true,
            [styles.activeDate]: this.popoverOpen && this.selectsStart,
        });
        let endClass = MiscUtil.generateStringFromSet({
            [styles.dateStr]: true,
            [styles.activeDate]: this.popoverOpen && !this.selectsStart,
        });
        return (
            <div className={styles.dateRange}>
                <span className={startClass}>{start.format("MMM DD, YYYY")}</span>
                <ArrowForward />
                <span className={endClass}>{end.format("MMM DD, YYYY")}</span>
            </div>
        );
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [this.props.className]: typeof this.props.className !== "undefined",
        });

        let startDate = moment.utc(this.props.startDate);
        let endDate = moment.utc(this.props.endDate);

        return (
            <SearchInput
                label={this.renderDateRange(startDate, endDate)}
                placeholder="placeholder"
                open={this.popoverOpen}
                onOpen={() => this.handleOpen()}
                onClose={() => this.handleClose()}
                className={containerClasses}
                leftAction={{
                    icon: <TodayIcon />,
                }}
            >
                <DatePicker
                    inline
                    fixedHeight
                    showMonthDropdown
                    showYearDropdown
                    disabledKeyboardNavigation
                    dropdownMode="select"
                    minDate={moment.utc(appConfig.MIN_DATE).toDate()}
                    maxDate={moment.utc(appConfig.MAX_DATE).toDate()}
                    selectsStart={this.selectsStart}
                    selectsEnd={!this.selectsStart}
                    selected={this.selectsStart ? startDate.toDate() : endDate.toDate()}
                    startDate={startDate.toDate()}
                    endDate={endDate.toDate()}
                    onSelect={(value) => this.handleDatePickerUpdate(value)}
                />
                <div className={styles.footer}>
                    <Typography variant="caption" className={styles.footerText}>
                        select{" "}
                        <span className={styles.target}>{this.selectsStart ? "START" : "END"}</span>{" "}
                        date
                    </Typography>
                    <Button
                        variant="text"
                        size="small"
                        color="primary"
                        onClick={() => this.handleClose()}
                    >
                        Done
                    </Button>
                </div>
            </SearchInput>
        );
    }
}

LayerSearchForm.propTypes = {
    startDate: PropTypes.object.isRequired,
    endDate: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
    className: PropTypes.string,
};

export default connect()(LayerSearchForm);
