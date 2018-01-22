import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// Component
import Header from '../components/Header';

// Actions
import * as mapActions from '../actions/mapActions';
import * as routesActions from '../actions/routesActions';

const mapStateToProps = state => ({
    map: state.map,
  routes: state.routes
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, mapActions, routesActions), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
