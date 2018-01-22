function routes(state = [], action) {
  switch (action.type) {
    case 'SET_ROUTES':
      return action.payload.routes;
    case 'REMOVE_ROUTE': {
      return [...state].filter(route => route._id !== action.payload.route_id);
    }

    default:
      return state;
  }
}

export { routes };
