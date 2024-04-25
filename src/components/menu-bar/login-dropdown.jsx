/*
NOTE: this file only temporarily resides in scratch-gui.
Nearly identical code appears in scratch-www, and the two should
eventually be consolidated.
*/

import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages} from 'react-intl';

import MenuBarMenu from './menu-bar-menu.jsx';

import styles from './login-dropdown.css';
import api from '../../lib/api';
import connect from 'react-redux/lib/connect/connect';
import {closeLoginMenu} from '../../reducers/menus';
import SubmitLoginButton from '../login-modal/sumbit-login-button';
import Box from '../box/box';
import Input from '../forms/input.jsx';
import bindAll from 'lodash.bindall';
import Label from '../forms/label';

// these are here as a hack to get them translated, so that equivalent messages will be translated
// when passed in from www via gui's renderLogin() function
const LoginDropdownMessages = defineMessages({ // eslint-disable-line no-unused-vars
    username: {
        defaultMessage: 'Username',
        description: 'Label for login username input',
        id: 'general.username'
    },
    password: {
        defaultMessage: 'Password',
        description: 'Label for login password input',
        id: 'general.password'
    },
    signin: {
        defaultMessage: 'Sign in',
        description: 'Button text for user to sign in',
        id: 'general.signIn'
    },
    needhelp: {
        defaultMessage: 'Need Help?',
        description: 'Button text for user to indicate that they need help',
        id: 'login.needHelp'
    },
    validationRequired: {
        defaultMessage: 'This field is required',
        description: 'Message to tell user they must enter text in a form field',
        id: 'form.validationRequired'
    }
});


class LoginDropdown extends React.Component {
    constructor (props, className, isOpen, isRtl, onClose) {
        super(props);
        this.className = className;
        this.isOpen = isOpen;
        this.isRtl = isRtl;
        this.onClose = onClose;

        this.state = {
            account: '',
            password: ''
        };

        bindAll(this, [
            'handleAccountChange',
            'handlePasswordChange',
            'handleSubmit'
        ]);
    }

    handleAccountChange (e) {
        this.setState({
            account: e.target.value
        });
    }

    handlePasswordChange (e) {
        this.setState({
            password: e.target.value
        });
    }

    handleSubmit () {
        if (this.state.account.trim() === '' || this.state.password.trim() === '') {
            alert('账号和密码不能为空');
            return;
        }

        this.props.onSubmit(this.state.account, this.state.password);
        this.props.onClose();
    }

    render () {
        return (<MenuBarMenu
            className={this.props.className}
            open={this.props.isOpen}
            // note: the Rtl styles are switched here, because this menu is justified
            // opposite all the others
            place={this.props.isRtl ? 'right' : 'left'}
            onRequestClose={this.props.onClose}
        >
            <Box>

                <form>
                    { this.props.loginError ? (
                        <div>
                            <Label text={this.props.loginError} />
                            <br />
                        </div>) :
                        null}
                    <Input
                        className={styles.minInput}
                        name="account"
                        placeholder="账号"
                        type="username"
                        value={this.state.account}
                        onChange={this.handleAccountChange}
                    /><br />
                    <Input
                        className={styles.minInput}
                        name="password"
                        placeholder="密码"
                        type="password"
                        value={this.state.password}
                        onChange={this.handlePasswordChange}
                    /><br />
                    <SubmitLoginButton
                        className={styles.btnSubmit}
                        onClick={this.handleSubmit}
                    />
                </form>
            </Box>
        </MenuBarMenu>
        );
    }
}

const mapStateToProps = state => ({
    loginError: state.scratchGui.session.errorMessage
});
const mapDispatchToProps = dispatch => ({
    // onClose: () => dispatch(),
    onSubmit: (account, password) => {
        api.login(dispatch, account, password);
    }
});

LoginDropdown.propTypes = {
    className: PropTypes.string,
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func.isRequired,
    loginError: PropTypes.string
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginDropdown);
