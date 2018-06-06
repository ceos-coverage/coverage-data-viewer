import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { LabelPopover, EnhancedFormControlLabel } from "components/Reusables";
import appConfig from "constants/appConfig";
import * as appActions from "actions/appActions";
import styles from "components/MainMenu/LayerSearch/LayerSearchFacets.scss";

export class LayerSearchFacets extends Component {
    renderFacetSelector(configFacet, propFacet) {
        let selected = this.props.selectedFacets.get(configFacet.value);
        let subTitle =
            selected.size === 0
                ? "Any"
                : selected.size === 1
                  ? propFacet.find(f => selected.contains(f.get("value"))).get("label")
                  : selected.size + " Selected";
        return (
            <LabelPopover
                key={configFacet.value}
                label={configFacet.label}
                subtitle={subTitle}
                className={styles.facet}
            >
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
                                this.props.appActions.setSearchFacetSelected(
                                    { group: configFacet.value, value: facet.get("value") },
                                    isSelected
                                )
                            }
                        />
                    ))}
                </FormGroup>
            </LabelPopover>
        );
    }

    renderFacets() {
        let facets = appConfig.LAYER_SEARCH.FACETS;
        return facets.map((facet, i) => {
            return this.renderFacetSelector(facet, this.props.facets.get(facet.value));
        });
    }

    render() {
        return <div className={styles.root}>{this.renderFacets()}</div>;
    }
}

LayerSearchFacets.propTypes = {
    facets: PropTypes.object,
    selectedFacets: PropTypes.object,
    appActions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(LayerSearchFacets);
