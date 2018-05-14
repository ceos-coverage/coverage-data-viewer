import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import moment from "moment";
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import * as mapActionsCore from "_core/actions/mapActions";
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
            seriesTitles: this.props.chart
                .getIn(["formOptions", "selectedTracks"])
                .map(track => track.title)
                .toJS(),
            seriesNum: this.props.chart.getIn(["formOptions", "selectedTracks"]).size,
            note: "decimation unknown",
            keys: {
                xKey: this.props.chart.getIn(["formOptions", "xAxis"]),
                yKey: this.props.chart.getIn(["formOptions", "yAxis"]),
                zKey: this.props.chart.getIn(["formOptions", "zAxis"])
            },
            onZoom: bounds => {
                this.props.chartActions.zoomChartData(this.props.chart.get("id"), bounds);
            },
            onClick: evt => {
                let axisIsTime =
                    this.props.chart
                        .getIn(["formOptions", "xAxis"])
                        .toLocaleLowerCase()
                        .indexOf("time") !== -1;
                if (axisIsTime) {
                    let date = moment.utc(evt.x);
                    // set the map date, if found
                    if (date.isValid()) {
                        this.props.mapActionsCore.setDate(date.toDate());
                    }
                }
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
            if (prevProps.chart !== this.props.chart) {
                let dec_size = this.props.chart.get("data").reduce((acc, data) => {
                    return acc + data.meta.dec_size;
                }, 0);
                let sub_size = this.props.chart.get("data").reduce((acc, data) => {
                    return acc + data.meta.sub_size;
                }, 0);

                // calculate extremes across all available data
                let xKey = this.props.chart.getIn(["formOptions", "xAxis"]);
                let yKey = this.props.chart.getIn(["formOptions", "yAxis"]);
                let zKey = this.props.chart.getIn(["formOptions", "zAxis"]);
                let extremes = {
                    x: { min: Number.MAX_VALUE, max: -Number.MAX_VALUE },
                    y: { min: Number.MAX_VALUE, max: -Number.MAX_VALUE },
                    z: { min: Number.MAX_VALUE, max: -Number.MAX_VALUE }
                };
                extremes = this.props.chart.get("data").reduce((acc, data) => {
                    if (data.meta.extremes[xKey].min < acc.x.min) {
                        acc.x.min = data.meta.extremes[xKey].min;
                    }
                    if (data.meta.extremes[xKey].max > acc.x.max) {
                        acc.x.max = data.meta.extremes[xKey].max;
                    }
                    if (data.meta.extremes[yKey].min < acc.y.min) {
                        acc.y.min = data.meta.extremes[yKey].min;
                    }
                    if (data.meta.extremes[yKey].max > acc.y.max) {
                        acc.y.max = data.meta.extremes[yKey].max;
                    }
                    if (typeof zKey !== "undefined") {
                        if (data.meta.extremes[zKey].min < acc.z.min) {
                            acc.z.min = data.meta.extremes[zKey].min;
                        }
                        if (data.meta.extremes[zKey].max > acc.z.max) {
                            acc.z.max = data.meta.extremes[zKey].max;
                        }
                    }
                    return acc;
                }, extremes);

                // override extremes
                if (
                    typeof yKey !== "undefined" &&
                    this.props.chart.getIn(["displayOptions", "useCustomYAxisBounds"])
                ) {
                    extremes.y.min = this.props.chart.getIn(["displayOptions", "customYMin"]);
                    extremes.y.max = this.props.chart.getIn(["displayOptions", "customYMax"]);
                }
                if (
                    typeof zKey !== "undefined" &&
                    this.props.chart.getIn(["displayOptions", "useCustomZAxisBounds"])
                ) {
                    extremes.z.min = this.props.chart.getIn(["displayOptions", "customZMin"]);
                    extremes.z.max = this.props.chart.getIn(["displayOptions", "customZMax"]);
                }

                let data = this.props.chart.get("data").map(data => data.data);

                ChartUtil.updateData({
                    node: node,
                    data: data,
                    dataExtremes: extremes,
                    note: (dec_size / sub_size * 100).toFixed(1) + "% of points shown",
                    chartType: this.props.chart.get("chartType"),
                    displayOptions: this.props.chart.get("displayOptions")
                });
                ChartUtil.setDateIndicator({
                    node: node,
                    date: this.props.mapDate
                });
            } else if (prevProps.mapDate !== this.props.mapDate) {
                ChartUtil.setDateIndicator({
                    node: node,
                    date: this.props.mapDate
                });
            }
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
                <ChartButtons
                    chartId={this.props.chart.get("id")}
                    nodeId={this.props.chart.get("nodeId")}
                />
                <div className={loadingClasses}>
                    <Typography variant="title" component="div" className={styles.loading}>
                        loading data...
                    </Typography>
                </div>
                <ChartSettings
                    chartId={this.props.chart.get("id")}
                    displayOptions={this.props.chart.get("displayOptions")}
                    formOptions={this.props.chart.get("formOptions")}
                />
            </Paper>
        );
    }
}

Chart.propTypes = {
    chart: PropTypes.object.isRequired,
    mapDate: PropTypes.object.isRequired,
    chartActions: PropTypes.object.isRequired,
    mapActionsCore: PropTypes.object.isRequired,
    mapIntervalDate: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        mapDate: state.map.get("date"),
        mapIntervalDate: state.map.get("intervalDate")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        chartActions: bindActionCreators(chartActions, dispatch),
        mapActionsCore: bindActionCreators(mapActionsCore, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
