import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ChartIcon from "mdi-material-ui/PollBox";
import { Chart } from "components/Chart";
import { AreaDefaultMessage } from "components/Reusables";
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
                <AreaDefaultMessage
                    active={this.props.charts.size === 0}
                    label="Create a Chart"
                    sublabel="use the options above to create a new chart"
                    icon={<ChartIcon />}
                />
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
