import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Immutable from "immutable";
import List from "material-ui/List";
import * as appStrings from "constants/appStrings";
import { LayerSearchResult } from "components/MainMenu/LayerSearch";
import MiscUtil from "_core/utils/MiscUtil";

export class LayerSearchList extends Component {
    render() {
        let layerList = this.props.layers
            ? this.props.layers
                  .filter(layer => !layer.get("isDisabled"))
                  .toList()
                  .sort(MiscUtil.getImmutableObjectSort("title"))
            : new Immutable.List();
        let totalNum = layerList.size;
        let activeNum = layerList.count(el => {
            return el.get("isActive");
        });

        return (
            <List>
                {layerList.map(layer => (
                    <LayerSearchResult
                        key={layer.get("id") + "_layer_search_result"}
                        layer={layer}
                    />
                ))}
            </List>
        );
    }
}

LayerSearchList.propTypes = {
    layers: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        layers: state.map.getIn(["layers", appStrings.LAYER_GROUP_TYPE_INSITU_DATA])
    };
}

export default connect(mapStateToProps, null)(LayerSearchList);
