/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as mapActions from "_core/actions/mapActions";
import { MapContainer2D } from "components/Map";
import styles from "_core/components/Map/MapContainer.scss";

export class MapContainer extends Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
    }
    componentDidMount() {
        this.containerRef.current.addEventListener("mouseout", (evt) => {
            this.props.mapActions.invalidatePixelHover();
        });
        this.containerRef.current.addEventListener("mouseleave", (evt) => {
            this.props.mapActions.invalidatePixelHover();
        });
    }

    render() {
        return (
            <div ref={this.containerRef} className={styles.mapContainer}>
                <MapContainer2D />
            </div>
        );
    }
}

MapContainer.propTypes = {
    mapActions: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(MapContainer);
