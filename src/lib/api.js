import {getLoginError, setSession} from '../reducers/session';
import {closeLoginMenu} from '../reducers/menus';
import {onSetProjectOwner} from '../reducers/project-owner';
import {setProjectId} from '../reducers/project-state';

let accessToken = null;
let refreshToken = null;

const api = {
    async protectedRequest (url, method = 'GET', data = null) {
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };

        const init = {
            method: method,
            credentials: 'include',
            headers
        };

        if (data !== null) {
            init.body = JSON.stringify(data);
        }

        const response = await fetch(url, init);

        if (!response.ok) {
            if (response.status === 401 && refreshToken) {
                // 尝试使用 refresh token 刷新 access token
                await api.refreshAccessToken();
                const newHeaders = {
                    Authorization: `Bearer ${accessToken}`
                };
                const newInit = {
                    method: method,
                    credentials: 'include',
                    newHeaders
                };
                // 重新发送请求
                return fetch(url, newInit);
            }

            // 这个地方应该考虑直接登出
            throw new Error('Unable to refresh access token, check server log.');

        }

        return response.json();
    },

    // 定义用于刷新 access token 的函数
    async refreshAccessToken () {
        const response = await fetch('/cbadmin/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({refresh: refreshToken})
        });

        if (!response.ok) {
            throw new Error('Unable to refresh access token, check server log.');
        }

        const data = await response.json();
        accessToken = data.access;
    },

    // eslint-disable-next-line require-await
    get_login_info (resolve, reject) {
        const request = api.protectedRequest('/api/scratch/login_info');
        request.then(data => resolve({
            session: true,
            user: {
                userId: data.userId,
                username: data.usernameForDisplay
            },
            lastProjectId: data.lastProjectId
        }))
            .catch(err => reject(err));

    },

    async login (dispatch, username, password) {
        const data = {
            username: username,
            password: password,
            login: true
        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Login': true
            },
            body: JSON.stringify(data)
        };

        await fetch('/api/scratch/login', options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('请检查用户名/密码');
                }

                return response.json();
            })
            .then(responseData => {
                accessToken = responseData.access;
                refreshToken = responseData.refresh;
                dispatch(setSession({user: {username: responseData.usernameForDisplay}}));
                // dispatch(onSetProjectOwner(responseData.usernameForDisplay));
                dispatch(setProjectId(responseData.lastProjectId));
                // dispatch(closeLoginMenu());
            })
            .catch(error => {
                dispatch(getLoginError(error));
            });
    },

    fetch_my_projects (resolve, reject) {
        const request = api.protectedRequest('/api/scratch/my_projects/');
        request.then(data => resolve(data))
            .catch(err => reject(err));

    },

    logout: cleanup => {

        accessToken = null;
        refreshToken = null;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        fetch('/api/logout', options)
            .finally(cleanup);
    }

};

export default api;
