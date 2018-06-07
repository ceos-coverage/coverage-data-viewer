import React, { Component } from "react";
import { ChartCreateForm, ChartsList } from "components/Chart";
import styles from "components/Chart/ChartMenu.scss";

export class ChartMenu extends Component {
    render() {
        return (
            <div className={styles.root}>
                <ChartCreateForm />
                <ChartsList />
            </div>
        );
    }
}

export default ChartMenu;
