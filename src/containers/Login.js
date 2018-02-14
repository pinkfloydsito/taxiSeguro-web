import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// Component
import Login from '../components/Login';

// Actions
import * as authActions from '../modules/auth';

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, authActions), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
