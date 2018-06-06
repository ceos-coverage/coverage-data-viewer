import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Immutable from "immutable";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import SearchIcon from "@material-ui/icons/Search";
import { LayerSearchResult } from "components/MainMenu/LayerSearch";
import { AreaDefaultMessage } from "components/Reusables";
import { LoadingSpinner } from "_core/components/Reusables";
import * as appActions from "actions/appActions";
import styles from "components/MainMenu/LayerSearch/LayerSearchList.scss";
import MiscUtil from "_core/utils/MiscUtil";

export class LayerSearchList extends Component {
    renderList(trackList) {
        // group the tracks
        let groups = trackList.reduce((acc, track) => {
            let title = track.getIn(["insituMeta", "project"]);
            if (acc.length === 0) {
                acc.push({ title: title, tracks: [track] });
                return acc;
            } else if (acc[acc.length - 1].title !== title) {
                acc.push({ title: title, tracks: [track] });
            } else {
                acc[acc.length - 1].tracks.push(track);
            }

            return acc;
        }, []);

        // sort the tracks
        for (let i = 0; i < groups.length; ++i) {
            groups[i].tracks.sort((a, b) => a.get("title") > b.get("title"));
        }

        // render the list
        return (
            <List className={styles.list} subheader={<li />}>
                {groups.map((group, i) => (
                    <ul key={"sublist_" + i} className={styles.dummyList}>
                        <ListSubheader className={styles.subheader}>{group.title}</ListSubheader>
                        {group.tracks.map(track => (
                            <LayerSearchResult
                                key={track.get("id") + "_layer_search_result"}
                                layer={track}
                                selected={this.props.selectedTracks.includes(track.get("id"))}
                                onSelect={this.props.actions.setTrackSelected}
                            />
                        ))}
                    </ul>
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
            .sortBy(entry => entry.getIn(["insituMeta", "project"]));
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
