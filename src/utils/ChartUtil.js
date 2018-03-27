import Immutable from "immutable";
import Highcharts from "utils/HighchartsLoader";
import moment from "moment";
import MiscUtil from "utils/MiscUtil";
import * as appStrings from "constants/appStrings";

const PRIMARY_COLOR = "#0288d1";
const SECONDARY_COLOR = "#d14702";
const CHART_WIDTH = 510;
const CHART_HEIGHT = 298;

let nodeChartMap = Immutable.Map();

export default class ChartUtil {
    static plotData(options) {
        switch (options.chartType) {
            case appStrings.CHART_TYPES.SINGLE_SERIES:
                return this.plotSingleSeries(options);
            case appStrings.CHART_TYPES.SINGLE_SERIES_WITH_COLOR:
                return this.plotSingleSeriesWithColor(options);
            case appStrings.CHART_TYPES.MULTI_SERIES:
                return this.plotMultiSeries(options);
            case appStrings.CHART_TYPES.MULTI_SERIES_WITH_COLOR:
                return this.plotMultiSeriesWithColor(options);
            default:
                return false;
        }
    }

    static updateData(options) {
        switch (options.chartType) {
            case appStrings.CHART_TYPES.SINGLE_SERIES:
                return this.updateSingleSeries(options);
            case appStrings.CHART_TYPES.SINGLE_SERIES_WITH_COLOR:
                return this.updateSingleSeriesWithColor(options);
            case appStrings.CHART_TYPES.MULTI_SERIES:
                return this.updateMultiSeries(options);
            case appStrings.CHART_TYPES.MULTI_SERIES_WITH_COLOR:
                return this.updateMultiSeriesWithColor(options);
            default:
                return false;
        }
    }

    static setDateIndicator(options) {
        let node = options.node;
        let date = options.date;

        if (typeof node !== "undefined") {
            let chart = nodeChartMap.get(node.id);
            if (typeof chart !== "undefined") {
                let xAxis = chart.xAxis[0];
                let dateIndicator = chart.annotations[0];
                if (
                    xAxis.options.type === "datetime" &&
                    typeof dateIndicator !== "undefined" &&
                    typeof date !== "undefined"
                ) {
                    dateIndicator.setVisible(true);
                    dateIndicator.shapes[0].points[0].plotX = xAxis.toPixels(date, true);
                    dateIndicator.shapes[0].points[1].plotX = xAxis.toPixels(date, true);
                    chart.drawAnnotations();
                }
            }
        }
    }

    static updateSingleSeries(options) {
        let node = options.node;
        let data = options.data;
        let displayOptions = options.displayOptions;

        // check if we have data a place to render to
        if (typeof node !== "undefined") {
            let chart = nodeChartMap.get(node.id);
            if (typeof chart !== "undefined") {
                if (typeof data !== "undefined") {
                    let series = chart.series[0];
                    if (series) {
                        // update the yaxis direction
                        let yaxis = chart.axes.reduce((acc, a) => {
                            if (a.side === 3) {
                                // left side of plot
                                return a;
                            }
                            return acc;
                        }, undefined);
                        if (typeof yaxis !== "undefined") {
                            // calculate data min/max for yaxis
                            let extremes = data.reduce(
                                (acc, entry) => {
                                    if (entry[1] < acc[0]) {
                                        acc[0] = entry[1];
                                    }
                                    if (entry[1] > acc[1]) {
                                        acc[1] = entry[1];
                                    }

                                    return acc;
                                },
                                [Number.MAX_VALUE, -Number.MAX_VALUE]
                            );

                            yaxis.update(
                                {
                                    min: extremes[0],
                                    max: extremes[1],
                                    reversed: displayOptions.get("yAxisReversed")
                                },
                                false
                            );
                        }

                        series.update(
                            {
                                type: displayOptions.get("markerType") || "scatter",
                                colorByPoint: true,
                                color: "PRIMARY_COLOR",
                                showInLegend: false,
                                data: data
                            },
                            false
                        );
                    } else {
                        console.warn(
                            "Error in ChartUtil.updateSingleSeries: could not find existing series"
                        );
                        return false;
                    }
                }
                chart.redraw();
            }
            return true;
        } else {
            console.warn("Error in ChartUtil.updateSingleSeries: Missing chart options", options);
            return false;
        }
    }

    static updateMultiSeries(options) {
        return false;
    }

    static updateSingleSeriesWithColor(options) {
        let node = options.node;
        let dataExtremes = options.dataExtremes;
        let note = options.note;

        if (typeof node !== "undefined") {
            let chart = nodeChartMap.get(node.id);
            if (typeof chart !== "undefined") {
                if (typeof dataExtremes !== "undefined") {
                    let caxis = chart.axes.reduce((acc, a) => {
                        if (a instanceof Highcharts.ColorAxis) {
                            return a;
                        }
                        return acc;
                    }, undefined);
                    if (typeof caxis !== "undefined") {
                        caxis.setExtremes(dataExtremes.min, dataExtremes.max, false);
                    }
                }
                if (typeof note !== "undefined") {
                    chart.subtitle.update({ text: note });
                }
            }
            return this.updateSingleSeries(options);
        } else {
            console.warn("Error in ChartUtil.updateSingleSeries: Missing chart options", options);
            return false;
        }
    }
    static updateMultiSeriesWithColor(options) {
        return false;
    }

    static plotSingleSeries(options) {
        try {
            console.log("Attempting single series...");
            return false;
        } catch (err) {
            console.warn("Error in ChartUtil.plotSingleSeries: ", err);
            return false;
        }
    }

    static plotSingleSeriesWithColor(options) {
        try {
            let node = options.node;
            let data = options.data;
            let dataExtremes = options.dataExtremes || {};
            let keys = options.keys;
            let displayOptions = options.displayOptions;
            let onZoom = options.onZoom;
            let note = options.note || "";

            let hoveredPoint = undefined;

            // check if we have data a place to render to
            if (typeof node !== "undefined" && typeof data !== "undefined") {
                if (data.length === 0) {
                    data.push([new Date() - 0, 0, 0]);
                }
                let chart = Highcharts.chart(options.node, {
                    chart: {
                        zoomType: "x",
                        animation: false,
                        width: CHART_WIDTH,
                        height: CHART_HEIGHT,
                        spacingBottom: 10,
                        marginTop: 58,
                        marginRight: 90,
                        resetZoomButton: {
                            relativeTo: "plot",
                            position: {
                                align: "left",
                                verticalAlign: "bottom",
                                x: -57,
                                y: 20
                            },
                            theme: {
                                style: {
                                    fontSize: "1.2rem",
                                    fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                                    fontWeight: 500,
                                    textTransform: "uppercase"
                                }
                            }
                        },
                        events: {
                            click: function(e) {
                                if (typeof options.onClick === "function") {
                                    options.onClick(hoveredPoint);
                                }
                            }
                        }
                    },

                    annotations: [
                        {
                            shapes: [
                                {
                                    points: [{ x: 0, y: 0 }, { x: 0, y: 200 }],
                                    type: "path",
                                    fill: "none",
                                    stroke: "#00bcd4",
                                    strokeWidth: 2
                                }
                            ],
                            visible: false
                        }
                    ],

                    boost: {
                        usePreallocated: false,
                        useGPUTranslations: false,
                        seriesThreshold: "1" // always use boost for consistency
                    },

                    xAxis: {
                        id: "x-axis",
                        type: "datetime",
                        gridLineWidth: 1,
                        lineWidth: 2,
                        title: {
                            text: keys.xKey,
                            style: {
                                fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                                fontSize: "1.4rem"
                            }
                        },
                        dateTimeLabelFormats: {
                            millisecond: "%H:%M:%S.%L",
                            second: "%H:%M:%S",
                            minute: "%H:%M",
                            hour: "%H:%M",
                            day: "%b %e",
                            week: "%b %e",
                            month: "%b, %Y",
                            year: "%Y"
                        },
                        labels: {
                            style: {
                                fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                                textAlign: "center"
                            },
                            formatter: this.getTickFormatter()
                        },
                        events: {
                            afterSetExtremes: zoomEvent => {
                                if (zoomEvent.type === "setExtremes") {
                                    if (
                                        typeof zoomEvent.userMin === "undefined" &&
                                        typeof zoomEvent.userMax === "undefined"
                                    ) {
                                        onZoom();
                                    } else {
                                        onZoom([zoomEvent.userMin, zoomEvent.userMax]);
                                    }
                                }
                            }
                        }
                    },

                    yAxis: [
                        {
                            id: "y-axis",
                            minPadding: 0,
                            maxPadding: 0,
                            reversed: displayOptions.get("yAxisReversed"),
                            startOnTick: false,
                            endOnTick: false,
                            tickPixelInterval: 50,
                            lineWidth: 2,
                            title: {
                                text: keys.yKey,
                                style: {
                                    fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                                    fontSize: "1.4rem"
                                }
                            },
                            labels: {
                                x: -4,
                                style: {
                                    fontFamily: "'Roboto', Helvetica, Arial, sans-serif"
                                }
                            }
                        },
                        {
                            // hacky color axis label yAxis
                            id: "z-axis-label",
                            gridLineWidth: 0,
                            // minPadding: 0,
                            // maxPadding: 0,
                            opposite: true,
                            tickLength: 0,
                            title: {
                                text: keys.zKey,
                                rotation: -90,
                                margin: 30,
                                style: {
                                    fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                                    fontSize: "1.4rem"
                                }
                            },
                            labels: {
                                enabled: false
                            }
                        }
                    ],

                    colorAxis: {
                        id: "z-axis",
                        reversed: false,
                        min: dataExtremes.min,
                        max: dataExtremes.max,
                        minColor: PRIMARY_COLOR,
                        maxColor: SECONDARY_COLOR,
                        title: {
                            text: keys.zKey,
                            style: {
                                fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                                fontSize: "1.4rem"
                            }
                        },
                        labels: {
                            x: 2
                        }
                    },

                    title: {
                        text: "Albacore Tuna",
                        align: "left",
                        style: {
                            fontSize: "1.5rem",
                            fontWeight: "500",
                            fontFamily: "'Roboto', Helvetica, Arial, sans-serif"
                        }
                    },

                    subtitle: {
                        text: note,
                        align: "right",
                        verticalAlign: "bottom",
                        y: 0,
                        x: -10,
                        style: {
                            fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                            fontSize: "1.2rem",
                            fontWeight: "300",
                            fontStyle: "italic"
                        }
                    },

                    credits: {
                        enabled: false
                    },

                    legend: {
                        enabled: true,
                        layout: "vertical",
                        align: "right",
                        verticalAlign: "middle",
                        x: 15
                    },

                    exporting: {
                        buttons: {
                            contextButton: {
                                enabled: false
                            }
                        }
                    },

                    plotOptions: {
                        series: {
                            findNearestPointBy: "xy",
                            marker: {
                                radius: 4
                            }
                        }
                    },

                    tooltip: {
                        crosshairs: false,
                        followPointer: false,
                        shadow: false,
                        animation: false,
                        hideDelay: 0,
                        shared: false,
                        borderRadius: 2,
                        padding: 0,
                        backgroundColor: "rgba(247,247,247,0)",
                        borderWidth: 0,
                        positioner: function() {
                            return { x: 6, y: 28 };
                        },
                        style: {
                            fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                            fontSize: "1.2rem"
                        },
                        useHTML: true,
                        formatter: this.getTooltipFormatter(keys)
                    },

                    series: [
                        {
                            type: displayOptions.get("markerType") || "scatter",
                            colorByPoint: true,
                            color: "PRIMARY_COLOR",
                            showInLegend: false,
                            data: data,
                            point: {
                                events: {
                                    mouseOver: function(e) {
                                        hoveredPoint = e.target;
                                    }
                                }
                            }
                        }
                    ]
                });
                nodeChartMap = nodeChartMap.set(options.node.id, chart);
            } else {
                console.warn(
                    "Error in ChartUtil.plotSingleSeriesWithColor: Missing chart options",
                    options
                );
                return false;
            }
        } catch (err) {
            console.warn("Error in ChartUtil.plotSingleSeriesWithColor: ", err);
            return false;
        }
    }

    static plotMultiSeries(options) {
        try {
            console.log("Attempting multi series...");
            return false;
        } catch (err) {
            console.warn("Error in ChartUtil.plotMultiSeries: ", err);
            return false;
        }
    }

    static plotMultiSeriesWithColor(options) {
        try {
            console.log("Attempting multi series with color...");
            return false;
        } catch (err) {
            console.warn("Error in ChartUtil.plotMultiSeriesWithColor: ", err);
            return false;
        }
    }

    static clearPlot(node) {
        if (typeof nodeChartMap.get(node.id) !== "undefined") {
            nodeChartMap.get(node.id).destroy();
            nodeChartMap = nodeChartMap.delete(node.id);
        } else {
            console.warn(
                "Error in ChartUtil.clearPlot: could not find matching chart for node",
                node
            );
        }
    }

    static downloadChartAsImage(node, options) {
        if (typeof nodeChartMap.get(node.id) !== "undefined") {
            let chart = nodeChartMap.get(node.id);
            chart.exportChartLocal({
                filename: options.filename,
                type: options.format,
                width: options.width,
                sourceWidth: CHART_WIDTH,
                sourceHeight: CHART_HEIGHT
            });
        } else {
            console.warn(
                "Error in ChartUtil.downloadChartAsImage: could not find matching chart for node",
                node
            );
        }
    }

    static getTooltipFormatter(keys) {
        return function() {
            if (typeof this.point !== "undefined") {
                let point = this.point;
                let x = point.x;
                let y = point.y;
                let z = point.value;
                return (
                    "<div class='tooltip-table'>" +
                    "<div class='tooltip-table-row'>" +
                    "<span class='tooltip-key'>" +
                    keys.xKey +
                    ": </span>" +
                    "<span class='tooltip-value'>" +
                    moment(x).format("MMM DD, YYYY · HH:mm") +
                    "</span>" +
                    "</div>" +
                    "<div class='tooltip-table-row'>" +
                    "<span class='tooltip-key'>" +
                    keys.yKey +
                    ": </span>" +
                    "<span class='tooltip-value'>" +
                    parseFloat(y).toFixed(4) +
                    "</span>" +
                    "</div>" +
                    "<div class='tooltip-table-row'>" +
                    "<span class='tooltip-key'>" +
                    keys.zKey +
                    ": </span>" +
                    "<span class='tooltip-value'>" +
                    parseFloat(z).toFixed(4) +
                    "</span>" +
                    "</div>" +
                    "</div>"
                );
            }
        };
    }

    static getTickFormatter() {
        return function() {
            if (this.isFirst) {
                let timeDiff = this.axis.paddedTicks[1] - this.axis.paddedTicks[0];
                if (timeDiff >= 1.577e10) {
                    // 6 months
                    this.dateTimeLabelFormat = "%b, %Y";
                } else if (timeDiff >= 7.884e9) {
                    // 3 months
                    this.dateTimeLabelFormat = "%b, %Y";
                } else if (timeDiff >= 2.628e9) {
                    // 1 months
                    this.dateTimeLabelFormat = "%b, %Y";
                } else if (timeDiff >= 6.048e8) {
                    // 1 week
                    this.dateTimeLabelFormat = "%b %e<br>%Y";
                } else if (timeDiff >= 8.64e7) {
                    // 1 day
                    this.dateTimeLabelFormat = "%b %e<br>%Y";
                } else {
                    this.dateTimeLabelFormat = "%H:%M<br>%b %e, %Y";
                }
            }
            return this.axis.defaultLabelFormatter.call(this);
        };
    }
}
