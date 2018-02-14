import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Component
import Header from '../components/Header';

// Actions
import * as mapActions from '../modules/map';
import * as routesActions from '../modules/routes';
import * as notificationsActions from '../modules/notifications';

const mapStateToProps = state => ({
  map: state.map,
  routes: state.routes,
  notifications: state.notifications
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign(
  {},
  mapActions,
  routesActions,
  notificationsActions
), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
