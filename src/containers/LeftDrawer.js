import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// Component
import LeftDrawer from '../components/LeftDrawer';

// Actions
import * as mapActions from '../modules/map';
import * as authActions from '../modules/auth';

const mapStateToProps = state => ({
  map: state.map,
  user: state.auth.user
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign(
  {},
  mapActions,
  authActions
), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LeftDrawer);
