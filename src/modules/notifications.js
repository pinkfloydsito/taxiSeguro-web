const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS';
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';

const initialState = [];

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_NOTIFICATION: {
      return [...state,
        action.payload.notification
      ];
    }

    case SET_NOTIFICATIONS: {
      return action.payload;
    }

    case REMOVE_NOTIFICATION: {
      const newState = [...state];
        newState.splice(action.payload.index, 1);
      return newState;
    }
    default:
      return state;
  }
}


export const setNotifications = (notifications = []) => ({
  type: SET_NOTIFICATIONS,
  payload: {
    notifications
  }
});

export const addNotification = notification => ({
  type: ADD_NOTIFICATION,
  payload: {
    notification
  }
});


export const removeNotification = index => ({
  type: REMOVE_NOTIFICATION,
  payload: {
    index
  }
});
