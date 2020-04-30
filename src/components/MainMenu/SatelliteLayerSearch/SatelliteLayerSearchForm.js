/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { Divider } from "@material-ui/core";
import { DateRangePicker, AreaSelectionInput } from "components/Reusables";
import { SatelliteLayerSearchResultsLabel } from "components/MainMenu/SatelliteLayerSearch";
import * as appActions from "actions/appActions";
import styles from "components/MainMenu/SatelliteLayerSearch/SatelliteLayerSearchForm.scss";

export class SatelliteLayerSearchForm extends Component {
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
                        <SatelliteLayerSearchResultsLabel className={styles.resultLabel} />
                    </Grid>
                    <Grid item xs={2} className={styles.rowItem}>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={this.props.appActions.runLayerSearch}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
                <Divider />
            </Paper>
        );
    }
}

SatelliteLayerSearchForm.propTypes = {
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SatelliteLayerSearchForm);
