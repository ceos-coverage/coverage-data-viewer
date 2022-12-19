/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import MapUtilCore from "_core/utils/MapUtil";
import MiscUtil from "utils/MiscUtil";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";

export default class MapUtil extends MapUtilCore {
    static extentsIntersect(extent1, extent2) {
        return (
            extent1[0] <= extent2[2] &&
            extent1[2] >= extent2[0] &&
            extent1[1] <= extent2[3] &&
            extent1[3] >= extent2[1]
        );
    }

    static formatLatLon(lat, lon, isValid, padChar = "&nbsp;", fixedLen = 3) {
        let latUnit = lat >= 0 ? "°E" : "°W";
        let lonUnit = lon >= 0 ? "°N" : "°S";

        let currCoord =
            MiscUtil.padNumber(Math.abs(lon).toFixed(fixedLen), 5, padChar) +
            lonUnit +
            "," +
            MiscUtil.padNumber(Math.abs(lat).toFixed(fixedLen), 6, padChar) +
            latUnit;

        return isValid ? currCoord : " ------" + lonUnit + ", ------" + latUnit;
    }

    static findTileExtentsInView(extentsList, extent, zoom) {
        let tilesList = [];
        let entries = extentsList[zoom];

        if (zoom >= 0) {
            if (typeof entries === "object") {
                // search for zoom ids
                entries.map((entry) => {
                    let bounds = entry.bounds.map((val) => {
                        return parseFloat(val);
                    });
                    if (this.extentsIntersect(extent, bounds)) {
                        tilesList.push({
                            tileCoord: entry.tileId.split("/"),
                            extent: bounds,
                        });
                    }
                });
            }

            // recurse if none found
            if (tilesList.length === 0) {
                return this.findTileExtentsInView(extentsList, extent, zoom - 1);
            }
        }

        return {
            tiles: tilesList,
            foundZoom: zoom,
        };
    }

    // deconstrain a lineString arrow to wrap across the dateline if necessary
    // coords: [[x1,y1],[x2,y2],[x1,y1],[x3,y3],[x1,y1],[x4,y4]]
    static deconstrainLineStringArrow(coords) {
        let arrowTip = coords[0];
        let newCoords = coords.map((coord, i) => {
            if (i % 2 !== 0 && Math.abs(arrowTip[0]) > 150) {
                if (arrowTip[0] > 0) {
                    if (coord[0] < 0) {
                        coord[0] += 360;
                    }
                } else {
                    if (coord[0] > 0) {
                        coord[0] -= 360;
                    }
                }
            }
            return coord;
        });

        return newCoords;
    }

    static deconstrainLongitude(lon, preconstrain = true) {
        lon = preconstrain ? MapUtilCore.constrainCoordinates([lon, 0], false)[0] : lon;
        if (lon < 0) {
            return lon + 360;
        } else {
            return lon - 360;
        }
    }

    static constrainExtent(extent, limitY = true) {
        let ul = MapUtilCore.constrainCoordinates([extent[0], extent[3]], limitY);
        let br = MapUtilCore.constrainCoordinates([extent[2], extent[1]], limitY);
        return [ul[0], br[1], br[0], ul[1]];
    }

    static mapColorToValue(options) {
        const { colorData, palette, handleAs, units } = options;

        // extract value
        let value = appStrings.NO_DATA;
        const noData = parseInt(colorData[3]) === 0;
        if (!noData) {
            const paletteValueList = palette.get("values");
            const rgbColor = `rgba(${colorData.slice(0, 3).join(",")})`;
            const hexColor = MiscUtil.getHexFromColorString(rgbColor);
            if (handleAs === appStringsCore.COLORBAR_JSON_RELATIVE) {
                const firstColorEntry = paletteValueList.findEntry((entry) => {
                    return entry && entry.get("color") === hexColor;
                });
                if (typeof firstColorEntry !== "undefined") {
                    const min = parseFloat(layer.get("min"));
                    const max = parseFloat(layer.get("max"));

                    const firstIndex = firstColorEntry[0];
                    const firstColorMap = firstColorEntry[1];

                    // 0 index is mapped to no-data color
                    if (firstIndex === 1) {
                        firstIndex = 0;
                        firstColorMap = paletteValueList.get(0);
                    }

                    const firstScale = firstColorMap.get("value");
                    const firstValue = (min + (max - min) * parseFloat(firstScale)).toFixed(2);

                    const lastColorEntry = paletteValueList.findLastEntry((entry) => {
                        return entry && entry.get("color") === hexColor;
                    });
                    const lastIndex = lastColorEntry[0];
                    const lastColorMap = lastColorEntry[1];

                    const lastScale = lastColorMap.get("value");
                    const lastValue = (min + (max - min) * parseFloat(lastScale)).toFixed(2);

                    if (firstIndex === 0) {
                        value = `<= ${lastValue}`;
                    } else if (lastIndex === paletteValueList.size - 1) {
                        value = `>= ${firstValue}`;
                    } else {
                        const prevColorMap = paletteValueList.get(firstIndex - 1);
                        if (typeof prevColorMap !== "undefined") {
                            const prevScale = prevColorMap.get("value");
                            const prevValue = (min + (max - min) * parseFloat(prevScale)).toFixed(
                                2
                            );
                            value = `${prevValue} - ${lastValue}`;
                        } else {
                            prevColorMap = paletteValueList.get(firstIndex);
                            const prevScale = prevColorMap.get("value");
                            const prevValue = (min + (max - min) * parseFloat(prevScale)).toFixed(
                                2
                            );
                            value = `<= ${prevValue}`;
                        }
                    }

                    value = `${value}${units}`;
                }
            } else {
                const colorEntry = paletteValueList.findLastEntry((entry) => {
                    return entry && entry.get("color") === hexColor;
                });
                if (typeof colorEntry !== "undefined") {
                    const colorMap = colorEntry[1];
                    value = `${colorMap.get("value")}${units}`;
                } else {
                    value = appStrings.UNKNOWN;
                    // console.log(hexColor);
                }
            }
        }
        return value;
    }
}
