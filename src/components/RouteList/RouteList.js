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
import './styles.css';
import { getActiveRoutes } from '../../actions/axiosActions';

const lineString = require('@turf/helpers').lineString;
const buffer = require('@turf/buffer').default;
const NotificationSystem = require('react-notification-system');
const io = require('socket.io-client');

export default class RouteList extends React.Component {
  constructor(props) {
    const socket = io('http://localhost:9000', { reconnect: true });
    super(props);
    this.state = {
      routesRendered: new Map(),
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
      }
    };
    this.routeListCheckbox = {}
    /*
        chat structure: [route_id, role] --> messages... That is the structure.
       */
    this.initCallbacks(this);
  }

  componentWillMount() {
    this.props.getActiveRoutes().then((data) => {
      this.props.setRoutes(data.payload.data);
    }).catch((e) => {
      console.error(e);
    });
  }

  componentDidMount() {
    this.subscribeMonitor(this.state.socket);
    this.setState({
      notificationSystem: this.refs.notificationSystem
    });
  }


  handleClickChatIcon(event) {
    const route = this.props.routes.find(_route => _route._id == event.target.getAttribute('route_id'));
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
    let line = null;
    let polygon = null;
    const waypoints = [{ latLng: L.latLng(route.start.coordinates[1], route.start.coordinates[0]) }, { latLng: L.latLng(route.end.coordinates[1], route.end.coordinates[0]) }];
    router.route(waypoints, (err, routes) => {
      if (line) {
        this.props.map.removeLayer(line);
      }

      if (err) {
        console.error(err);
        // alert(err);
      } else {
        
        if (routes.length > 1)
          line = L.Routing.line(routes[route.route_index]).addTo(this.props.map);
        else
          line = L.Routing.line(routes[0]).addTo(this.props.map);
        try {
          const coordinates = route.points.coordinates.map((coordinate) => {
            const _coordinate = [coordinate[0], coordinate[1]];
            const tmp_lat = _coordinate[1];
            _coordinate[1] = _coordinate[0];
            _coordinate[0] = tmp_lat;
            return _coordinate;
          });
          coordinates.unshift([route.start.coordinates[1], route.start.coordinates[0]]);
          coordinates.push([route.end.coordinates[1], route.end.coordinates[0]]);
          const linestring1 = lineString(coordinates);
          const buffered = buffer(linestring1, 1, { units: 'kilometers' });
          const latlngs = buffered.geometry.coordinates;
          polygon = L.polygon(latlngs, { color: 'blue', weight: 5, steps: 40 })
            .addTo(this.props.map);
        } catch (e) {
          console.error('Something wrong happened, ', e);
        }
        const popup = L.popup()
          .setLatLng(waypoints[0].latLng)
          .setContent(`<p>Cliente: ${route.client.name} <br/>Conductor: ${route.driver.name} </p>`)
          .openOn(this.props.map);
        // Updating rendered routes in screen.

        const markerDriver = L.marker([route.end.coordinates[1], route.end.coordinates[0]], { icon: iconDriver })
          .bindPopup(route.driver.name || '')
          .addTo(this.props.map);

        const markerClient = L.marker([route.start.coordinates[1], route.start.coordinates[0]], { icon: iconClient })
          .bindPopup(route.driver.name || '')
          .addTo(this.props.map);
        this.state.routesRendered.set(route._id, {
          line, router, popup, polygon, markerDriver, markerClient
        });
      }
    });
  }

  removeRouteFromMap(route) {
    try {
      const routeTmp = this.state.routesRendered.get(route._id);
      this.props.map.removeLayer(routeTmp.line);
      this.props.map.removeLayer(routeTmp.popup);
      this.props.map.removeLayer(routeTmp.polygon);
      this.props.map.removeLayer(routeTmp.markerClient);
      this.props.map.removeLayer(routeTmp.markerDriver);
      this.state.routesRendered.delete(route._id);
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
      let routeRendered = this.state.routesRendered.get(event.target.getAttribute('route_id'))
      if (routeRendered) {
        return 
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
      this.removeRouteFromMap(routes[0]);
      this.leaveRoom(routes[0]);
    }
  }

  subscribeMonitor(socket) {
    socket.on('connect', () => {
      socket.emit('SENDINFO', { ...this.props.user, role: 'monitor' });
    });

    socket.on('ROUTE - POSITION CLIENT', (data) => {
      console.info('route client');
      const latLng = { latLng: L.latLng(data.position.latitude, data.position.longitude) };
      const routeRendered = this.state.routesRendered.get(data.routeId)
      if (routeRendered) 
        routeRendered.markerClient.setLatLng(latLng.latLng);
    });

    socket.on('ROUTE - POSITION DRIVER', (data) => {
      console.info('route driver');
      const latLng = { latLng: L.latLng(data.position.latitude, data.position.longitude) };
      const routeRendered = this.state.routesRendered.get(data.routeId)
      if (routeRendered) 
        routeRendered.markerDriver.setLatLng(latLng.latLng);
    });

    socket.on('PANIC BUTTON', (data) => {
      console.info('panic button', data);
      this.state.notificationSystem.addNotification({
        message: 'Boton de Panico Activado en Ruta',
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
        const routeTmp = this.state.routesRendered.get(route._id);
        this.props.map.removeLayer(routeTmp.line);
        this.props.map.removeLayer(routeTmp.popup);
        this.props.map.removeLayer(routeTmp.polygon);
        this.props.map.removeLayer(routeTmp.markerClient);
        this.props.map.removeLayer(routeTmp.markerDriver);
        this.state.routesRendered.delete(route._id);
        this.leaveRoom(route._id);
        this.props.removeRoute(route._id);
      } catch (e) {
        console.error('Something wrong happened, ', e);
      }
    });

    socket.on('ROUTE - CHAT', (data) => {
      try {
        this.handleReceiveMessage(data.route_id, data.role, data.message);
      } catch (e) {
        console.error('Something wrong happened, ', e);
      }
    });

    socket.on('ROUTE CHANGE - RESULT', async (status, route) => {
      if (status === 'ok') {
        const supersededRoute = {
          _id: route.supersededRoute
        }
        this.removeRouteFromMap(supersededRoute)
        this.props.removeRoute(route.supersededRoute);
        this.props.setRoutes([...this.props.routes, route]);
        this.addRouteToMap(route)
        // console.info('Routes checkbox: ', this.routeListCheckbox)
        // const routeCheckbox = this.routeListCheckbox[route._id]
        // if (!routeCheckbox.props.checked) {
        //   routeCheckbox.setAttribute('checked', true)
        // } 
      }
    });
  }

  sendMessage(evt) {
    let message = {
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
      this.state.chat.get([this.state.selectedChat.route_id,
        this.state.selectedChat.role].toString()).push(message);
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
          let checkbox = (<Checkbox
            route_id={route._id}
            onClick={(e) => {
                  e.stopPropagation();
                  this.handleCheck(e, e.target.checked);
    }}
          />);
          this.routeListCheckbox[checkbox.props.route_id] = checkbox
          if (this.state.routesRendered.get(route._id) && this.props.map) {
            if (this.props.map.hasLayer(this.state.routesRendered.get(route._id).line)) {
              checkbox = <Checkbox route_id={route._id} onCheck={this.handleCheck} defaultChecked />;
            }
          }
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
          let checkbox = (<Checkbox
            route_id={route._id}
            onClick={(e) => {
                  e.stopPropagation();
                  this.handleCheck(e, e.target.checked);
    }}
          />);
          if (this.state.routesRendered.get(route._id) && this.props.map) {
            if (this.props.map.hasLayer(this.state.routesRendered.get(route._id).line)) {
              checkbox = <Checkbox route_id={route._id} onCheck={this.handleCheck} defaultChecked />;
            }
          }
          return (
            <ListItem
              key={route._id}
              leftCheckbox={checkbox}
              primaryText={route.driver ? `Conductor: ${route.driver.name}` : 'No asignado'}
              secondaryText={route.client ? `Cliente: ${route.client.name}` : 'No asignado'}
              rightIcon={<CommunicationChatBubble />}
            />
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
    </div>
    );
  }
}
