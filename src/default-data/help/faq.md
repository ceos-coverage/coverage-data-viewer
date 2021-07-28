### How do I turn on an in-situ dataset?

1. Make sure the main menu is open on the right hand side of the application
2. Click on the **IN-SITU DATASETS** tab at the top of the menu
3. For the dataset you are interested in, click on the title of the dataset or on the checkbox on the left side of the list entry
4. The dataset will then load and be displayed on the map and be listed in the **In-Situ Datasets** menu in the top-left of the application
5. In the **In-Situ Datasets** menu, click on the wrench icon to open additional view tools for that dataset
6. Click on **Zoom-To Track**

### How do I search for a particular dataset or filter out ones I don't want?

_In either the **IN-SITU DATASETS** or **SATELLITE DATASETS** you can do the following:_

1. Use the **Select Area** input to specify an area of interest
2. Use the date range input to specify a time span
3. Select one or more parameter from **Variable**, **Platform**, **Sensor**, and **Program**
4. Once you have made your selections, press the **SEARCH** button
5. The list of results will be filtered according to your selections

### Where is the in-situ dataset I just turned on?

_Some possible issues are are:_

1. The dataset may still loading, this is indicated by a spinning icon next to the dataset item in the **In-Situ Datasets** menu in the top left of the application.
2. If the dataset is loaded, it may be in a different area of the map. To focus on that dataset:
    * In the **In-Situ Datasets** menu, click on the wrench icon to open additional view tools for that dataset
    * Click on **Zoom-To Track**
3. The dataset is colored in such a way as to blend in with the base layer
    * In the **In-Situ Datasets** menu, find the colored dot to left of the dataset label
    * Click on the dot and select an alternate color that contrasts with the background

### Why can't I see a satellite layer?
Most likely the currently selected date does not overlap with the satellite dataset's temporal coverage.

1. Note the time range of the dataset below the dataset's title in the main menu listing
2. Use the date selector in the bottom left of the application to select a date within the dataset's temporal range

### How do I create a chart of this in-situ dataset?
Under the **CHARTS** tab of the main menu on the right side of the application, use four dropdowns to select your dataset, x-axis variable, y-axis variable, and z-axis variable (optional), then click **CREATE CHART**. The application will then fetch the data and plot it on the newly created chart.

### How do I zoom in on a chart?
Click and drag horizontally (left to right or right to left) on a chart to select a subset of the data range. The chart will zoom into that section and fetch higher resolution data within the new bounds.

### How can I sync my view between the map and the charts?
Both the map and charts share the concept of the "selected date" and "selected date range". Both of these values are indicated in the date picker in the lower left of the application. For an in-situ dataset that is displayed on the map, the data points that fall within the selected date range will be highlighted with a white/black border. Clicking on any point in that dataset on the map will switch the selected date to that data point's time. Similarly, in each chart that uses _Time_ for the x-axis, a black bordered box will be displayed on the chart indicating this date range. If it does not appear then the currently selected date range is outside of the chart's time display bounds. If it appears to simply be a vertical line, then the chart is zoomed out to far to distinguish the bounds of the box, try zooming in on the box to see it more clearly. Clicking anywhere on a chart that uses _Time_ for the x-axis will switch the selected date to the time that was clicked.

### Can I create a chart of satellite data?
Not at this time, though we hope to support this in the future.
