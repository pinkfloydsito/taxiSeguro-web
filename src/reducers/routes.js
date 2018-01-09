function routes(state = {}, action) {
  switch (action.type) {
    case 'SET_ROUTES':
      return action.payload.routes;
    default:
      return state;
  }
}

export { routes };
