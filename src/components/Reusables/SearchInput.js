import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ButtonBase from "material-ui/ButtonBase";
import Paper from "material-ui/Paper";
import ArrowDropDown from "material-ui-icons/ArrowDropDown";
import Popover from "material-ui/Popover";
import Typography from "material-ui/Typography";
import { IconButtonSmall } from "_core/components/Reusables";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/Reusables/SearchInput.scss";
import displayStyles from "_core/styles/display.scss";

export class LabelPopover extends Component {
    constructor(props) {
        super(props);

        this.popoverOpen = false;
        this.button = undefined;
        this.width = "initial";
    }

    handleClickButton() {
        this.button = findDOMNode(this.button);
        this.popoverOpen = !this.popoverOpen;
        this.forceUpdate();
    }

    handleClose() {
        this.popoverOpen = false;
        this.forceUpdate();
    }

    renderLeftAction() {
        if (typeof this.props.leftAction !== "undefined") {
            let action = this.props.leftAction;
            if (typeof action.onClick !== "undefined") {
                return (
                    <div
                        color="inherit"
                        className={styles.actionBtn}
                        onClick={this.props.leftAction.onClick}
                    >
                        {this.props.leftAction.icon}
                    </div>
                );
            } else {
                return (
                    <div color="inherit" className={styles.actionBtn}>
                        {this.props.leftAction.icon}
                    </div>
                );
            }
        } else {
            return <div className={displayStyles.hidden} />;
        }
    }

    renderRightAction() {
        if (typeof this.props.rightAction !== "undefined") {
            let action = this.props.rightAction;
            if (typeof action.onClick !== "undefined") {
                return (
                    <IconButtonSmall
                        color="inherit"
                        className={styles.actionBtnRight}
                        onClick={this.props.rightAction.onClick}
                    >
                        {this.props.rightAction.icon}
                    </IconButtonSmall>
                );
            } else {
                return (
                    <IconButtonSmall color="inherit" className={styles.actionBtnRight}>
                        {this.props.rightAction.icon}
                    </IconButtonSmall>
                );
            }
        } else {
            return <div className={displayStyles.hidden} />;
        }
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        let btnClasses = MiscUtil.generateStringFromSet({
            [styles.button]: true,
            [styles.padRight]: typeof this.props.rightAction !== "undefined",
            [styles.active]: this.popoverOpen
        });

        // if we've found the width before, use that
        if (typeof this.width !== "number") {
            if (
                typeof this.button !== "undefined" &&
                typeof this.button.getBoundingClientRect === "function"
            ) {
                let dim = this.button.getBoundingClientRect();
                this.width = dim.width;
            }
        }

        return (
            <Paper elevation={this.popoverOpen ? 8 : 0} className={containerClasses}>
                <ButtonBase
                    disableRipple={true}
                    onClick={() => this.handleClickButton()}
                    className={btnClasses}
                    ref={node => {
                        this.button = node;
                    }}
                >
                    {this.renderLeftAction()}
                    <Typography variant="body2" color="inherit" className={styles.label}>
                        {this.props.label}
                    </Typography>
                </ButtonBase>
                {this.renderRightAction()}
                <Popover
                    open={this.popoverOpen}
                    anchorEl={this.button}
                    anchorReference="anchorEl"
                    onClose={() => this.handleClose()}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left"
                    }}
                    PaperProps={{ style: { width: this.width } }}
                    classes={{ paper: styles.content }}
                >
                    {this.props.children}
                </Popover>
            </Paper>
        );
    }
}

LabelPopover.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    placeholder: PropTypes.string,
    leftAction: PropTypes.object,
    rightAction: PropTypes.object,
    error: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.node])
};

export default connect()(LabelPopover);
