import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { map } from './map';
import { user } from './user';

export default combineReducers({
  routing: routerReducer,
  map,
  user
});
