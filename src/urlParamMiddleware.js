import throttle from "lodash.throttle";
import queryString from "query-string";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import MiscUtil from "_core/utils/MiscUtil";
import appConfig from "constants/appConfig";
import moment from "moment";

const constructFullURLWithParams = (params) => {
    // Return full URL for params where params is an object of
    // url key -> values
    return (
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?" +
        queryString.stringify(params)
    );
};

const updateUrl = (store) => {
    const state = store.getState();

    if (!state.view.get("initialLoadComplete")) {
        return;
    }

    // extract search data
    const layerSearch = state.view.get("layerSearch");
    const searchSelectedArea = layerSearch.getIn(["formOptions", "selectedArea"]).join(",");
    const searchDateRange = [
        layerSearch.getIn(["formOptions", "startDate"]),
        layerSearch.getIn(["formOptions", "endDate"]),
    ]
        .map((x) => moment.utc(x).format("YYYY-MM-DD"))
        .join(",");
    const trackSelectedFacets = JSON.stringify(
        layerSearch.getIn(["formOptions", "trackSelectedFacets"]).filter((x) => x.size > 0)
    );
    const satelliteSelectedFacets = JSON.stringify(
        layerSearch.getIn(["formOptions", "satelliteSelectedFacets"]).filter((x) => x.size > 0)
    );

    // extract date information
    const date = moment.utc(state.map.get("date")).toISOString();
    const dateIntervalScale = state.map.get("dateIntervalScale");
    const dateIntervalSize = state.map.get("dateIntervalSize");
    const animationInfo = state.map.get("animation");
    const animationOpen = animationInfo.get("isOpen");
    const animationRange = animationOpen
        ? [animationInfo.get("startDate"), animationInfo.get("endDate")]
              .map((x) => moment.utc(x).toISOString())
              .join(",")
        : undefined;

    // extract active layer information
    const layers = state.map.get("layers");
    const basemapLayers = layers
        .get(appStringsCore.LAYER_GROUP_TYPE_BASEMAP)
        .filter((layer) => !layer.get("isDisabled") && layer.get("isActive"))
        .toList()
        .sort(MiscUtil.getImmutableObjectSort("displayIndex"))
        .map((x) => x.get("id"))
        .join(",");
    const satelliteLayers = layers
        .get(appStringsCore.LAYER_GROUP_TYPE_DATA)
        .filter((layer) => !layer.get("isDisabled") && layer.get("isActive"))
        .toList()
        .sort(MiscUtil.getImmutableObjectSort("displayIndex"))
        .map((x) => x.get("id"))
        .join(",");
    const insituLayers = layers
        .get(appStrings.LAYER_GROUP_TYPE_INSITU_DATA)
        .filter((layer) => !layer.get("isDisabled") && layer.get("isActive"))
        .toList()
        .sort(MiscUtil.getImmutableObjectSort("displayIndex"))
        .map((x) => `${x.get("id")}|${x.get("vectorColor")}`)
        .join(",");
    const referenceLayers = layers
        .get(appStrings.LAYER_GROUP_TYPE_DATA_REFERENCE)
        .filter((layer) => !layer.get("isDisabled") && layer.get("isActive"))
        .toList()
        .sort(MiscUtil.getImmutableObjectSort("displayIndex"))
        .map((x) => x.get("id"))
        .join(",");

    // extract map view info
    const viewExtent = state.map.getIn(["view", "extent"]).join(",");

    // extract additional info
    const layerInfo = state.view.get("layerInfo") ? state.view.getIn(["layerInfo", "id"]) : "";
    const tabIndex = state.view.get("mainMenuTabIndex");

    // extract charting info
    const charts = state.chart
        .get("charts")
        .reduce((acc, chart) => {
            const formOptions = chart.get("formOptions");
            const tracks = formOptions
                .get("selectedTracks")
                .map((t) => t.id)
                .join("|");
            const xAxis = formOptions.get("xAxis");
            const xAxisLabel = formOptions.get("xAxisLabel");
            const yAxis = formOptions.get("yAxis");
            const yAxisLabel = formOptions.get("yAxisLabel");
            const zAxis = formOptions.get("zAxis") || "";
            const zAxisLabel = formOptions.get("zAxisLabel") || "";

            const displayOptions = chart.get("displayOptions");
            const linkToDateInterval = displayOptions.get("linkToDateInterval");
            const markerType = displayOptions.get("markerType");
            const bounds = displayOptions.get("bounds")
                ? displayOptions
                      .get("bounds")
                      .map((x) => x.toFixed(2))
                      .join("_")
                : "__NONE__";

            acc.push(
                `${tracks}:${xAxis}|${xAxisLabel}|${yAxis}|${yAxisLabel}|${zAxis}|${zAxisLabel}:${linkToDateInterval}|${markerType}|${bounds}`
            );
            return acc;
        }, [])
        .join(",");

    const parsed = {
        [appConfig.URL_KEYS.INSITU_LAYERS]: insituLayers || undefined,
        [appConfig.URL_KEYS.SATELLITE_LAYERS]: satelliteLayers || undefined,
        [appConfig.URL_KEYS.BASEMAP]: basemapLayers || "__NONE__",
        [appConfig.URL_KEYS.VIEW_EXTENT]: viewExtent || undefined,
        [appConfig.URL_KEYS.DATE]: date || undefined,
        [appConfig.URL_KEYS.DATE_INTERVAL]:
            `${dateIntervalSize}__${dateIntervalScale}` || undefined,
        [appConfig.URL_KEYS.SEARCH_AREA]: searchSelectedArea || undefined,
        [appConfig.URL_KEYS.SEARCH_TIME]: searchDateRange || undefined,
        [appConfig.URL_KEYS.INSITU_SEARCH_PARAMS]: trackSelectedFacets || undefined,
        [appConfig.URL_KEYS.SATELLITE_SEARCH_PARAMS]: satelliteSelectedFacets || undefined,
        [appConfig.URL_KEYS.REFERENCE_LAYER]: referenceLayers || undefined,
        [appConfig.URL_KEYS.ANIMATION_DATE_RANGE]: animationRange || undefined,
        [appConfig.URL_KEYS.LAYER_INFO]: layerInfo || undefined,
        [appConfig.URL_KEYS.CHARTS]: charts || undefined,
        [appConfig.URL_KEYS.MENU_TAB]: tabIndex || undefined,
    };
    const newurl = constructFullURLWithParams(parsed);

    window.history.replaceState({ path: newurl }, "", newurl);
};

const throttledUpdateUrl = throttle(updateUrl, 150, {
    leading: true,
    trailing: true,
});

const actionsTriggeringURLUpdate = {
    SET_MAP_VIEW: true,
    SET_SEARCH_FACETS: true,
    SET_SATELLITE_SEARCH_FACETS: true,
    SET_TRACK_SELECTED: true,
    ADD_LAYER: true,
    REMOVE_LAYER: true,
    SET_LAYER_OPACITY: true,
    MOVE_LAYER_UP: true,
    MOVE_LAYER_DOWN: true,
    SET_SEARCH_SELECTED_AREA: true,
    SET_SEARCH_DATE_RANGE: true,
    SET_SEARCH_FACET_SELECTED: true,
    SET_SATELLITE_SEARCH_FACET_SELECTED: true,
    SET_SEARCH_SORT_PARAM: true,
    SET_BASEMAP: true,
    HIDE_BASEMAP: true,
    SET_LAYER_ACTIVE: true,
    SET_MAP_DATE: true,
    SET_DATE_INTERVAL: true,
    SET_ANIMATION_START_DATE: true,
    SET_ANIMATION_END_DATE: true,
    SET_ANIMATION_DATE_RANGE: true,
    SET_ANIMATION_OPEN: true,
    SET_ANIMATION_SPEED: true,
    SET_LAYER_INFO: true,
    INITIALIZE_CHART: true,
    SET_MAIN_MENU_TAB_INDEX: true,
    CLOSE_CHART: true,
    SET_CHART_DISPLAY_OPTIONS: true,
    SET_INSITU_LAYER_COLOR: true,
};

export const urlParamMiddleware = (store) => (next) => (action) => {
    const returnValue = next(action);
    if (actionsTriggeringURLUpdate[action.type]) {
        throttledUpdateUrl(store);
    }
    return returnValue;
};
