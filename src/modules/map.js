const SET_MAP = 'SET_MAP';

const initialState = {};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_MAP:
      return action.payload.map;
    default:
      return state;
  }
}

export const setMap = (map = {}) => ({
  type: SET_MAP,
  payload: {
    map
  }
});
