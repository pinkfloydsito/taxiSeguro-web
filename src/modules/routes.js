import { addRouteToMap } from '../handlers/leafletHandler';

const SET_ROUTES = 'SET_ROUTES';
const REMOVE_ROUTE = 'REMOVE_ROUTE';
const GET_ROUTES = 'GET_ROUTES';
const GET_ROUTES_SUCCESS = 'GET_ROUTES_SUCCESS';
const GET_ROUTES_FAIL = 'GET_ROUTES_FAIL';
const ADD_RENDERED_ROUTE = 'ADD_RENDERED_ROUTE';
const DELETE_RENDERED_ROUTE = 'DELETE_RENDERED_ROUTE';

const initialState = {
  routes: [],
  page: 1,
  routesRendered: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_ROUTES:
      return {
        ...state,
        routes: action.payload.routes
      };
    case REMOVE_ROUTE: {
      return {
        ...state,
        routes: [...state.routes].filter(route =>
          route._id !== action.payload.route_id)
      };
    }
    case GET_ROUTES: {
      return {
        ...state, loading_routes: true
      };
    }
    case GET_ROUTES_SUCCESS: {
      return {
        ...state, loading_routes: false, routes: action.payload.data
      };
    }
    case GET_ROUTES_FAIL: {
      return {
        ...state,
        loading_routes: false,
        loading_routes_error: action.error
      };
    }
    case ADD_RENDERED_ROUTE: {
      return {
        ...state,
        routesRendered: {
          ...state.routesRendered,
          [action.payload.routeId]: {
            line: action.payload.line,
            router: action.payload.router,
            popup: action.payload.popup,
            polygon: action.payload.polygon,
            markerDriver: action.payload.markerDriver,
            markerClient: action.payload.markerClient,
          }
        }
      };
    }
    case DELETE_RENDERED_ROUTE: {
      const newState = { ...state };
      const routeTmp = newState.routesRendered[action.payload.routeId];
      const map = action.payload.map;

      map.removeLayer(routeTmp.line);
      map.removeLayer(routeTmp.popup);
      map.removeLayer(routeTmp.polygon);
      map.removeLayer(routeTmp.markerClient);
      map.removeLayer(routeTmp.markerDriver);
      delete newState.routesRendered[action.payload.routeId];
      return newState;
    }
    default:
      return state;
  }
}

export function getActiveRoutes() {
  return {
    types: [GET_ROUTES, GET_ROUTES_SUCCESS, GET_ROUTES_FAIL],
    payload: {
      request: {
        method: 'get',
        url: '/routes/active',
      },
    }
  };
}

export const setRoutes = (routes = []) => ({
  type: SET_ROUTES,
  payload: {
    routes
  }
});


export const removeRoute = route_id => ({
  type: REMOVE_ROUTE,
  payload: {
    route_id
  }
});

export const addRenderedRoute = (
  router,
  routeId,
  route,
  map,
  iconDriver,
  iconClient
) => (dispatch, getState) => addRouteToMap(
  router,
  route,
  map,
  iconDriver,
  iconClient
).then((values) => {
  dispatch({
    type: ADD_RENDERED_ROUTE,
    payload: {
      line: values.line,
      popup: values.popup,
      polygon: values.polygon,
      markerDriver: values.markerDriver,
      markerClient: values.markerClient,
      router,
      routeId,
    }
  });
});

export const deleteRenderedRoute = (map, routeId) => ({
  type: DELETE_RENDERED_ROUTE,
  payload: {
    map,
    routeId,
  }
});
