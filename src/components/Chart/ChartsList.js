import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Chart } from "components/Chart";
import MiscUtil from "utils/MiscUtil";
import styles from "components/Chart/ChartsList.scss";

export class ChartsList extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true
        });
        let chartsList = this.props.charts.reduceRight((acc, chart) => {
            acc.push(<Chart key={"chart_container_" + chart.get("id")} chart={chart} />);
            return acc;
        }, []);
        return (
            <div className={containerClasses}>
                <div className={styles.list}>{chartsList}</div>
            </div>
        );
    }
}

ChartsList.propTypes = {
    charts: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        charts: state.chart.get("charts")
    };
}

export default connect(mapStateToProps, null)(ChartsList);
