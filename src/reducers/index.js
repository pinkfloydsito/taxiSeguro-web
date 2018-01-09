import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { map } from './map';
import { user } from './user';
import { routes } from './routes';

export default combineReducers({
  routing: routerReducer,
  map,
  user,
  routes
});
