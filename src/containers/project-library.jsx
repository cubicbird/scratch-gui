import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import LibraryComponent from '../components/library/library.jsx';
import api from '../lib/api';
import {setProjectTitle} from '../reducers/project-title';
import {connect} from 'react-redux';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Project',
        description: 'Heading for the project library',
        id: 'gui.projectLibrary.chooseAProject'
    }
});

class ProjectLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            myProjects: []
        };
        bindAll(this, [
            'handleItemSelect',
            'handleFetchProjectsSuccess'
        ]);
    }

    componentDidMount () {
        api.fetch_my_projects(this.handleFetchProjectsSuccess, err => console.log(err));
    }

    handleFetchProjectsSuccess (projects) {
        this.setState({myProjects: projects});
    }

    handleItemSelect (item) {
        this.props.onProjectClick(item.name);
        window.location.hash = item.md5ext;
    }

    render () {
        const {myProjects} = this.state;
        return (
            <LibraryComponent
                data={myProjects}
                id="projectLibrary"
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
                getIconURLFromIconMd5={this.props.getIconURLFromIconMd5}
            />
        );
    }
}

ProjectLibrary.propTypes = {
    intl: intlShape.isRequired,
    onActivateBlocksTab: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    onProjectClick: PropTypes.func,
    getIconURLFromIconMd5: PropTypes.func
};


ProjectLibrary.defaultProps = {
    getIconURLFromIconMd5: (iconMd5, iconRawURL) => (iconMd5 ?
        api.getAssetUrlForGet(iconMd5, 'thumbnail') :
        iconRawURL)
};

const mapDispatchToProps = dispatch => ({
    onProjectClick: title => dispatch(setProjectTitle(title))
});

export default injectIntl(connect(
    null,
    mapDispatchToProps
)(ProjectLibrary));
