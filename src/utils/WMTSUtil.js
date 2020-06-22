import MiscUtil from "utils/MiscUtil";
import * as appStringsCore from "_core/constants/appStrings";

export class WMTSUtil {
    static _WMTS_CACHE = {};
    static _PARSED_WMTS_CACHE = {};

    static getWMTSData(url) {
        return new Promise((resolve, reject) => {
            if (this._WMTS_CACHE[url]) {
                resolve(this._WMTS_CACHE[url]);
            } else {
                MiscUtil.asyncFetch({
                    url,
                    handleAs: appStringsCore.FILE_TYPE_XML,
                    options: { credentials: "same-origin" }
                })
                    .then(xmlString => {
                        this._WMTS_CACHE[url] = xmlString;
                        resolve(xmlString);
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    }

    static parseXML(xmlTxt) {
        if (window.DOMParser) {
            const parser = new DOMParser();
            return parser.parseFromString(xmlTxt, "text/xml");
        }
        return null;
    }

    static getGIBSColormapFromURL(colormapUrl, name = "colorbar") {
        return new Promise((resolve, reject) => {
            if (!colormapUrl) {
                reject(null);
            }

            // check cache
            const p = this._WMTS_CACHE[colormapUrl]
                ? new Promise(resolve => resolve(this._WMTS_CACHE[colormapUrl]))
                : MiscUtil.asyncFetch({
                      url: colormapUrl,
                      handleAs: appStringsCore.FILE_TYPE_XML,
                      options: { credentials: "same-origin" }
                  });

            p.then(data => {
                this._WMTS_CACHE[colormapUrl] = data;

                // parse the document
                const xmlDoc = this.parseXML(data);

                if (!xmlDoc) {
                    reject(null);
                }

                const maps = xmlDoc.getElementsByTagName("ColorMap");

                // attempt to filter out the no data map
                let map;
                for (let i = 0; i < maps.length; ++i) {
                    map = maps[i];
                    if (
                        map.getAttribute("title") &&
                        map.getAttribute("title").toLowerCase() !== "no data"
                    ) {
                        break;
                    }
                }

                const units = map.getAttribute("units");
                const legend = map.getElementsByTagName("Legend")[0];
                if (legend) {
                    const legendEntries = legend.getElementsByTagName("LegendEntry");

                    const min = legend.getAttribute("minLabel");
                    const max = legend.getAttribute("maxLabel");

                    const values = [];
                    for (let i = 0; i < legendEntries.length; ++i) {
                        const ent = legendEntries[i];
                        const rgb = ent.getAttribute("rgb");
                        const value = ent.getAttribute("tooltip");
                        values.push([value, rgb]);
                    }

                    resolve({
                        name,
                        values,
                        min,
                        max,
                        units,
                        handleAs: appStringsCore.COLORBAR_JSON_FIXED
                    });
                } else {
                    const colorEntries = map.getElementsByTagName("ColorMapEntry");

                    const values = [];
                    for (let i = 0; i < colorEntries.length; ++i) {
                        const ent = colorEntries[i];
                        const rgb = ent.getAttribute("rgb");
                        const value = ent.getAttribute("label");
                        values.push([value, rgb]);
                    }

                    const min = map.getAttribute("minLabel") || values[0][0];
                    const max = map.getAttribute("maxLabel") || values[values.length - 1][0];

                    resolve({
                        name,
                        values,
                        min,
                        max,
                        units,
                        handleAs: appStringsCore.COLORBAR_JSON_FIXED
                    });
                }
            }).catch(err => reject(err));
        });
    }

    static getGIBSColormapFromCapabilities(wmtsCapTxt, config) {
        return new Promise((resolve, reject) => {
            // parse the document
            const xmlDoc = this.parseXML(wmtsCapTxt);

            if (!xmlDoc) {
                reject(null);
            }

            // find the layer node
            let layer;
            const contents = xmlDoc.getElementsByTagName("Contents")[0];
            const layers = contents.getElementsByTagName("Layer");
            for (let i = 0; i < layers.length; ++i) {
                const l = layers[i];
                const idNode = l.getElementsByTagName("ows:Identifier")[0];
                const id = idNode.textContent;

                if (id === config.layer) {
                    layer = l;
                    break;
                }
            }

            if (!layer) {
                reject(null);
            }

            // find the colorbar url
            const metadataNodes = layer.getElementsByTagName("ows:Metadata");
            let colormapUrl;
            for (let i = 0; i < metadataNodes.length; ++i) {
                const m = metadataNodes[i];
                const role = m.getAttribute("xlink:role");
                const href = m.getAttribute("xlink:href");
                if (role === "http://earthdata.nasa.gov/gibs/metadata-type/colormap/1.3") {
                    colormapUrl = href;
                    break;
                }
            }

            this.getGIBSColormapFromURL(colormapUrl, config.layer)
                .then(data => resolve(data))
                .catch(err => reject(err));
        });
    }
}
