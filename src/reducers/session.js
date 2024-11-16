const SET_SESSION = 'session/SET_SESSION';
const LOGIN_ERROR = 'session/LOGIN_ERROR';
const REMOVE_SESSION = 'session/REMOVE_SESSION';
const NO_SESSION = 'session/NO_SESSION';

const initialState = {
    session: false,
    user: null,
    errorMessage: null
};

const reducer = function (state = initialState, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_SESSION:
        // state.session = true;
        // state.user = {
        //     userId: action.session.user.userId,
        //     username: action.session.user.username,
        //     canCreateNew: true
        // };
        // state.errorMessage = null;
        // return state;
        return {
            ...state, // 保留原有状态
            session: true, // 更新 session 状态
            user: {
                userId: action.session.user.userId,
                username: action.session.user.username,
                canCreateNew: true
            },
            errorMessage: null // 清除错误信息
        };

    case LOGIN_ERROR:
        return {
            ...state,
            session: false,
            user: null,
            errorMessage: action.errorMessage
        };

        // state.session = false;
        // state.user = null;
        // state.errorMessage = action.errorMessage;
        // return state;
    case REMOVE_SESSION:
    case NO_SESSION:
        return {
            ...state,
            session: false,
            user: null,
            errorMessage: null
        };
    }
    return state;
};
const setSession = session => ({type: SET_SESSION, session: session});

const removeSession = () => ({type: REMOVE_SESSION});

const getLoginError = err => ({type: LOGIN_ERROR, errorMessage: err.message});

const getNoSession = () => ({type: NO_SESSION});

export {
    reducer as default,
    initialState as sessionInitialState,
    setSession,
    removeSession,
    getLoginError,
    getNoSession
};
