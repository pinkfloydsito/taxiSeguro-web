import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// Component
import RouteList from '../components/RouteList/RouteList';

// Actions
import * as mapActions from '../modules/map';
import * as routesActions from '../modules/routes';
import * as userActions from '../modules/auth';
import * as notificationActions from '../modules/notifications';

const mapStateToProps = state => ({
    map: state.map,
    notifications: state.notifications,
    routesManager: state.routesManager, // manager
    routesRendered: state.routesManager.routesRendered,
    routes: state.routesManager.routes, // active routes
    user: state.auth.user, // logged user
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({},
                                                                        mapActions,
                                                                        routesActions,
                                                                        userActions,
                                                                        notificationActions
                                                                       ), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteList);
