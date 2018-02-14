import React from 'react';
import { PropTypes } from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Header from './Header';
import LeftDrawer from './LeftDrawer';
import Login from './Login';
import withWidth, { LARGE, SMALL } from 'material-ui/utils/withWidth';
import ThemeDefault from '../theme-default';


// Actions
import * as userActions from '../modules/auth';

const mapStateToProps = state => ({
    auth: state.auth,
  user: state.auth.user
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navDrawerOpen: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.width !== nextProps.width) {
      this.setState({ navDrawerOpen: nextProps.width === LARGE });
    }
  }

  handleChangeRequestNavDrawer() {
    this.setState({
      navDrawerOpen: !this.state.navDrawerOpen
    });
  }

  render() {
    const { navDrawerOpen } = this.state;
    const paddingLeftDrawerOpen = 236;
    let mainWindow = null;

    const styles = {
      header: {
        paddingLeft: navDrawerOpen ? paddingLeftDrawerOpen : 0
      },
      container: {
        margin: '80px 20px 20px 15px',
        paddingLeft: navDrawerOpen && this.props.width !== SMALL ? paddingLeftDrawerOpen : 0
      }
    };

      if (this.props.user
          && this.props.user.name) {
      mainWindow =
      (<div>
        <Header
          styles={styles.header}
          handleChangeRequestNavDrawer={this.handleChangeRequestNavDrawer.bind(this)}
        />

        <LeftDrawer
          navDrawerOpen={navDrawerOpen}
          username={this.props.user.name ? this.props.user.name : 'Error'}
        />

        <div style={styles.container} className="container-fluid">
          <div className="row">
            { this.props.children }
          </div>
        </div>
       </div>);
    } else {
      mainWindow = (
        <Login />
      );
    }
    return (
      <MuiThemeProvider muiTheme={ThemeDefault}>
        {mainWindow}
      </MuiThemeProvider>);
  }
}

App.propTypes = {
  width: PropTypes.number.isRequired,
};

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, userActions), dispatch);
export default withWidth()(connect(
  mapStateToProps,
  mapDispatchToProps
)(App));
