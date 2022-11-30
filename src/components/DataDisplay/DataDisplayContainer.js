import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Paper from "@material-ui/core/Paper";
import { DataDisplay } from "components/DataDisplay";
import { MouseCoordinates } from "_core/components/MouseFollower";
import textStyles from "_core/styles/text.scss";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/DataDisplay/DataDisplayContainer.scss";

export class DataDisplayContainer extends Component {
    render() {
        const dataAvailable =
            this.props.pixelCoordinate.get("isValid") &&
            this.props.pixelCoordinate.get("data").size > 0;

        const containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [styles.noData]: !dataAvailable,
            [this.props.className]: typeof this.props.className !== "undefined",
        });

        const coordinateWrapperClasses = MiscUtil.generateStringFromSet({
            [styles.coordinateWrapper]: true,
            [styles.noData]: !dataAvailable,
        });

        const coordinateClasses = MiscUtil.generateStringFromSet({
            [textStyles.fontRobotoMono]: true,
            [styles.coordinates]: true,
        });

        return (
            <Paper elevation={2} className={containerClasses}>
                {dataAvailable ? (
                    <Paper elevation={2} className={styles.valueWrapper}>
                        {this.props.pixelCoordinate.get("data").map((entry, i) => (
                            <DataDisplay key={"mouse-follow-data-" + i} data={entry} />
                        ))}
                    </Paper>
                ) : null}
                <Paper elevation={1} className={coordinateWrapperClasses}>
                    <MouseCoordinates className={coordinateClasses} />
                </Paper>
            </Paper>
        );
    }
}

DataDisplayContainer.propTypes = {
    pixelCoordinate: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    return {
        pixelCoordinate: state.map.getIn(["view", "pixelHoverCoordinate"]),
    };
}

export default connect(mapStateToProps, null)(DataDisplayContainer);
