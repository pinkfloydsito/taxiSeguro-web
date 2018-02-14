import React from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

const style = {
  margin: 15,
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
  }

  componentDidMount() {
    // Usar esto en desarrollo
    this.props.login('user3', '123456')
  }

  handleClick(event) {
    this.props.login(this.state.username, this.state.password)
  }

  render() {
    return (
      <div>
        <AppBar
          title="Login"
        />
        <TextField
          hintText="Enter your Username"
          floatingLabelText="Username"
          onChange={(event, newValue) => this.setState({ username: newValue })}
        />
        <br />
        <TextField
          type="password"
          hintText="Enter your Password"
          floatingLabelText="Password"
          onChange={(event, newValue) => this.setState({ password: newValue })}
        />
        <br />
        <RaisedButton label="Submit" primary style={style} onClick={event => this.handleClick(event)} />
      </div>
    );
  }
}

export default Login;
