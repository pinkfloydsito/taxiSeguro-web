import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import auth from './auth';
import map from './map';
import routes from './routes';
import notifications from './notifications';

export default combineReducers({
  routing: routerReducer,
  auth,
  map,
  notifications,
  routesManager: routes
});
