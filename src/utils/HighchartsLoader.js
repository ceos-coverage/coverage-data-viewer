import Highcharts from "highcharts";

require("highcharts/modules/data")(Highcharts);
require("highcharts/modules/heatmap")(Highcharts);
require("highcharts/highcharts-more")(Highcharts);
require("highcharts/modules/exporting")(Highcharts);
require("highcharts/modules/offline-exporting")(Highcharts);
require("assets/highcharts/boost.custom")(Highcharts);

export default Highcharts;
