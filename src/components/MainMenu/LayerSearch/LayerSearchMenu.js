import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { LayerSearchForm, LayerSearchList } from "components/MainMenu/LayerSearch";
import styles from "components/MainMenu/LayerSearch/LayerSearchMenu.scss";

export class LayerSearchMenu extends Component {
    render() {
        return (
            <div className={styles.root}>
                <LayerSearchForm />
                <div className={styles.list}>
                    <LayerSearchList />
                </div>
            </div>
        );
    }
}

LayerSearchMenu.propTypes = {};

export default connect()(LayerSearchMenu);
