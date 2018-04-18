import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import * as mapActions from "actions/mapActions";
import * as mapActionsCore from "_core/actions/mapActions";
import appConfig from "constants/appConfig";
import styles from "components/Reusables/AreaSelectionForm.scss";

export class AreaSelectionForm extends Component {
    constructor(props) {
        super(props);

        this.inputBounds = {
            north: 90,
            south: -90,
            east: 180,
            west: -180,
            errors: {
                north: false,
                south: false,
                east: false,
                west: false
            }
        };
    }

    updateBoundsFromProps() {
        if (typeof this.props.selectedArea !== "undefined" && this.props.selectedArea.size === 4) {
            this.inputBounds.north = this.props.selectedArea.get(3);
            this.inputBounds.south = this.props.selectedArea.get(1);
            this.inputBounds.east = this.props.selectedArea.get(2);
            this.inputBounds.west = this.props.selectedArea.get(0);
        } else {
            this.inputBounds.north = this.inputBounds.north || 90.0;
            this.inputBounds.south = this.inputBounds.south || -90.0;
            this.inputBounds.east = this.inputBounds.east || 180.0;
            this.inputBounds.west = this.inputBounds.west || -180.0;
        }
    }

    getErrorString() {
        let north = this.inputBounds.north;
        let south = this.inputBounds.south;
        let east = this.inputBounds.east;
        let west = this.inputBounds.west;

        this.inputBounds.errors.north = false;
        this.inputBounds.errors.south = false;
        this.inputBounds.errors.east = false;
        this.inputBounds.errors.west = false;

        this.inputBounds.errors.north = north < south ? true : this.inputBounds.errors.north;
        this.inputBounds.errors.south = north < south ? true : this.inputBounds.errors.south;
        // this.inputBounds.errors.east = east < west ? true : this.inputBounds.errors.east;
        // this.inputBounds.errors.west = east < west ? true : this.inputBounds.errors.west;

        this.inputBounds.errors.north = Math.abs(north) > 90 ? true : this.inputBounds.errors.north;
        this.inputBounds.errors.south = Math.abs(south) > 90 ? true : this.inputBounds.errors.south;
        this.inputBounds.errors.east = Math.abs(east) > 180 ? true : this.inputBounds.errors.east;
        this.inputBounds.errors.west = Math.abs(west) > 180 ? true : this.inputBounds.errors.west;
    }

    startDrawing() {
        this.props.enableAreaSelection(appStrings.GEOMETRY_BOX);
    }

    updateBound(key, val) {
        this.inputBounds[key] = parseFloat(val);
    }

    submitArea() {
        let area = [
            this.inputBounds.west,
            this.inputBounds.south,
            this.inputBounds.east,
            this.inputBounds.north
        ];
        this.props.setSelectedArea(area, appStrings.GEOMETRY_BOX);

        this.props.addGeometryToMap(
            {
                type: appStrings.GEOMETRY_BOX,
                id: "area-selection_" + Math.random(),
                proj: appConfig.DEFAULT_PROJECTION,
                coordinates: area,
                coordinateType: appStringsCore.COORDINATE_TYPE_CARTOGRAPHIC
            },
            appStrings.INTERACTION_AREA_SELECTION,
            false
        );

        if (typeof this.props.onSubmit === "function") {
            this.props.onSubmit();
        }
    }

    render() {
        this.updateBoundsFromProps();

        let north = parseFloat(this.inputBounds.north).toString();
        let south = parseFloat(this.inputBounds.south).toString();
        let east = parseFloat(this.inputBounds.east).toString();
        let west = parseFloat(this.inputBounds.west).toString();

        return (
            <div className={styles.root}>
                <Grid container justify="center">
                    <Grid item xs={5}>
                        <TextField
                            id="north_bound"
                            defaultValue={north}
                            label="North"
                            margin="dense"
                            fullWidth={true}
                            onChange={evt => this.updateBound("north", evt.target.value)}
                            inputProps={{
                                type: "number"
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container justify="space-between">
                    <Grid item xs={5}>
                        <TextField
                            id="west_bound"
                            defaultValue={west}
                            label="West"
                            margin="dense"
                            fullWidth={true}
                            onChange={evt => this.updateBound("west", evt.target.value)}
                            inputProps={{
                                type: "number"
                            }}
                        />
                    </Grid>
                    <Grid item xs={5}>
                        <TextField
                            id="east_bound"
                            defaultValue={east}
                            label="East"
                            margin="dense"
                            fullWidth={true}
                            onChange={evt => this.updateBound("east", evt.target.value)}
                            inputProps={{
                                type: "number"
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container justify="center">
                    <Grid item xs={5}>
                        <TextField
                            id="south_bound"
                            defaultValue={south}
                            label="South"
                            margin="dense"
                            fullWidth={true}
                            onChange={evt => this.updateBound("south", evt.target.value)}
                            inputProps={{
                                type: "number"
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container justify="flex-end" className={styles.btnRow}>
                    <Button
                        variant="flat"
                        size="small"
                        color="default"
                        onClick={() => console.log("Tower")}
                    >
                        Clear
                    </Button>
                    <Button
                        variant="flat"
                        size="small"
                        color="default"
                        onClick={() => this.startDrawing()}
                    >
                        Draw
                    </Button>
                    <Button
                        variant="flat"
                        size="small"
                        color="primary"
                        onClick={() => this.submitArea()}
                    >
                        Submit
                    </Button>
                </Grid>
            </div>
        );
    }
}

AreaSelectionForm.propTypes = {
    selectedArea: PropTypes.object,
    onSubmit: PropTypes.func,
    onClear: PropTypes.func,
    className: PropTypes.string,
    enableAreaSelection: PropTypes.func.isRequired,
    disableAreaSelection: PropTypes.func.isRequired,
    addGeometryToMap: PropTypes.func.isRequired,
    removeAllAreaSelections: PropTypes.func.isRequired,
    setMapView: PropTypes.func.isRequired,
    setSelectedArea: PropTypes.func.isRequired
};

function mapDisatchToProps(dispatch) {
    return {
        enableAreaSelection: bindActionCreators(mapActions.enableAreaSelection, dispatch),
        disableAreaSelection: bindActionCreators(mapActions.disableAreaSelection, dispatch),
        removeAllAreaSelections: bindActionCreators(mapActions.removeAllAreaSelections, dispatch),
        addGeometryToMap: bindActionCreators(mapActionsCore.addGeometryToMap, dispatch),
        setMapView: bindActionCreators(mapActionsCore.setMapView, dispatch),
        setSelectedArea: bindActionCreators(mapActions.setSelectedArea, dispatch)
    };
}

export default connect(null, mapDisatchToProps)(AreaSelectionForm);
