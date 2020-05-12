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
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import { Button } from "@material-ui/core";
import { LabelPopover, EnhancedFormControlLabel } from "components/Reusables";
import appConfig from "constants/appConfig";
import * as appActions from "actions/appActions";
import styles from "components/MainMenu/SatelliteLayerSearch/SatelliteLayerSearchFacets.scss";

export class SatelliteLayerSearchFacets extends Component {
    renderFacetSelector(configFacet, propFacet) {
        let selected = this.props.selectedFacets.get(configFacet.value);
        let subTitle =
            selected.size === 0
                ? "Any"
                : selected.size === 1
                ? propFacet.find(f => selected.contains(f.get("value"))).get("label")
                : selected.size + " Selected";

        if (propFacet.size === 0) {
            return (
                <LabelPopover
                    key={"facet_" + configFacet.value}
                    label={configFacet.label}
                    subtitle={subTitle}
                    className={styles.facet}
                    contentClass={`${styles.facetContent} ${styles.empty}`}
                >
                    <div className={`${styles.optionsList} ${styles.empty}`}>No values found</div>
                </LabelPopover>
            );
        } else {
            return (
                <LabelPopover
                    key={"facet_" + configFacet.value}
                    label={configFacet.label}
                    subtitle={subTitle}
                    className={styles.facet}
                    contentClass={styles.facetContent}
                >
                    <div className={styles.optionsList}>
                        <FormGroup>
                            {propFacet.map((facet, i) => (
                                <EnhancedFormControlLabel
                                    key={configFacet.value + "_" + i}
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={selected.contains(facet.get("value"))}
                                            value={facet.get("value")}
                                        />
                                    }
                                    label={facet.get("label")}
                                    rightLabel={facet.get("cnt")}
                                    onChange={(evt, isSelected) =>
                                        this.props.appActions.setSatelliteSearchFacetSelected(
                                            { group: configFacet.value, value: facet.get("value") },
                                            isSelected
                                        )
                                    }
                                />
                            ))}
                        </FormGroup>
                    </div>
                    <div className={styles.clearRow}>
                        <Button
                            size="small"
                            variant="text"
                            color="primary"
                            onClick={() =>
                                this.props.appActions.clearSatelliteSearchFacet(configFacet.value)
                            }
                            className={styles.clearBtn}
                        >
                            clear
                        </Button>
                    </div>
                </LabelPopover>
            );
        }
    }

    renderFacets() {
        let facets = appConfig.SATELLITE_LAYER_SEARCH.FACETS;
        return facets.map((facet, i) => {
            return this.renderFacetSelector(facet, this.props.facets.get(facet.value));
        });
    }

    render() {
        return <div className={styles.root}>{this.renderFacets()}</div>;
    }
}

SatelliteLayerSearchFacets.propTypes = {
    facets: PropTypes.object,
    selectedFacets: PropTypes.object,
    appActions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(
    null,
    mapDispatchToProps
)(SatelliteLayerSearchFacets);
