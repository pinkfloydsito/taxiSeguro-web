export const setRoutes = (routes = []) => ({
  type: 'SET_ROUTES',
  payload: {
    routes
  }
});


export const removeRoute = (route_id) => ({
  type: 'REMOVE_ROUTE',
  payload: {
    route_id
  }
});
