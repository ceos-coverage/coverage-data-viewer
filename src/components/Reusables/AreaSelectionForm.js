import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";
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

    getErrorString() {
        let north = this.inputBounds.north;
        let south = this.inputBounds.south;
        let east = this.inputBounds.east;
        let west = this.inputBounds.west;

        this.inputBounds.errors.north = north < south ? true : false;
        this.inputBounds.errors.south = north < south ? true : false;
        this.inputBounds.errors.east = east < west ? true : false;
        this.inputBounds.errors.west = east < west ? true : false;

        this.inputBounds.errors.north = Math.abs(north) > 90 ? true : false;
        this.inputBounds.errors.south = Math.abs(south) > 90 ? true : false;
        this.inputBounds.errors.east = Math.abs(east) > 180 ? true : false;
        this.inputBounds.errors.west = Math.abs(west) > 180 ? true : false;
    }

    render() {
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
                        color="primary"
                        onClick={() => console.log("WILE")}
                    >
                        Submit
                    </Button>
                </Grid>
            </div>
        );
    }
}

AreaSelectionForm.propTypes = {
    selectedArea: PropTypes.array,
    onSubmit: PropTypes.func,
    onClear: PropTypes.func,
    className: PropTypes.string
};

export default connect()(AreaSelectionForm);
