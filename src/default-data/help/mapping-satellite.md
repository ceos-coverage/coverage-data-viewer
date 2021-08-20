### Where is the satellite dataset I just turned on?

_Some things to check are are:_

1. The dataset may still loading. If it takes a very long time, try refreshing the page.
2. If the dataset is loaded, it may be in a different area of the map. Try zooming out to see more of the Earth.
3. The dataset temporal bounds do not intersect the current _selected date_
    - In the **SATELLITE DATASETS** tab of the main menu on the right side of the application, find the list item for the dataset in question
    - Compare the date range in the list to the _selected date_ displayed in the lower left of the application.
    - Change the _selected date_ to a date within the indicated temporal range for the dataset.

### How can I interact with the in-situ data on the map?

There are a few ways to examine the in-situ data on the map.

1. Simply looking at a track representing the in-situ dataset will show the spatial bounds over the entire sampling period, with each point connected by a line indicating the temporal ordering of the points. The first measurement location will be indicated with a downward pointing triangle and the final measurement location will be indicated with an upward pointing triangle. If any point or section of the track is highlighted with a thicker white boarder, that indicates that that section of the data falls within the _selected date range_ of the application. Thus, as you change the _selected date_ you can watch the progression of the data sampling.
2. By hovering your cursor over a point in the dataset, a popover will appear that describes that data point. It will list the dataset title, the lat/lon coordinates, and the number of times and dates that location was sampled in the dataset.
3. By clicking on a point in the dataset, you will set the _selected date_ to the date that that point was first sampled on.

### Can I change the color of the track?

Yes, in the upper left corner of the application you will see the **In-Situ Datasets** menu for active in-situ datasets. Just to the left of the dataset's title you will see a little dot indicating the dataset's current render color. Click on the dot to open a small menu of color options. Click on any of the color options to render the dataset with that color.


### What is the spatial error on the in-situ datasets?

It varies by dataset. Some datasets include a corollary spatial product that visualizes the lat/lon error bounds for each measurement location. To enable it, click on the **wrench** icon next to the dataset's title in the **In-Situ Datasets** menu in the upper left corner of the application. Then click on **Enable Error Ellipses**. If the dataset includes that corollary product, it will be displayed on the map. If it does not, then nothing will change.

### Can I automatically step through the spatial sampling within an in-situ dataset?

Yes, click on the **wrench** icon next to the dataset's title in the **In-Situ Datasets** menu in the upper left corner of the application. Then click on **Set Animation Range**. This will open the **animation controls** in the lower left of the application and pre-set the start and end time of the animation range to the first and last sampled time from the in-situ dataset. Then you can pres the **play** icon to begin stepping through the date range.

_Learn more about animating under the **Time and Animation** section_
