import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import SortIcon from "mdi-material-ui/Sort";
import { IconPopover } from "components/Reusables";
import * as appActions from "actions/appActions";
import appConfig from "constants/appConfig";
import styles from "components/MainMenu/LayerSearch/LayerSearchListSort.scss";

export class LayerSearchListSort extends Component {
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
                                value={this.props.sortParam}
                                onChange={(evt, val) =>
                                    this.props.appActions.setSearchSortParameter(val)
                                }
                                onClick={evt =>
                                    this.props.appActions.setSearchSortParameter(evt.target.value)
                                }
                            >
                                {appConfig.LAYER_SEARCH.SORT_PARAMS.map(entry => (
                                    <FormControlLabel
                                        key={"sort_" + entry.value}
                                        value={entry.value}
                                        control={<Radio color="primary" />}
                                        label={entry.label}
                                    />
                                ))}
                            </RadioGroup>
                        </FormGroup>
                    </ul>
                </List>
            </IconPopover>
        );
    }
}

LayerSearchListSort.propTypes = {
    sortParam: PropTypes.string.isRequired,
    appActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        sortParam: state.view.getIn(["layerSearch", "sortParameter"])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerSearchListSort);
