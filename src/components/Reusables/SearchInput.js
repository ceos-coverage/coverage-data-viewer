import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ButtonBase from "material-ui/ButtonBase";
import ArrowDropDown from "material-ui-icons/ArrowDropDown";
import Popover from "material-ui/Popover";
import Typography from "material-ui/Typography";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/Reusables/SearchInput.scss";

export class LabelPopover extends Component {
    constructor(props) {
        super(props);

        this.popoverOpen = false;
        this.button = undefined;
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

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        let btnClasses = MiscUtil.generateStringFromSet({
            [styles.button]: true,
            [styles.active]: this.popoverOpen
        });

        return (
            <div className={containerClasses}>
                <ButtonBase
                    disableRipple={true}
                    onClick={() => this.handleClickButton()}
                    className={btnClasses}
                    ref={node => {
                        this.button = node;
                    }}
                >
                    <Typography variant="body2" color="inherit" className={styles.label}>
                        {this.props.label}
                    </Typography>
                </ButtonBase>
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
                    classes={{ paper: styles.content }}
                >
                    {this.props.children}
                </Popover>
            </div>
        );
    }
}

LabelPopover.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    leftAction: PropTypes.object,
    rightAction: PropTypes.object,
    error: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.node])
};

export default connect()(LabelPopover);
