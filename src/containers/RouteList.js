import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// Component
import RouteList from '../components/RouteList';

// Actions
import * as mapActions from '../actions/mapActions';
import * as routesActions from '../actions/routesActions';
import * as axiosActions from '../actions/axiosActions';
import * as userActions from '../actions/userActions';

const mapStateToProps = state => ({
    map: state.map,
    routes: state.routes, // active routes
    user: state.user, // logged user
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, mapActions, routesActions, axiosActions, userActions), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteList);
