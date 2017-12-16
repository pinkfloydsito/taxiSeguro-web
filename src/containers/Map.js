import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// Component
import Map from '../components/Map';

// Actions
import * as mapActions from '../actions/mapActions';

const mapStateToProps = state => ({
  map: state.map
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, mapActions), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
