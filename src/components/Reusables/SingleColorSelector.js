import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ButtonBase from "material-ui/ButtonBase";
import Popover from "material-ui/Popover";
import Paper from "material-ui/Paper";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/Reusables/SingleColorSelector.scss";

export class SingleColorSelector extends Component {
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

    handleColorSelect(colorStr) {
        if (typeof this.props.onSelect === "function") {
            this.props.onSelect(colorStr);
        }
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        let colorList =
            typeof this.props.colors !== "undefined"
                ? this.props.colors
                : appConfig.INSITU_VECTOR_COLORS;

        return (
            <div className={containerClasses}>
                <ButtonBase
                    focusRipple={true}
                    onClick={() => this.handleClickButton()}
                    className={styles.btn}
                    style={{ background: this.props.color }}
                    ref={node => {
                        this.button = node;
                    }}
                />
                <Popover
                    open={this.popoverOpen}
                    anchorEl={this.button}
                    anchorReference="anchorEl"
                    onClose={() => this.handleClose()}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "left"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left"
                    }}
                    classes={{ paper: styles.colorList }}
                >
                    {colorList.map((colorStr, i) => {
                        return (
                            <Paper
                                key={"color-option-" + i}
                                elevation={colorStr === this.props.color ? 4 : 0}
                                className={styles.colorOption}
                                style={{ background: colorStr }}
                                onClick={() => this.handleColorSelect(colorStr)}
                            />
                        );
                    })}
                </Popover>
            </div>
        );
    }
}

SingleColorSelector.propTypes = {
    color: PropTypes.string.isRequired,
    colors: PropTypes.object,
    onSelect: PropTypes.func,
    className: PropTypes.string
};

export default connect()(SingleColorSelector);
