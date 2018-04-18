import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import EarthIcon from "material-ui-icons/Public";
import EditIcon from "material-ui-icons/ModeEdit";
import CloseIcon from "material-ui-icons/Close";
import { SearchInput, AreaSelectionForm } from "components/Reusables";
import MiscUtil from "utils/MiscUtil";

export class AreaSelectionInput extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [this.props.className]: typeof this.props.className !== "undefined"
        });

        let label =
            typeof this.props.selectedArea !== "undefined" && this.props.selectedArea.size > 0
                ? this.props.selectedArea.join(", ")
                : "Select Area";
        return (
            <SearchInput
                label={label}
                placeholder="placeholder"
                className={containerClasses}
                leftAction={{
                    icon: <EarthIcon />
                }}
                rightAction={[
                    {
                        icon: <CloseIcon />,
                        onClick: () => {
                            console.log("BOO 2");
                        }
                    }
                ]}
            >
                <AreaSelectionForm selectedArea={this.props.selectedArea} />
            </SearchInput>
        );
    }
}

AreaSelectionInput.propTypes = {
    selectedArea: PropTypes.object,
    onSelect: PropTypes.func,
    onClear: PropTypes.func,
    className: PropTypes.string
};

export default AreaSelectionInput;
