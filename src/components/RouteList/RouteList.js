import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import FlatButton from 'material-ui/FlatButton';
import AppBar from 'material-ui/AppBar';
import Checkbox from 'material-ui/Checkbox';
import CommunicationChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import IconButton from 'material-ui/IconButton';
import { List, ListItem } from 'material-ui/List';

import L from 'leaflet';
import 'leaflet-routing-machine';

import { service_url as SERVICE_URL } from '../../config/vars';
import { iconDriver, iconClient } from './assets';
import { UserChooserDialog } from './UserChooserDialog';
import { ChatboxDialog } from './Chatbox';
import { InfoDialog } from './InfoDialog';
import './styles.css';

const lineString = require('@turf/helpers').lineString;
const buffer = require('@turf/buffer').default;
const NotificationSystem = require('react-notification-system');
const io = require('socket.io-client');

export default class RouteList extends React.Component {
  constructor(props) {
    const socket = io('http://localhost:9000', { reconnect: true });
    super(props);
    this.state = {
      socket,
      notificationSystem: null,
      chat: new Map(),
      selectedChat: { route_id: null, role: null },
      messageDialog: {
        open: false,
        title: 'SELECCIONE EL USUARIO'
      },
      ChatboxDialog: {
        open: false,
        title: 'Chat'
      },
      infoDialog: {
        open: false
      },
    };
    this.routeListCheckbox = {};
    /*
        chat structure: [route_id, role] --> messages... That is the structure.
       */
    this.initCallbacks(this);
  }

  componentWillMount() {
    this.props.getActiveRoutes();
  }

  componentDidMount() {
    this.subscribeMonitor(this.state.socket);
    this.setState({
      notificationSystem: this.refs.notificationSystem
    });
  }


  handleClickChatIcon(event) {
    console.info(event.currentTarget);
    const route = this.props.routes.find(_route => _route._id == event.currentTarget.getAttribute('route_id'));
    this.setState({
      messageDialog: { ...this.state.messageDialog, open: true },
      selectedChat: { ...this.state.selectedChat, route_id: route._id }
    });
  }

  handleCloseMessageDialog() {
    this.setState({ messageDialog: { ...this.state.messageDialog, open: false } });
  }

  handleCloseChatboxDialog() {
    this.setState({ ChatboxDialog: { ...this.state.ChatboxDialog, open: false } });
  }

  handleCloseInfoDialog() {
    this.setState({ infoDialog: { ...this.state.infoDialog, open: false } });
  }

  handleClientChat(evt) {
    this.setState({
      ChatboxDialog: { ...this.state.ChatboxDialog, title: 'Client', open: true },
      selectedChat: { ...this.state.selectedChat, role: 'client' }
    });
  }
  handleDriverChat() {
    this.setState({
      ChatboxDialog: { ...this.state.ChatboxDialog, title: 'Driver', open: true },
      selectedChat: { ...this.state.selectedChat, role: 'driver' }
    });
  }
  addRouteToMap(route) {
    const router = new L.Routing.OSRMv1({
      serviceUrl: SERVICE_URL
    });
    this.props.addRenderedRoute(
      router,
      route._id,
      route,
      this.props.map,
      iconDriver,
      iconClient
    );
  }

  removeRouteFromMap(route) {
    try {
      this.props.deleteRenderedRoute(this.props.map, route._id);
    } catch (e) {
      console.error('Something wrong happened, ', e);
    }
  }

  joinRoom(route) {
    this.state.socket.emit('JOIN ROUTE', route._id);
  }
  leaveRoom(route) {
    this.state.socket.emit('LEAVE ROUTE', route._id);
  }

  handleCheck(event, isInputChecked) {
    const routes = this.props.routes.filter(route => route._id == event.target.getAttribute('route_id'));
    if (isInputChecked) {
      const routeRendered = this.props.routesRendered[event.target.getAttribute('route_id')];
      this.routeListCheckbox[event.target.getAttribute('route_id')] = true
      if (routeRendered) {
        return;
      }
      if (routes.length === 1) {
        this.addRouteToMap(routes[0]);
        this.joinRoom(routes[0]);
        this.state.notificationSystem.addNotification({
          title: 'Mostrando ruta',
          level: 'success',
          position: 'br',
          autoDismiss: 1
        });
      }
    } else {
      this.routeListCheckbox[event.target.getAttribute('route_id')] = false
      this.removeRouteFromMap(routes[0]);
      this.leaveRoom(routes[0]);
    }
  }

  subscribeMonitor(socket) {
    socket.on('connect', () => {
      socket.emit('SENDINFO', { ...this.props.user, role: 'monitor' });
    });

    socket.on('ROUTE - POSITION CLIENT', (data) => {
      const latLng = { latLng: L.latLng(data.position.latitude, data.position.longitude) };
      const routeRendered = this.props.routesRendered[data.routeId];
      if (routeRendered) { routeRendered.markerClient.setLatLng(latLng.latLng); }
    });

    socket.on('ROUTE - POSITION DRIVER', (data) => {
      const latLng = { latLng: L.latLng(data.position.latitude, data.position.longitude) };
      const routeRendered = this.props.routesRendered[data.routeId];
      if (routeRendered) { routeRendered.markerDriver.setLatLng(latLng.latLng); }
    });

    socket.on('PANIC BUTTON', (data) => {
      const route = this.props.routes.find(_route => _route._id == data.route_id);
      if (!route) {
        console.error('cannot send pannic button');
        return;
      }

      this.props.addNotification({
        sendBy: data.role,
        position: route.position,
        client: route.client,
        driver: route.driver,
        routeId: route._id
      });
      this.state.notificationSystem.addNotification({
        message: 'Boton de Panico Activado en ruta',
        level: 'error',
        position: 'tr',
        autoDismiss: 2
      });
    });

    socket.on('ROUTE - DANGER', (data) => {
      try {
        const route = this.props.routes.find(_route => _route._id === data.routeId);
        if (data.outofBuffer === false && route.status === 'danger') { // INGRESO A CERCO
          route.status = 'active';
          this.forceUpdate(); // refresh the UI
        } else if (data.outofBuffer === true && route.status !== 'danger') { // ABANDONO DE CERCO
          route.status = 'danger';
          this.forceUpdate(); // refresh the UI
          this.state.notificationSystem.addNotification({
            title: 'ABANDONO DE CERCO',
            level: 'error',
            position: 'tl',
            autoDismiss: 5,
            children: (
              <div>
                <h2>CONDUCTOR</h2>
                <p>NOMBRE: {route.driver.name}</p>
                <p>TELEFONO: {route.driver.mobile}</p>
                <h2>CLIENTE</h2>
                <p>NOMBRE: {route.client.name}</p>
                <p>TELEFONO: {route.client.mobile}</p>
              </div>
            )
          });
        } else if (data.outofBuffer === true && route.status === 'danger') { // OUT OF BUFFER SPAMMING
          console.info('Out of buffer spamming');
        }
      } catch (e) {
        console.error('Something wrong happened, ', e);
      }
    });

    socket.on('ROUTE - ACTIVE', (data) => {
      try {
        const route = data.route;
        route.client = data.client;
        route.driver = data.driver;
        route.status = 'active';
        this.props.setRoutes([...this.props.routes, route]);
        this.state.notificationSystem.addNotification({
          title: 'NUEVA TURA ACTIVA',
          level: 'success',
          position: 'br',
          children: (
            <div>
              <h2>CONDUCTOR</h2>
              <p>NOMBRE: {route.driver.name}</p>
              <p>TELEFONO: {route.driver.mobile}</p>
              <h2>CLIENTE</h2>
              <p>NOMBRE: {route.client.name}</p>
              <p>TELEFONO: {route.client.mobile}</p>
            </div>
          )
        });
      } catch (e) {
        console.error('Something wrong happened, ', e);
      }
    });

    socket.on('ROUTE - INACTIVE', (data) => {
      const route = data.route;
      console.info('removing route', data);
      try {
        this.props.deleteRenderedRoute(this.props.map, route._id);
        this.leaveRoom(route._id);
        this.props.removeRoute(route._id);
      } catch (e) {
        console.error('Something wrong happened, ', e);
      }
    });

    socket.on('ROUTE - CHAT RECEIVE', (data) => {
      try {
        console.info(data);
        this.handleReceiveMessage(data.route_id, data.role, data.message);
      } catch (e) {
        console.error('Something wrong happened, ', e);
      }
    });

    socket.on('ROUTE - CHAT ERROR', (data) => {
      this.state.chat.get([data.route_id, data.role].toString()).pop();
      this.setState({
        infoDialog: { ...this.state.infoDialog, open: true }
      });

      this.forceUpdate();
    });

    socket.on('ROUTE CHANGE - RESULT', async (status, route) => {
      if (status === 'ok') {
        const supersededRoute = {
          _id: route.supersededRoute
        }
        const routeCheckboxChecked = this.routeListCheckbox[route.supersededRoute];
        this.props.removeRoute(route.supersededRoute);
        this.props.setRoutes([...this.props.routes, route]);
        if (routeCheckboxChecked) {
          this.removeRouteFromMap(supersededRoute);
          this.addRouteToMap(route);
        }
      }
    });
  }

  sendMessage(evt) {
    let message = {
      from: this.props.user._id,
      position: 'left',
      type: 'text',
      text: evt.target.value,
      date: Date.now(),
    };
    try {
      this.state.socket.emit('ROUTE - CHAT', { ...this.state.selectedChat, message });

      message = { ...message, position: 'right' };
      // datasource feed
      const routeId = this.state.selectedChat.route_id;
      const role = this.state.selectedChat.role;
      const dupleRouteChat = this.state.chat.get([routeId, role].toString());
      if (!dupleRouteChat) {
        this.state.chat.set([routeId, role].toString(), []);
      }
      this.state.chat.get([routeId, role].toString()).push(message);
      this.forceUpdate();
    } catch (e) {
      console.error('Something wrong happened, ', e);
    }
  }

  handleReceiveMessage(routeId, role, message) {
    this.setState({
      selectedChat: { ...this.state.selectedChat, route_id: routeId, role }
    }, () => {
      try {
        if (!this.state.chat.get([this.state.selectedChat.route_id,
          this.state.selectedChat.role].toString())) {
          this.state.chat.set([this.state.selectedChat.route_id,
            this.state.selectedChat.role].toString(), []);
        }
        this.state.chat.get([this.state.selectedChat.route_id,
          this.state.selectedChat.role].toString()).push(message);
        this.forceUpdate();
      } catch (e) {
        console.error('Something wrong happened, ', e);
      }
    });
  }

  initCallbacks(context) {
    context.handleCheck = this.handleCheck.bind(this);
    context.addRouteToMap = this.addRouteToMap.bind(this);
    context.joinRoom = this.joinRoom.bind(this);
    context.leaveRoom = this.leaveRoom.bind(this);
    context.subscribeMonitor = this.subscribeMonitor.bind(this);
    context.removeRouteFromMap = this.removeRouteFromMap.bind(this);
    context.handleClickChatIcon = this.handleClickChatIcon.bind(this);
    context.handleCloseMessageDialog = this.handleCloseMessageDialog.bind(this);
    context.handleCloseChatboxDialog = this.handleCloseChatboxDialog.bind(this);
    context.handleCloseInfoDialog = this.handleCloseInfoDialog.bind(this);
    context.handleClientChat = this.handleClientChat.bind(this);
    context.handleDriverChat = this.handleDriverChat.bind(this);
    context.sendMessage = this.sendMessage.bind(this);
    context.handleReceiveMessage = this.handleReceiveMessage.bind(this);
  }

  render() {
    let routesGreen = null;
    let routesRed = null;
    if (this.props.routes && Array.isArray(this.props.routes)) {
      routesGreen = this.props.routes
        .filter(route => route.status === 'active' || route.status === 'pending')
        .map((route) => {
          const checkbox = (<Checkbox
                            id={"checkbox_" + route._id}
            route_id={route._id}
            onClick={(e) => {
                  e.stopPropagation();
                  this.handleCheck(e, e.target.checked);
    }}
          />);
          this.routeListCheckbox[checkbox.props.route_id] = checkbox;

          return (
            <ListItem
              key={route._id}
              primaryTogglesNestedList
              leftCheckbox={checkbox}
              primaryText={route.driver ? `Conductor: ${route.driver.name}` : 'No asignado'}
              secondaryText={route.client ? `Cliente: ${route.client.name}` : 'No asignado'}
            >
              <IconButton
                onClick={this.handleClickChatIcon}
                route_id={route._id}
                className="iconbutton-custom"
              >
                <CommunicationChatBubble />
              </IconButton>
            </ListItem>
          );
        });

      routesRed = this.props.routes
        .filter(route => route.status === 'danger')
        .map((route) => {
          const checkbox = (<Checkbox
          id={"checkbox_" + route._id}
            route_id={route._id}
            onClick={(e) => {
                  e.stopPropagation();
                  this.handleCheck(e, e.target.checked);
    }}
          />);

          return (
            <ListItem
              key={route._id}
              leftCheckbox={checkbox}
              primaryText={route.driver ? `Conductor: ${route.driver.name}` : 'No asignado'}
              secondaryText={route.client ? `Cliente: ${route.client.name}` : 'No asignado'}
            >
              <IconButton
                onClick={this.handleClickChatIcon}
                route_id={route._id}
                className="iconbutton-custom"
              >
                <CommunicationChatBubble />
              </IconButton>
            </ListItem>
          );
        });
    }
    return (<div className="col-md-3">
      <AppBar
        title="Estado de Rutas"
        iconClassNameLeft="muidocs-icon-action-home"
      />
      <Tabs>
        <Tab label="ACTIVAS">
          <div>
            <List ref="routesGreen">
              { routesGreen || 'No generado' }
            </List>
          </div>
        </Tab>
        <Tab label="PELIGRANDO">
          <div>
            <List ref="routesRed">
              { routesRed || 'No generado' }
            </List>
          </div>
        </Tab>
      </Tabs>
      <NotificationSystem ref="notificationSystem" />
      <UserChooserDialog
        title={this.state.messageDialog.title}
        open={this.state.messageDialog.open ? this.state.messageDialog.open : false}
        handleClose={this.handleCloseMessageDialog}
        handleClientChat={this.handleClientChat}
        handleDriverChat={this.handleDriverChat}
      />
      <ChatboxDialog
        title={this.state.ChatboxDialog.title}
        open={this.state.ChatboxDialog.open ? this.state.ChatboxDialog.open : false}
        handleClose={this.handleCloseChatboxDialog}
        sendMessage={this.sendMessage}
        messages={this.state.chat
.get([this.state.selectedChat.route_id,
this.state.selectedChat.role].toString())}
      />
      <InfoDialog
        open={this.state.infoDialog.open}
        handleClose={this.handleCloseInfoDialog}
      />
    </div>
    );
  }
}
