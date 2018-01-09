function map(state = {}, action) {
  switch (action.type) {
    case 'SET_MAP':
      return action.payload.map;
    default:
      return state;
  }
}

export { map };
