/*
NOTE: this file only temporarily resides in scratch-gui.
Nearly identical code appears in scratch-www, and the two should
eventually be consolidated.
*/

import {injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import AccountNavComponent from '../components/menu-bar/account-nav.jsx';

const AccountNav = function (props) {
    const {
        ...componentProps
    } = props;
    return (
        <AccountNavComponent
            {...componentProps}
        />
    );
};

AccountNav.propTypes = {
    classroomId: PropTypes.string,
    isEducator: PropTypes.bool,
    isRtl: PropTypes.bool,
    isStudent: PropTypes.bool,
    profileUrl: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    username: PropTypes.string
};

const mapStateToProps = state => {
    const session = state.scratchGui.session;
    return ({
        classroomId: session && session.user ?
            session.user.classroomId : '',
        isEducator: session && session.permissions && session.permissions.educator,
        isStudent: session && session.permissions && session.permissions.student,
        profileUrl: session && session.user ?
            `/users/${session.user.username}` : '',
        thumbnailUrl: session && session.user ?
            session.user.thumbnailUrl : null,
        username: session && session.user ?
            session.user.username : ''
    });
};

const mapDispatchToProps = () => ({});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(AccountNav));
