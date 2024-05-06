import {getLoginError, setSession} from '../reducers/session';
import {setProjectId} from '../reducers/project-state';
import OSS from 'ali-oss/lib/browser';
import {head} from 'ali-oss/lib/common/object/head';

let accessToken = null;
let refreshToken = null;
let ossAccessKeyId = null;
let ossAccessKeySecret = null;
let ossSecurityToken = null;

const api = {
    async protectedRequest (url, method = 'GET', data = null) {
        const headers = {};
        if (accessToken !== null) {
            Object.assign(headers, {
                Authorization: `Bearer ${accessToken}`
            });
        }

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
        request.then(data => {
            ossAccessKeyId = data.stsAccessId;
            ossAccessKeySecret = data.stsSecret;
            ossSecurityToken = data.stsToken;
            if (data.userId === null) {
                resolve({
                    session: false,
                    user: {
                        userId: -1,
                        username: null
                    },
                    lastProjectId: null
                });
            } else {
                resolve({
                    session: true,
                    user: {
                        userId: data.userId,
                        username: data.usernameForDisplay
                    },
                    lastProjectId: data.lastProjectId
                });
            }
        })
            .catch(err => reject(err));

    },

    async updateProjectThumbnail (projectId, blob) {
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Disposition': `attachment; filename="${projectId}.png"`
        };

        const options = {
            method: 'POST',
            credentials: 'include',
            body: blob,
            headers
        };

        const url = `/api/scratch/projecthumbnail/${projectId}`;

        let response = await fetch(url, options);

        if (!response.ok) {
            if (response.status === 401 && refreshToken) {
                // 尝试使用 refresh token 刷新 access token
                await api.refreshAccessToken();
                const newHeaders = {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Disposition': `attachment; filename="${projectId}.png"`
                };
                const newInit = {
                    method: 'POST',
                    credentials: 'include',
                    body: blob,
                    newHeaders
                };
                // 重新发送请求
                response = await fetch(url, newInit);
                return response.json();
            }

            // 这个地方应该考虑直接登出
            throw new Error('Unable to refresh access token, check server log.');

        }

        return response.json();
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
                ossAccessKeyId = responseData.stsAccessId;
                ossAccessKeySecret = responseData.stsSecret;
                ossSecurityToken = responseData.stsToken;
                dispatch(setSession({
                    session: true,
                    user: {
                        userId: responseData.userId,
                        username: responseData.usernameForDisplay
                    }
                }));
                // dispatch(onSetProjectOwner(responseData.usernameForDisplay));
                dispatch(setProjectId(responseData.lastProjectId));
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
    },

    createOssClient: () => new OSS({
        region: 'oss-cn-shenzhen',
        bucket: 'cubicbird-scratch',
        accessKeyId: ossAccessKeyId,
        accessKeySecret: ossAccessKeySecret,
        stsToken: ossSecurityToken,
        refreshSTSToken: async () => {
            const refreshToken = await api.get_login_info();
            ossAccessKeyId = refreshToken.AccessKeyId;
            ossAccessKeySecret = refreshToken.AccessKeySecret;
            ossSecurityToken = refreshToken.SecurityToken;
            return {
                accessKeyId: ossAccessKeyId,
                accessKeySecret: ossAccessKeySecret,
                stsToken: ossSecurityToken
            };
        },
        refreshSTSTokenInterval: 1200000
    }),

    uploadAsset: async (asset, data) => {
        const ossClient = api.createOssClient();
        const options = {
            // mime: 'json',
            // headers: {'Content-Type': 'text/plain'}
        };
        const rest = await ossClient.put(`asset/${asset}`, data, options);
        return rest;
    },

    getAssetUrlForGet: (asset, type = 'asset') => {
        const ossClient = api.createOssClient();
        return ossClient.signatureUrl(`${type}/${asset}`);
    },

    getAssetUrlForPost: asset => api.getAssetUrlForGet(asset)


};

export default api;
