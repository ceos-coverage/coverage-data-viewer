import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import * as chartActions from "actions/chartActions";
import { ChartButtons, ChartSettings } from "components/Chart";
import MiscUtil from "utils/MiscUtil";
import ChartUtil from "utils/ChartUtil";
import styles from "components/Chart/Chart.scss";
import displayStyles from "_core/styles/display.scss";

export class Chart extends Component {
    componentDidMount() {
        let node =
            typeof this.refs.chartWrapper !== "undefined"
                ? this.refs.chartWrapper
                : document.getElementById(this.props.chart.get("nodeId"));

        ChartUtil.plotData({
            node: node,
            data: this.props.chart.get("data"),
            displayOptions: this.props.chart.get("displayOptions"),
            chartType: this.props.chart.get("chartType"),
            keys: {
                xKey: this.props.chart.getIn(["formOptions", "xAxis"]),
                yKey: this.props.chart.getIn(["formOptions", "yAxis"]),
                zKey: this.props.chart.getIn(["formOptions", "zAxis"])
            },
            onZoom: bounds => {
                this.props.chartActions.zoomChartData(this.props.chart.get("id"), bounds);
            }
        });
    }

    componentDidUpdate(prevProps) {
        // only update the chart if its something other than opening the settings
        // or updating the loading screen
        if (
            this.props.chart.getIn(["displayOptions", "isOpen"]) ===
                prevProps.chart.getIn(["displayOptions", "isOpen"]) &&
            this.props.chart.get("dataLoading") === prevProps.chart.get("dataLoading")
        ) {
            let node =
                typeof this.refs.chartWrapper !== "undefined"
                    ? this.refs.chartWrapper
                    : document.getElementById(this.props.chart.get("nodeId"));
            ChartUtil.updateData({
                node: node,
                data: this.props.chart.get("data"),
                dataExtremes: this.props.chart.get("dataMeta").extremes[
                    this.props.chart.getIn(["formOptions", "zAxis"])
                ],
                chartType: this.props.chart.get("chartType"),
                displayOptions: this.props.chart.get("displayOptions")
            });
        }
    }

    render() {
        let loadingClasses = MiscUtil.generateStringFromSet({
            [styles.loadingWrapper]: true,
            [displayStyles.hidden]: !this.props.chart.get("dataLoading")
        });
        return (
            <Paper className={styles.root} elevation={2}>
                <div
                    id={this.props.chart.get("nodeId")}
                    ref="chartWrapper"
                    className={styles.chart}
                />
                <ChartButtons chartId={this.props.chart.get("id")} />
                <div className={loadingClasses}>
                    <Typography variant="title" component="div" className={styles.loading}>
                        loading data...
                    </Typography>
                </div>
                <ChartSettings
                    chartId={this.props.chart.get("id")}
                    displayOptions={this.props.chart.get("displayOptions")}
                />
            </Paper>
        );
    }
}

Chart.propTypes = {
    chart: PropTypes.object.isRequired,
    chartActions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        chartActions: bindActionCreators(chartActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(Chart);
