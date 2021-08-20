/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Tooltip from "@material-ui/core/Tooltip";
import ShareIcon from "@material-ui/icons/Share";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import * as appActions from "actions/appActions";
import MiscUtil from "utils/MiscUtil";
import { MapButton } from "_core/components/Reusables";
import styles from "components/Share/ShareControl.scss";

export class ShareControl extends Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
        this.state = {
            currentUrl: window.location.href,
            modalOpen: false,
            showCopy: false
        };
    }

    openModal = () => {
        this.setState({ modalOpen: true, currentUrl: window.location.href });
    };

    closeModal = () => {
        this.setState({ modalOpen: false, showCopy: false });
    };

    copyText = () => {
        if (this.inputRef.current) {
            /* Select the text field */
            this.inputRef.current.select();
            this.inputRef.current.setSelectionRange(0, 99999); /* For mobile devices */

            /* Copy the text inside the text field */
            navigator.clipboard.writeText(this.inputRef.current.value);

            this.setState({ showCopy: true });
        }
    };

    render() {
        const { modalOpen, showCopy, currentUrl } = this.state;

        let containerClasses = MiscUtil.generateStringFromSet({
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        return (
            <>
                <Tooltip disableFocusListener={true} title="Share" placement="right">
                    <MapButton
                        onClick={this.openModal}
                        aria-label="Help"
                        className={containerClasses}
                    >
                        <ShareIcon />
                    </MapButton>
                </Tooltip>
                {modalOpen ? (
                    <Dialog
                        classes={{ paper: styles.modalRoot }}
                        open={modalOpen}
                        onClose={this.closeModal}
                    >
                        <DialogContent classes={{ root: styles.content }}>
                            <Grid container className={styles.header} alignItems="center">
                                <Grid item xs={12}>
                                    <Typography
                                        variant="body2"
                                        color="inherit"
                                        className={styles.title}
                                    >
                                        Share
                                    </Typography>
                                </Grid>
                            </Grid>
                            <div className={styles.innerContent}>
                                <Typography variant="body2" className={styles.subheader}>
                                    copy this URL and share it however you like
                                </Typography>
                                <input
                                    type="text"
                                    ref={this.inputRef}
                                    readOnly="readonly"
                                    value={currentUrl}
                                    className={styles.permalink}
                                    onClick={this.copyText}
                                />
                                <Typography variant="caption" className={styles.copyHint}>
                                    {showCopy ? "URL copied to clipboard!" : ""}
                                </Typography>
                            </div>
                            <div className={styles.footer}>
                                <Button
                                    variant="text"
                                    size="small"
                                    color="primary"
                                    className={styles.button}
                                    onClick={this.closeModal}
                                >
                                    Done
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : null}
            </>
        );
    }
}

ShareControl.propTypes = {
    appActions: PropTypes.object.isRequired,
    className: PropTypes.string
};

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(
    null,
    mapDispatchToProps
)(ShareControl);
