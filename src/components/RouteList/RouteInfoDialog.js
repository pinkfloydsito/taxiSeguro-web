import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import { List, ListItem } from 'material-ui/List';
import './routeInfo.css';

export const RouteInfoDialog = ({
  open, handleClose, route
}) => {
  const actions = [
    <FlatButton
      label="Cerrar"
      primary
      keyboardFocused={false}
      onClick={handleClose}
    />,
  ];
  let routeId = '';
  let client = {
    name: '',
    mobile: ''
  };

  let driver = {
    name: '',
    mobile: ''
  };

  let infoRoute = {
    time: '',
    safeScore: ''
  };
  if (route && Object.keys(route).length !== 0) {
    routeId = route._id;
    client = route.client;
    driver = route.driver;
    infoRoute = {
      time: route.duration,
      safeScore: route.safeScore
    };
  }

  return (<div className="dialog-chooser">
    <Dialog
      title="INFORMACION DE RUTA"
      actions={actions}
      modal={false}
      open={open}
      onRequestClose={this.handleClose}
    >
      <h3>
          Nombres
      </h3>
      <List>
        <ListItem
          insetChildren
          primaryText={`Cliente: ${client.name}`}
          className="itemName"
        />
        <ListItem
          insetChildren
          primaryText={`Conductor: ${driver.name}`}
          className="itemName"
        />
      </List>
      <Divider inset />
      <h3>
          Moviles
      </h3>
      <List>
        <ListItem
          insetChildren
          primaryText={`Cliente: ${client.mobile}`}
          className="itemName"
        />
        <ListItem
          insetChildren
          primaryText={`Chofer: ${driver.mobile}`}
        />
      </List>
    </Dialog>
          </div>);
};
