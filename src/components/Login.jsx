import React from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import { RingLoader } from 'react-spinners';

const style = {
  margin: 15,
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: {},
      loadingSpinner: true
    };
  }

  componentDidMount() {
    // Usar esto en desarrollo
    // this.props.login('user3', '123456')
  }

  handleClick(event) {
    this.props.login(this.state.username, this.state.password);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.loginError) {
      this.setState({
        error: {
          user: 'Error de autenticacion',
          password: 'Revise sus credenciales',
        }
      });
    }
  }

  render() {
    return (
      <div>
        <AppBar
          title="Login"
        />
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-md-offset-3">
              <Divider inset />
              <br />
              <TextField
                hintText="Enter your Username"
                errorText={'' || this.state.error.user}
                floatingLabelText="Username"
                onChange={(event, newValue) => {
                   this.setState({
                       username: newValue,
                                   error: {}
                                 });
               }}
              />
              <br />
              <TextField
                type="password"
                errorText={'' || this.state.error.password}
                hintText="Enter your Password"
                floatingLabelText="Password"
                onChange={(event, newValue) => {
            this.setState({ password: newValue, error: {} });
        }}
              />
              <br />
              {this.props.auth.loggingIn &&
              <div className="sweet-loading">
                <RingLoader
                  color="#123abc"
                  loading={this.state.loadingSpinner}
                />
              </div>
      }
              <br />

              {!this.props.auth.loggingIn &&
              <RaisedButton label="Submit" primary style={style} onClick={event => this.handleClick(event)} />
      }
              <Divider inset />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
