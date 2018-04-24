import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Immutable from "immutable";
import List from "material-ui/List";
import SearchIcon from "material-ui-icons/Search";
import { LayerSearchResult } from "components/MainMenu/LayerSearch";
import { AreaDefaultMessage } from "components/Reusables";
import styles from "components/MainMenu/LayerSearch/LayerSearchList.scss";
import MiscUtil from "_core/utils/MiscUtil";

export class LayerSearchList extends Component {
    renderList(trackList) {
        return (
            <List className={styles.list}>
                {trackList.map(track => (
                    <LayerSearchResult
                        key={track.get("id") + "_layer_search_result"}
                        layer={track}
                    />
                ))}
            </List>
        );
    }
    renderEmpty() {
        return (
            <AreaDefaultMessage
                active={true}
                label="No Tracks Found"
                sublabel="try adjusting the search parameters above"
                icon={<SearchIcon />}
            />
        );
    }
    render() {
        let trackList = this.props.searchResults
            .get("results")
            .sort(MiscUtil.getImmutableObjectSort("id"));
        let totalNum = trackList.size;
        let activeNum = trackList.count(el => {
            return el.get("isActive");
        });

        return totalNum > 0 ? this.renderList(trackList) : this.renderEmpty();
    }
}

LayerSearchList.propTypes = {
    searchResults: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        searchResults: state.view.getIn(["layerSearch", "searchResults"])
    };
}

export default connect(mapStateToProps, null)(LayerSearchList);
