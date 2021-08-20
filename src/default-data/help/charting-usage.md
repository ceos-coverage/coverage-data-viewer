### How can I set the x-axis bounds on a chart?

Click and drag horizontally (left to right or right to left) on a chart to select a subset of the data range. The chart will zoom into that section and fetch higher resolution data within the new bounds. Use the **RESET ZOOM** button in the lower left of the chart to reset the horizontal bounds of the chart.

### How can I set the y-axis bounds on a chart?

Click on gear icon in the upper right corner of a chart to open the chart settings popover. Use the **Set Y-Axis Bounds** inputs to set the vertical bounds you want. Once entered, click **APPLY** in the upper right of the popover.

### How can I set the z-axis bounds on a chart?

Click on gear icon in the upper right corner of a chart to open the chart settings popover. Use the **Set Z-Axis Bounds** inputs to set the axis bounds you want. Once entered, click **APPLY** in the upper right of the popover.

### Do the charts show all of the data from a dataset?

Yes, but it is downsampeld to maximize efficiency for the current display bounds. When a chart is created, the x-axis range defaults to the minimum and maximum of the selected parameter's range from the dataset, we then use the Largest Triangle Three Bucket (LTTB) algorithm to downsample the points that are plotted on the chart between those bounds.

This algorithm preserves both the average and outlier points without displaying duplicate points. This means that the shape of the chart will accurately show the shape the full dataset while only displaying a subset of the data points which means the chart can be rendered more quickly. When the x-axis bounds are adjusted (see above) the downsampling will be re-calculated using the new bounds. The target number of points the downsampling attempts to achieve defaults to 20000 points and can be adjusted in the display settings (see below). If the number data points within the current bounds prior to downsampling is less than or equal to the current downsampling target, then no downsampling will occur.

This means that from a high level you can see the shape of the entire dataset, and then "zoom in" to smaller and smaller bounds until you get to the non-downsampled individual data points.

### How can I change display settings on a chart?

Click on gear icon in the upper right corner of a chart to open the chart settings popover. Use the options in the popover to adjust the axis bounds, invert the y axis, if the chart uses **Time** on the x-axis you can sync the x-axis range to the current date interval, and use the dropdown selection to switch between line/dot display of the chart data. You can also adjust the downsampling target. Once you have selected the display options you want, press **APPLY** in the upper right corner of the popover to apply the options to the chart.

### How can I sync my view between the map and the charts?

Both the map and charts share the concept of the _selected date_ and _selected date range_. Both of these values are indicated in the date picker in the lower left of the application.

For an in-situ dataset that is displayed on the map, the data points that fall within the selected date range will be highlighted with a white/black border. Clicking on any point in that dataset on the map will switch the selected date to that data point's time. Similarly, in each chart that uses **Time** for the x-axis, a black bordered box will be displayed on the chart indicating this date range. If it does not appear on the chart then the currently selected date range is outside of the chart's time display bounds. If it appears to simply be a vertical line, then the chart is zoomed out to far to distinguish the bounds of the box, try zooming in on the box to see it more clearly.

Clicking anywhere on a chart that uses **Time** for the x-axis will switch the selected date to the time that was clicked.
