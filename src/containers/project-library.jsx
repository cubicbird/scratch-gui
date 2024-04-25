import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import LibraryComponent from '../components/library/library.jsx';
import api from '../lib/api';
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
        window.location = item.rawURL;
        // Randomize position of library sprite
        // randomizeSpritePosition(item);
        // this.props.vm.addSprite(JSON.stringify(item)).then(() => {
        //     this.props.onActivateBlocksTab();
        // });
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
            />
        );
    }
}

ProjectLibrary.propTypes = {
    intl: intlShape.isRequired,
    onActivateBlocksTab: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func
};


export default injectIntl(ProjectLibrary);
