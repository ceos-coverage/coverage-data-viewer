import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Popover from "material-ui/Popover";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/Reusables/IconPopover.scss";
import { IconButtonSmall } from "_core/components/Reusables";

export class IconPopover extends Component {
    constructor(props) {
        super(props);

        this.popoverOpen = false;
        this.button = undefined;
    }

    handleClickButton(evt) {
        this.button = findDOMNode(evt.currentTarget);
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

        let contentClasses = MiscUtil.generateStringFromSet({
            [styles.content]: true,
            [this.props.contentClass]: typeof this.props.contentClass !== "undefined"
        });

        return (
            <div className={containerClasses}>
                <IconButtonSmall
                    color="inherit"
                    className={styles.button}
                    onClick={evt => this.handleClickButton(evt)}
                >
                    {this.props.icon}
                </IconButtonSmall>
                <Popover
                    open={this.popoverOpen}
                    anchorEl={this.button}
                    anchorReference="anchorEl"
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "center"
                    }}
                    onClose={() => this.handleClose()}
                    classes={{ paper: contentClasses }}
                >
                    {this.props.children}
                </Popover>
            </div>
        );
    }
}

IconPopover.propTypes = {
    icon: PropTypes.node.isRequired,
    className: PropTypes.string,
    contentClass: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.node])
};

export default connect()(IconPopover);
