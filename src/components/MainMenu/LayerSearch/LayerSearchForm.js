import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Paper from "material-ui/Paper";
import Grid from "material-ui/Grid";
import Button from "material-ui/Button";
import { Typography, Divider } from "material-ui";
import SortIcon from "mdi-material-ui/Sort";
import { DateRangePicker, AreaSelectionInput, IconPopover } from "components/Reusables";
import {
    LayerSearchFacets,
    LayerSearchResultsLabel,
    LayerSearchListSort
} from "components/MainMenu/LayerSearch";
import * as appActions from "actions/appActions";
import styles from "components/MainMenu/LayerSearch/LayerSearchForm.scss";

export class LayerSearchForm extends Component {
    render() {
        return (
            <Paper elevation={3} className={styles.root}>
                <AreaSelectionInput
                    className={styles.topField}
                    selectedArea={this.props.searchOptions.get("selectedArea")}
                />
                <DateRangePicker
                    className={styles.topField}
                    startDate={this.props.searchOptions.get("startDate")}
                    endDate={this.props.searchOptions.get("endDate")}
                    onUpdate={this.props.appActions.setSearchDateRange}
                />
                <Grid container alignItems="center" className={styles.facetRow}>
                    <Grid item xs={10} className={styles.rowItem}>
                        <LayerSearchFacets
                            facets={this.props.searchOptions.get("searchFacets")}
                            selectedFacets={this.props.searchOptions.get("selectedFacets")}
                        />
                    </Grid>
                    <Grid item xs={2} className={styles.rowItem}>
                        <Button
                            size="small"
                            variant="raised"
                            color="primary"
                            onClick={this.props.appActions.runLayerSearch}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container alignItems="center" className={styles.resultsRow}>
                    <Grid item xs={10} className={styles.rowItem}>
                        <LayerSearchResultsLabel className={styles.resultLabel} />
                    </Grid>
                    <Grid item xs={2} className={styles.rowItem}>
                        <LayerSearchListSort />
                    </Grid>
                </Grid>
            </Paper>
        );
    }
}

LayerSearchForm.propTypes = {
    searchOptions: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        searchOptions: state.view.getIn(["layerSearch", "formOptions"])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerSearchForm);
