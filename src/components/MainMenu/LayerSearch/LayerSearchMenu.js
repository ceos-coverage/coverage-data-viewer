import React, { Component } from "react";
import PropTypes from "prop-types";
import { LayerSearchForm, LayerSearchList } from "components/MainMenu/LayerSearch";
import styles from "components/MainMenu/LayerSearch/LayerSearchMenu.scss";

export class LayerSearchMenu extends Component {
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.form}>
                    <LayerSearchForm />
                </div>
                <div className={styles.list}>
                    <LayerSearchList />
                </div>
            </div>
        );
    }
}

LayerSearchMenu.propTypes = {};

export default LayerSearchMenu;
