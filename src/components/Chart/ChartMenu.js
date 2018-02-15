import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
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

ChartMenu.propTypes = {};

export default connect()(ChartMenu);
