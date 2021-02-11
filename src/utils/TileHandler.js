import moment from "moment";
import TileHandlerCore from "_core/utils/TileHandler";
import * as appStrings from "constants/appStrings";

export default class TileHandler extends TileHandlerCore {
    static getUrlFunction(functionString = "") {
        switch (functionString) {
            case appStrings.URL_FUNC_WFS_AREA_TIME_FILTER:
                return TileHandler.fillWFSAreaTimeFilter;
            default:
                return TileHandlerCore.getUrlFunction(functionString);
        }
    }

    static fillWFSAreaTimeFilter(options) {
        const { startTime, endTime, extent, layer, url } = options;
        const startTimeFormat = moment.utc(startTime).format(layer.get("timeFormat"));
        const endTimeFormat = moment.utc(endTime).format(layer.get("timeFormat"));

        return url
            .replace("DATETIMEmin", startTimeFormat)
            .replace("DATETIMEmax", endTimeFormat)
            .replace("LATmin", extent[0])
            .replace("LONmin", extent[1])
            .replace("LATmax", extent[2])
            .replace("LONmax", extent[3]);
    }
}
