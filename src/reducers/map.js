function map(state = {}, action) {
  switch (action.type) {
    case 'SET':
      return action.payload.map;
    default:
      return state;
  }
}

export { map };
