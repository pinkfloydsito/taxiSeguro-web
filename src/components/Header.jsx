import React from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Menu from 'material-ui/svg-icons/navigation/menu';
import { white } from 'material-ui/styles/colors';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Badge from 'material-ui/Badge';

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    /* const { styles, handleChangeRequestNavDrawer } = this.props; */
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
            <Badge
              badgeContent={this.props.notifications && Array.isArray(this.props.notifications) ? this.props.notifications.length : 0}
              primary
            >
              <NotificationsIcon />
            </Badge>
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
