### What date and time am I looking at?

In the lower left corner of the application is the _current date selector_. The primary input value indicates the _current selected date_ for the application. The satellite data on the map corresponds to this date.

Above the _current selected date_ in light grey is the _current start date_, the time between the _current start date_ and the _current selected date_ is the _current date interval_. In-situ data points that are within the _current date interval_ will be highlighted on their tracks.

Charts that use **Time** for the their horizontal axis will also display a black box around the data points that are within the _current date interval_.

### How do I change the date?

There are a few options:

1. Use the _current selected date_ input to enter a desired time. Press enter when finished or click outside of the input to set the date
2. Next the _current selected date_ input are **arrow** icons, use the left icon to step back one time step and the right to step forward one time step
3. Clicking on a data point of an in-situ dataset on the map will set the _current selected date_ to that data point's timestamp
4. Clicking on a data point of a chart that uses **Time** for the horizontal axis will set the _current selected date_ to that data point's timestamp

### What is the current time step and how can I change it?

The _current time step_ is the duration of the _current date interval_ (i.e. 1 day, 3 weeks, etc). By examining the _current date interval_ you can derive the _current date interval_. You can also click on the **skip** icon in the _current date selector_ to open the _current date interval selector_. You can then use the inputs to set your desired interval.

Once the _current date interval_ is set, the **arrow** icons in the _current date selector_ will step the _current data and time_ by the magnitude of the _current date interval_.

### How can I sync my view between the map and the charts?

Both the map and charts share the concept of the _current selected date_ and _current date interval_. Both of these values are indicated in the date picker in the lower left of the application.

For an in-situ dataset that is displayed on the map, the data points that fall within the selected date range will be highlighted with a white/black border. Clicking on any point in that dataset on the map will switch the selected date to that data point's time. Similarly, in each chart that uses **Time** for the x-axis, a black bordered box will be displayed on the chart indicating this date range. If it does not appear on the chart then the currently selected date range is outside of the chart's time display bounds. If it appears to simply be a vertical line, then the chart is zoomed out to far to distinguish the bounds of the box, try zooming in on the box to see it more clearly.

Clicking anywhere on a chart that uses **Time** for the x-axis will switch the selected date to the time that was clicked.
