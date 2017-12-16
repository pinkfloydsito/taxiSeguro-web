import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// Component
import Header from '../components/Header';

// Actions
import * as mapActions from '../actions/mapActions';

const mapStateToProps = state => ({
  map: state.map
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, mapActions), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
