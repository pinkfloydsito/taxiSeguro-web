import React from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import Menu from 'material-ui/svg-icons/navigation/menu';
import { white } from 'material-ui/styles/colors';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Badge from 'material-ui/Badge';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import './header.css';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.handleCheckRoute = this.handleCheckRoute.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleCheckRoute(event) {
    try {
      const index = event.currentTarget.getAttribute('index');
      const id_checkbox = `checkbox_${this.props.notifications[index].routeId}`;
      const checkbox = document.getElementById(id_checkbox);
      if (!checkbox.checked) {
        checkbox.click();
      } else {
        console.error('route is already selected...');
      }
      // TODO focus in route checkbox
    } catch (e) {
      console.error('Something wrong happened, ', e);
    }
  }

  handleClose(event) {
      console.info("handle close...")
    const index = event.currentTarget.getAttribute('index');
    this.props.removeNotification(index);
  }

  render() {
    /* const { styles, handleChangeRequestNavDrawer } = this.props; */
    const { notifications } = this.props;
    const styles = this.props.styles;
    const handleChangeRequestNavDrawer = this.props.handleChangeRequestNavDrawer;

    const style = {
      appBar: {
        position: 'fixed',
        top: 0,
        overflow: 'hidden',
        maxHeight: 57
      },
      menuButton: {
        marginLeft: 10
      },
      iconsRightContainer: {
        marginLeft: 20
      }
    };

    const emptyNotification = (
      <MenuItem>
        <Card>
          <CardHeader
            title="No hay notificationes"
          />
        </Card>
      </MenuItem>);
    const notificationItems = notifications.map((notification, index) => (<MenuItem key={index}>
      <Card>
        <CardHeader
          title="Alerta enviada por:"
          subtitle={`Enviada por: ${notification.sendBy}` == 'driver' ?
                          'Conductor' : 'Cliente'
                         }
          actAsExpander
        />
        <CardText >
                Numeros de contacto:
          <br />
                Cliente: { notification.client.mobile }
          <br />
                Conductor: { notification.driver.mobile }
          <div>
            <FlatButton
              label="Ver ruta"
              index={index}
              onClick={this.handleCheckRoute}
              secondary
            />
            <FlatButton
              index={index}
              label="Ignorar"
              onClick={this.handleClose}
              secondary={false}
            />
          </div>
        </CardText>
      </Card>
    </MenuItem>));
    return (
      <div>
        <AppBar
          style={{ ...styles, ...style.appBar }}
          iconElementLeft={
            <IconButton style={style.menuButton} onClick={handleChangeRequestNavDrawer}>
              <Menu color={white} />
            </IconButton>
              }
          iconElementRight={
            <IconMenu
              iconButtonElement={
                <Badge
                  className="badge"
                  badgeContent={this.props.notifications.length}
                  secondary
                  badgeStyle={{ top: 12, right: 12 }}
                >
                  <IconButton tooltip="Notifications">
                    <NotificationsIcon />
                  </IconButton>
                </Badge>

                                }
            >
              <div
              className="iconMenu_notifications"
                  >

              { this.props.notifications.length > 0 ? notificationItems : emptyNotification }
              </div>
            </IconMenu>
              }
        />
      </div>
    );
  }
}

Header.propTypes = {
  styles: PropTypes.object,
  handleChangeRequestNavDrawer: PropTypes.func
};

export default Header;
