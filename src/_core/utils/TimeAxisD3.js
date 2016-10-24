import d3 from 'd3';
import moment from 'moment';
import * as appStrings from '_core/constants/appStrings';

export default class TimeAxisD3 {
    // This timeline is loosely based off of this d3 timeline
    // https://github.com/commodityvectors/d3-timeline
    // The timeline also contains several other features/pieces of logic that
    // were not implemented here such as tick label size constraining/formatting (we think)
    constructor(options) {
        this.initValues(options);
    }

    initValues(options) {
        // extract values
        this._selectNode = typeof options.selectNode !== "undefined" ? options.selectNode : this._selectNode;
        this._symbolWidth = typeof options.symbolWidth !== "undefined" ? options.symbolWidth : this._symbolWidth;
        this._onClick = typeof options.onClick !== "undefined" ? options.onClick : this._onClick;
        this._onHover = typeof options.onHover !== "undefined" ? options.onHover : this._onHover;
        this._onMouseOut = typeof options.onMouseOut !== "undefined" ? options.onMouseOut : this._onMouseOut;
        this._minDt = typeof options.minDt !== "undefined" ? options.minDt : this._minDt;
        this._maxDt = typeof options.maxDt !== "undefined" ? options.maxDt : this._maxDt;
        this._elementWidth = typeof options.elementWidth !== "undefined" ? options.elementWidth : this._elementWidth;
        this._elementHeight = typeof options.elementHeight !== "undefined" ? options.elementHeight : this._elementHeight;
        this._margin = typeof options.margin !== "undefined" ? options.margin : this._margin;

        // derive values
        this._width = this._elementWidth - (this._margin.left + this._margin.right);
        this._height = this._elementHeight - (this._margin.top + this._margin.bottom);

        // grab d3 selection if needed
        this._selection = typeof this._selection !== "undefined" ? this._selection : d3.select(this._selectNode);

        // time format function
        this._timeFormat = typeof this._timeFormat !== "undefined" ? this._timeFormat : d3.time.format.multi([
            [".%L", (d) => {
                return d.getMilliseconds();
            }],
            [":%S", (d) => {
                return d.getSeconds();
            }],
            ["%-I:%M %p", (d) => {
                return d.getMinutes();
            }],
            ["%-I %p", (d) => {
                return d.getHours();
            }],
            ["%b %-d", (d) => {
                return d.getDate() != 1;
            }],
            ["%b", (d) => {
                return d.getMonth();
            }],
            ["%Y", () => {
                return true;
            }]
        ]);

        // prep the axis functions if needed
        this._xFn = typeof this._xFn !== "undefined" ? this._xFn : d3.time.scale()
            .domain([this._minDt, this._maxDt])
            .range([this._margin.left, this._margin.left + this._width]);
        this._xAxis = typeof this._xAxis !== "undefined" ? this._xAxis : d3.svg.axis()
            .scale(this._xFn)
            .orient('bottom')
            .innerTickSize(-this._height)
            .tickFormat(this._timeFormat);
    }

    enter(options = false) {
        let _context = this;

        // configure the zoom
        this._selection.zoom = d3.behavior.zoom()
            .x(this._xFn)
            .on('zoom', () => {
                this.zoomed();
            });

        // configure the drag
        this._selection.drag = d3.behavior.drag()
            .on('dragstart', () => {
                d3.event.sourceEvent.stopPropagation();
            });

        // enable the zooming
        this._selection
            .call(this._selection.zoom)
            .on("dblclick.zoom", null)
            .call(this._selection.drag)
            .on("click", () => {
                if (!d3.event.defaultPrevented && typeof this._onClick === "function") {
                    this._onClick(d3.event.clientX);
                }
            })
            .on("mousemove", () => {
                if (typeof this._onHover === "function") {
                    this._onHover(d3.event.clientX);
                }
            })
            .on("mouseleave", () => {
                if (typeof this._onMouseOut === "function") {
                    this._onMouseOut();
                }
            });

        // configure the axis
        this._selection.select("#x-axis")
            .attr('transform', 'translate(0,' + this._height + ')')
            .call(this._xAxis);

        // configure the single date bounds
        this._selection.selectAll(".single-date").each(function() {
            let singleDate = d3.select(this);
            if (!singleDate.attr().data()[0].isDragging) {
                singleDate
                    .attr('x', (d) => _context._xFn(d.date))
                    .attr("transform", (d) => {
                        return 'translate(' + _context._xFn(d.date) + ',0)';
                    });
            }
        });

        // done entering time to update
        this.updateAxis();
        this.update(options);
    }

    updateAxis() {
        let _context = this;

        // update sizes
        this._selection.select('clipPath rect')
            .attr('x', this._margin.left)
            .attr('y', 0)
            .attr('height', this._height)
            .attr('width', this._width);
        this._selection.select('rect#chart-bounds')
            .attr('x', this._margin.left)
            .attr('y', 0)
            .attr('height', this._height)
            .attr('width', this._width);
        // not sure why this is displaced by 5px, I'm assuming some padding somewhere...
        this._selection.select(".timeline-horiz-axis")
            .attr("x1", this._margin.left - 5)
            .attr("x2", this._margin.left + this._width);

        // configure the axis
        this._selection.select('#x-axis')
            .call(this._xAxis);

        this._selection.selectAll(".tick")
            .each(function(d, i) {
                let tick = d3.select(this);
                _context.formatTick(tick, d);
            });
    }

    update(options = false) {
        let _context = this;

        // update the single date display
        this._selection.selectAll(".single-date").each(function() {
            let singleDate = d3.select(this);
            if (!singleDate.attr().data()[0].isDragging) {
                singleDate
                    .transition()
                    .duration(options && typeof options.dateDuration !== "undefined" ? options.dateDuration : 75)
                    .attr('x', (d) => (_context._xFn(d.date)))
                    .attr("transform", (d) => {
                        return 'translate(' + _context._xFn(d.date) + ',0)';
                    });
            }
        });

        // update the resolution
        this.setResolution(options);

        // check if scroll is needed
        if(options.date && !this.dateInRange(options.date)) {
            let currRange = this._xFn.range();
            let rangeLeft = currRange[0];
            let rangeRight = currRange[1];
            let padding = Math.floor((rangeRight - rangeLeft) / 5);
            let currDateX = this._xFn(options.date);
            if(currDateX < rangeLeft) {
                this.autoScroll(false, (rangeLeft - currDateX) + padding, 75);
            } else if (currDateX > rangeRight) {
                this.autoScroll(true, (currDateX - rangeRight) + padding, 75);
            }
        }
    }

    setResolution(options) {
        let _context = this;
        if (options && options.date && options.scale) {

            // See: http://bl.ocks.org/mbostock/7ec977c95910dd026812
            this._selection.call(this._selection.zoom.event);

            // translate resolution to scale
            let scale = options.scale && typeof options.scale.resolution !== "undefined" ? options.scale.resolution : this._selection.zoom.scale();
            // let scale = this._selection.zoom.scale();
            // if (options.scale === appStrings.DATE_SLIDER_RESOLUTIONS.DAYS) {
            //     scale = 512;
            // } else if (options.scale === appStrings.DATE_SLIDER_RESOLUTIONS.MONTHS) {
            //     scale = 16;
            // } else if (options.scale === appStrings.DATE_SLIDER_RESOLUTIONS.YEARS) {
            //     scale = 1;
            // }

            // Record the coordinates (in data space) of the center( in screen space).
            // let scale = options.scale ? options.scale : this._selection.zoom.scale();
            let center0 = [this._xFn(options.date), 0];
            let translate0 = this._selection.zoom.translate();
            let coordinates0 = this.coordinates(center0);
            this._selection.zoom.scale(scale);

            // Translate back to the center.
            let center1 = this.point(coordinates0);
            this._selection.zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);
            let translate1 = this._selection.zoom.translate();
            let xOffset = ((this._xFn.range()[1] - (this._width / 2)) - this._xFn(options.date));
            this._selection.zoom.translate([translate1[0] + xOffset, translate1[1]]);

            let duration = typeof options.scaleDuration === "number" ? options.scaleDuration : 0;
            this._selection.transition().duration(duration).call(this._selection.zoom.event);
        }
    }

    dateInRange(date) {
        let dateX = this._xFn(date);
        return this._xFn.range()[0] < dateX && this._xFn.range()[1] > dateX;
    }

    coordinates(point) {
        let scale = this._selection.zoom.scale();
        let translate = this._selection.zoom.translate();
        return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
    }

    point(coordinates) {
        let scale = this._selection.zoom.scale();
        let translate = this._selection.zoom.translate();
        return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
    }

    formatTick(selection, d) {
        let month = d.getMonth();
        let day = d.getDate();
        let hour = d.getHours();
        let minutes = d.getMinutes();
        let seconds = d.getSeconds();
        let milliseconds = d.getMilliseconds();
        let y1 = "0";
        let y2 = "-18";
        let className = "default";

        // Year
        if (month === 0 &&
            day === 1 &&
            hour === 0 &&
            minutes === 0 &&
            seconds === 0 &&
            milliseconds === 0) {
            className = "year";
        } // Month
        else if (day === 1 &&
            hour === 0 &&
            minutes === 0 &&
            seconds === 0 &&
            milliseconds === 0) {
            className = "month";
        } else if (hour === 0 &&
            minutes === 0 &&
            seconds === 0 &&
            milliseconds === 0) {
            className = "day";
        } else if (minutes === 0 &&
            seconds === 0 &&
            milliseconds === 0) {
            className = "hour";
        } else if (seconds === 0 &&
            milliseconds === 0) {
            className = "minutes";
        } else if (milliseconds === 0) {
            className = "milliseconds";
        }

        // check if its in the future
        if (moment(d).isAfter(moment(new Date()))) {
            className += " future_date";
        }

        selection.select("text")
            .classed("tick-text-" + className, true);

        selection.select("line")
            .attr("y1", y1)
            .attr("y2", y2)
            .classed("tick-line-" + className, true);
    }

    zoomed() {
        // Check that the domain is not larger than bounds
        if (this._xFn.domain()[1] - this._xFn.domain()[0] > this._maxDt - this._minDt) {
            // Constrain scale to 1
            this._selection.zoom.scale(1);
        }

        if (this._xFn.domain()[0] <= this._minDt) {
            this._selection.zoom.translate([this._selection.zoom.translate()[0] - this._xFn(this._minDt) + this._xFn.range()[0], this._selection.zoom.translate()[1]]);
        }
        if (this._xFn.domain()[1] >= this._maxDt) {
            this._selection.zoom.translate([this._selection.zoom.translate()[0] - this._xFn(this._maxDt) + this._xFn.range()[1], this._selection.zoom.translate()[1]]);
        }

        // configure the axis
        this._selection.select('#x-axis')
            .call(this._xAxis);

        let singleDate = this._selection.select('.single-date');
        // If not isDragging, set x of singledate to new value
        // If isDragging, do not set value so that single date can be
        //  dragged while zoom is in progress
        if (!singleDate.attr().data()[0].isDragging) {
            singleDate
                .attr('x', d => {
                    return this._xFn(d.date);
                })
                .attr("transform", (d) => {
                    return 'translate(' + this._xFn(d.date) + ',0)';
                });
        }

        let _context = this;
        this._selection.selectAll(".tick")
            .each(function(d, i) {
                let tick = d3.select(this);
                _context.formatTick(tick, d);
            });
    }

    getDateFromX(value) {
        return this._xFn.invert(value);
    }

    getXFromDate(value) {
        return this._xFn(value);
    }

    autoScroll(toLeft, scrollDiff = undefined, duration = undefined) {
        // get current translation
        let currTrans = this._selection.zoom.translate();

        // if unset, determine autoscroll amount (one-fifth tick)
        if(typeof scrollDiff !== "number") {
            let currTicks = this._xFn.ticks();
            scrollDiff = (this._xFn(currTicks[1]) - this._xFn(currTicks[0])) / 5;
        }

        // prep the timeline
        this._selection.call(this._selection.zoom.translate(currTrans).event);


        duration = typeof duration === "number" ? duration : 50;

        // shift the timeline
        if (toLeft) {
            this._selection.transition()
                .duration(duration)
                .call(this._selection.zoom.translate([currTrans[0] - scrollDiff, currTrans[1]]).event);
        } else {
            this._selection.transition()
                .duration(duration)
                .call(this._selection.zoom.translate([currTrans[0] + scrollDiff, currTrans[1]]).event);
        }
    }

    resize(options) {

        // update the dimension values
        this.initValues(options);

        // Manually reset the zoom
        this._selection.zoom.scale(1).translate([0, 0]);

        // Update range values based on resized container dimensions
        this._xFn.range([this._margin.left, this._margin.left + this._width]);

        // Apply the updated xFn to the zoom
        this._selection.zoom.x(this._xFn);

        // don't animate the update
        options.dateDuration = 0;

        this.updateAxis();
        this.update(options);
    }

    getScaledWidth() {
        return (this._xFn.range()[1] - this._xFn.range()[0]) * this._selection.zoom.scale();
    }
}
