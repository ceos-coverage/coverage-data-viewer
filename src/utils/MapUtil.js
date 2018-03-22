import MapUtilCore from "_core/utils/MapUtil";

export default class MapUtil extends MapUtilCore {
    static extentsIntersect(extent1, extent2) {
        return (
            extent1[0] <= extent2[2] &&
            extent1[2] >= extent2[0] &&
            extent1[1] <= extent2[3] &&
            extent1[3] >= extent2[1]
        );
    }

    static findTileExtentsInView(extentsList, extent, zoom) {
        let tilesList = [];
        let entries = extentsList[zoom];

        if (zoom >= 0) {
            if (typeof entries === "object") {
                // search for zoom ids
                entries.map(entry => {
                    let bounds = entry.bounds.map(val => {
                        return parseFloat(val);
                    });
                    if (this.extentsIntersect(extent, bounds)) {
                        tilesList.push({
                            tileCoord: entry.tileId.split("/"),
                            extent: bounds
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
            foundZoom: zoom
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
}
