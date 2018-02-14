import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Component
import Map from '../components/Map';

import * as mapActions from '../modules/map';

const mapStateToProps = state => ({
  map: state.map
});

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, mapActions), dispatch);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
