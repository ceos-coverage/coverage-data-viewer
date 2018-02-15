import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Tooltip from "material-ui/Tooltip";
import FileDownloadIcon from "material-ui-icons/FileDownload";
import CloseIcon from "material-ui-icons/Close";
import SettingsIcon from "material-ui-icons/Settings";
import { IconButtonSmall } from "_core/components/Reusables";
import * as chartActions from "actions/chartActions";
import styles from "components/Chart/ChartButtons.scss";

export class ChartButtons extends Component {
    render() {
        return (
            <div className={styles.root}>
                <Tooltip
                    disableTriggerFocus
                    title="Download"
                    placement="bottom"
                    className={styles.btnWrapper}
                >
                    <IconButtonSmall color="inherit" className={styles.btn}>
                        <FileDownloadIcon />
                    </IconButtonSmall>
                </Tooltip>
                <Tooltip
                    disableTriggerFocus
                    title="Options"
                    placement="bottom"
                    className={styles.btnWrapper}
                >
                    <IconButtonSmall
                        color="inherit"
                        className={styles.btn}
                        onClick={() => {
                            this.props.chartActions.setChartDisplayOptions(this.props.chartId, {
                                isOpen: true
                            });
                        }}
                    >
                        <SettingsIcon />
                    </IconButtonSmall>
                </Tooltip>
                <Tooltip
                    disableTriggerFocus
                    title="Close"
                    placement="bottom"
                    className={styles.btnWrapper}
                >
                    <IconButtonSmall
                        color="inherit"
                        className={styles.btn}
                        onClick={() => this.props.chartActions.closeChart(this.props.chartId)}
                    >
                        <CloseIcon />
                    </IconButtonSmall>
                </Tooltip>
            </div>
        );
    }
}

ChartButtons.propTypes = {
    chartId: PropTypes.string.isRequired,
    chartActions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        chartActions: bindActionCreators(chartActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(ChartButtons);
