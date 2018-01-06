import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// Component
import Login from '../components/Login';

// Actions
import * as userActions from '../actions/userActions';

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, userActions), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
