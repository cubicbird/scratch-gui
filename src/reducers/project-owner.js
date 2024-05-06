const SET_PROJECT_OWNER = 'projectOwner/SET_PROJECT_OWNER';

// we are initializing to a blank string instead of an actual title,
// because it would be hard to localize here
const initialState = {
    id: -1,
    name: ''
};

const reducer = function (state = initialState, action) {
    switch (action.type) {
    case SET_PROJECT_OWNER:
        return action.owner;
    default:
        return state;
    }
};
const setProjectOwner = owner => {
    if (owner) {
        return {
            type: SET_PROJECT_OWNER,
            owner: owner
        };
    }
    return {
        type: SET_PROJECT_OWNER,
        owner: {
            id: -1,
            name: ''
        }
    };
};


export {
    reducer as default,
    initialState as projectOwnerInitialState,
    setProjectOwner
};
