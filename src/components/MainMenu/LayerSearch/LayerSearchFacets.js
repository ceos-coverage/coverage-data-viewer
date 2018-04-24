import React, { Component } from "react";
import PropTypes from "prop-types";
import Radio, { RadioGroup } from "material-ui/Radio";
import Checkbox from "material-ui/Checkbox";
import { FormControl, FormGroup, FormControlLabel } from "material-ui/Form";
import { LabelPopover } from "components/Reusables";
import styles from "components/MainMenu/LayerSearch/LayerSearchFacets.scss";

export class LayerSearchFacets extends Component {
    render() {
        return (
            <div className={styles.root}>
                <LabelPopover label="Variable" subtitle="Any" className={styles.facet}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a304" />}
                            label="depth"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a303" />}
                            label="ext_temp"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a303" />}
                            label="light"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a304" />}
                            label="pressure"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a304" />}
                            label="salinity"
                        />
                    </FormGroup>
                </LabelPopover>
                <LabelPopover label="Platform" subtitle="Tuna" className={styles.facet}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a304" />}
                            label="Buoy"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a303" />}
                            label="Dolphin"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a304" />}
                            label="Shark"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a304" />}
                            label="Ship"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={true} value="tuna_a303" />}
                            label="Tuna"
                        />
                    </FormGroup>
                </LabelPopover>
                <LabelPopover label="Sensor" subtitle="Any" className={styles.facet}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a303" />}
                            label="Animal Tag X3K"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a304" />}
                            label="Buoy 44Z"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a304" />}
                            label="Ship Sensor Line"
                        />
                    </FormGroup>
                </LabelPopover>
                <LabelPopover label="Project" subtitle="2 Selected" className={styles.facet}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={true} value="tuna_a303" />}
                            label="PO.DAAC"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={false} value="tuna_a304" />}
                            label="Project Name"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={true} value="tuna_a304" />}
                            label="SPURS"
                        />
                    </FormGroup>
                </LabelPopover>
            </div>
        );
    }
}

LayerSearchFacets.propTypes = {
    facets: PropTypes.object,
    onChange: PropTypes.func
};

export default LayerSearchFacets;
