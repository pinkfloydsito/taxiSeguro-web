import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Header from './Header';
import LeftDrawer from './LeftDrawer';
import Login from './Login';
import withWidth, { LARGE, SMALL } from 'material-ui/utils/withWidth';
import ThemeDefault from '../theme-default';


// Actions
import * as userActions from '../actions/userActions';

const mapStateToProps = state => ({
  user: state.user
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
    let main_window = null;

    const styles = {
      header: {
        paddingLeft: navDrawerOpen ? paddingLeftDrawerOpen : 0
      },
      container: {
        margin: '80px 20px 20px 15px',
        paddingLeft: navDrawerOpen && this.props.width !== SMALL ? paddingLeftDrawerOpen : 0
      }
    };

    if (this.props.user && this.props.user.name) {
      main_window =
      (<div>
        <Header
          styles={styles.header}
          handleChangeRequestNavDrawer={this.handleChangeRequestNavDrawer.bind(this)}
        />

        <LeftDrawer
          navDrawerOpen={navDrawerOpen}
          username="Sebastian :v"
        />

        <div style={styles.container}>
          { this.props.children }
        </div>
       </div>);
    } else {
        main_window = (
            <Login/>
        )
    }
    return (
      <MuiThemeProvider muiTheme={ThemeDefault}>
        {main_window}
      </MuiThemeProvider>);
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, userActions), dispatch);
export default withWidth()(connect(
  mapStateToProps,
  mapDispatchToProps
)(App));
