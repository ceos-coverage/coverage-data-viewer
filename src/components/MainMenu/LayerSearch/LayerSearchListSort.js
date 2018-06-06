import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import SortIcon from "mdi-material-ui/Sort";
import { IconPopover } from "components/Reusables";
import * as appStrings from "constants/appStrings";
import * as appActions from "actions/appActions";
import styles from "components/MainMenu/LayerSearch/LayerSearchListSort.scss";

export class LayerSearchListSort extends Component {
    handleSortOptionSelect(val) {
        if (val) {
            console.log(val);
        }
    }

    render() {
        return (
            <IconPopover icon={<SortIcon />} contentClass={styles.content}>
                <List subheader={<li />}>
                    <ul className={styles.dummyList}>
                        <ListSubheader className={styles.subheader}>Sort By</ListSubheader>
                        <FormGroup className={styles.form}>
                            <RadioGroup
                                aria-label="search_list_sort"
                                name="search_list_sort"
                                value={"project"}
                                onChange={(evt, val) => this.handleSortOptionSelect(val)}
                                onClick={evt => this.handleSortOptionSelect(evt.target.value)}
                            >
                                <FormControlLabel
                                    value={"platform"}
                                    control={<Radio color="primary" />}
                                    label={"Platform"}
                                />
                                <FormControlLabel
                                    value={"sensor"}
                                    control={<Radio color="primary" />}
                                    label={"Sensor"}
                                />
                                <FormControlLabel
                                    value={"project"}
                                    control={<Radio color="primary" />}
                                    label={"Project"}
                                />
                            </RadioGroup>
                        </FormGroup>
                    </ul>
                </List>
            </IconPopover>
        );
    }
}

LayerSearchListSort.propTypes = {
    appActions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(LayerSearchListSort);
