import Immutable from "immutable";
import appConfig from "constants/appConfig";
import * as appStrings from "constants/appStrings";
import { mapState as mapStateCore, layerModel as layerModelCore } from "_core/reducers/models/map";

export const mapState = mapStateCore.mergeDeep(
    Immutable.fromJS({
        layers: {
            insitu_data: {}
        },
        view: {
            pixelHoverCoordinate: {
                data: [],
                showData: true
            }
        }
    })
);

export const layerModel = layerModelCore.mergeDeep(
    Immutable.fromJS({
        insituMeta: {
            variables: []
        },
        vectorColor: appConfig.INSITU_VECTOR_COLORS[0]
    })
);
