import React from 'react';
import Drawer from 'material-ui/Drawer';
import { spacing, typography } from 'material-ui/styles';
import { white, blue600 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import Avatar from 'material-ui/Avatar';

const LeftDrawer = (props) => {
  const { navDrawerOpen } = props;
  const { user } = props;

  const styles = {
    logo: {
      cursor: 'pointer',
      fontSize: 22,
      color: typography.textFullWhite,
      lineHeight: `${spacing.desktopKeylineIncrement}px`,
      fontWeight: typography.fontWeightLight,
      backgroundColor: blue600,
      paddingLeft: 40,
      height: 56,
    },
    menuItem: {
      color: white,
      fontSize: 14
    },
    avatar: {
      div: {
        padding: '15px 0 20px 15px',
        /* backgroundImage: `url(${require('../images/material_bg.png')})`, */
        height: 45
      },
      icon: {
        float: 'left',
        display: 'block',
        marginRight: 15,
        boxShadow: '0px 0px 0px 8px rgba(0,0,0,0.2)'
      },
      span: {
        paddingTop: 12,
        display: 'block',
        color: 'white',
        fontWeight: 300,
        textShadow: '1px 1px #444'
      }
    }
  };

  return (
    <Drawer
      docked
      open={navDrawerOpen}
    >
      <div style={styles.logo}>
        {user.name}
      </div>
      <div style={styles.avatar.div}>
        <span style={styles.avatar.span}>{props.username}</span>
      </div>
      <div>
      </div>
    </Drawer>
  );
};

LeftDrawer.propTypes = {
  navDrawerOpen: PropTypes.bool,
};

export default LeftDrawer;
