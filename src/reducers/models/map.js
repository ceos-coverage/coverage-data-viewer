import Immutable from "immutable";
import appConfig from "constants/appConfig";
import * as appStrings from "constants/appStrings";
import { mapState as mapStateCore, layerModel as layerModelCore } from "_core/reducers/models/map";

export const mapState = mapStateCore.mergeDeep(
    Immutable.fromJS({
        dateIntervalScale: "day",
        dateIntervalSize: 1,
        intervalDate: appConfig.DEFAULT_DATE,
        layers: {
            insitu_data: {}
        },
        view: {
            pixelHoverCoordinate: {
                data: [],
                showData: true
            }
        },
        areaSelection: {
            isAreaSelectionEnabled: false,
            geometryType: ""
        }
    })
);

export const layerModel = layerModelCore.mergeDeep(
    Immutable.fromJS({
        insituMeta: {
            variables: Immutable.Set(["time", "depth", "temperature"])
        },
        isLoading: false,
        vectorColor: appConfig.INSITU_VECTOR_COLORS[0]
    })
);
