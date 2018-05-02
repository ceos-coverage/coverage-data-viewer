import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Immutable from "immutable";
import List from "material-ui/List";
import SearchIcon from "material-ui-icons/Search";
import { LayerSearchResult } from "components/MainMenu/LayerSearch";
import { AreaDefaultMessage } from "components/Reusables";
import { LoadingSpinner } from "_core/components/Reusables";
import * as appActions from "actions/appActions";
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
                        selected={this.props.selectedTracks.includes(track.get("id"))}
                        onSelect={this.props.actions.setTrackSelected}
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

    renderLoading() {
        return (
            <div className={styles.loading}>
                <LoadingSpinner className={styles.spinner} />
            </div>
        );
    }

    render() {
        let trackList = this.props.searchResults
            .get("results")
            .toList()
            .sort(MiscUtil.getImmutableObjectSort("title"));
        let totalNum = trackList.size;
        let isLoading = this.props.searchResults.get("isLoading");

        return isLoading
            ? this.renderLoading()
            : totalNum > 0 ? this.renderList(trackList) : this.renderEmpty();
    }
}

LayerSearchList.propTypes = {
    searchResults: PropTypes.object.isRequired,
    selectedTracks: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        searchResults: state.view.getIn(["layerSearch", "searchResults"]),
        selectedTracks: state.view.getIn(["layerSearch", "selectedTracks"])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            setTrackSelected: bindActionCreators(appActions.setTrackSelected, dispatch)
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerSearchList);
