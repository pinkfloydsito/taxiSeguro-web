export const setRoutes = (routes = new Map()) => ({
  type: 'SET_ROUTES',
  payload: {
    routes
  }
});
