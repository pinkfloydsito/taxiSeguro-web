import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import Checkbox from 'material-ui/Checkbox';
import { List, ListItem } from 'material-ui/List';

import L from 'leaflet';
import 'leaflet-routing-machine';
import { socket } from '../registerSocket';
import driver from '../icons/driver.png';
import client from '../icons/client.png';

const lineString = require('@turf/helpers').lineString;
const buffer = require('@turf/buffer').default;


const SERVICE_URL = 'http://localhost:5000/route/v1';
const iconDriver = L.icon({
  iconUrl: driver,
  iconSize: [50, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's locationa
  shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});
const iconClient = L.icon({
  iconUrl: client,
  iconSize: [50, 95], // size of the icon
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

export default class RouteList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      routesRendered: new Map(),
      socket
    };
    this.handleCheck = this.handleCheck.bind(this);
    this.addRouteToMap = this.addRouteToMap.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.subscribeMonitor = this.subscribeMonitor.bind(this);
    this.removeRouteFromMap = this.removeRouteFromMap.bind(this);
    this.subscribeMonitor();
    socket.emit('SENDINFO', { user: { ...this.props.user, role: 'monitor' } });
  }

  componentWillMount() {
    this.props.getActiveRoutes().then((data) => {
      this.props.setRoutes(data.payload.data);
    }).catch((e) => {
      console.error(e);
    });
  }

  componentDidMount() {
  }

  componentWillUnmount() {
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
          console.info(buffered);
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
    const routeTmp = this.state.routesRendered.get(route._id);
    this.props.map.removeLayer(routeTmp.line);
    this.props.map.removeLayer(routeTmp.popup);
    this.props.map.removeLayer(routeTmp.polygon);
    this.props.map.removeLayer(routeTmp.markerClient);
    this.props.map.removeLayer(routeTmp.markerDriver);
    // routeTmp.line.spliceWaypoints(0, 2);
    this.state.routesRendered.delete(route._id);
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
      if (routes.length === 1) {
        this.addRouteToMap(routes[0]);
        this.joinRoom(routes[0]);
      }
    } else {
      this.removeRouteFromMap(routes[0]);
      this.leaveRoom(routes[0]);
    }
  }

  subscribeMonitor() {
    socket.on('ROUTE - POSITION CLIENT', (data) => {
        const latLng = { latLng: L.latLng(data.position.latitude, data.position.longitude) };
        this.state.routesRendered.get(data.routeId).markerClient.setLatLng(latLng.latLng);
    });

    socket.on('ROUTE - POSITION DRIVER', (data) => {
        const latLng = { latLng: L.latLng(data.position.latitude, data.position.longitude) };
        this.state.routesRendered.get(data.routeId).markerDriver.setLatLng(latLng.latLng);
    });

    socket.on('ROUTE_ENDED', (data) => {
      console.info('FINALIZO RUTA: ');
      console.info(this.state.routesRendered.get(data.route._id));
    });

    socket.on('DANGER', (data) => {
      console.info('RUTA: ');
      console.info(this.state.routesRendered.get(data.route._id));
    });
  }

  render() {
    let routesGreen = null;
    let routesRed = null;
    if (this.props.routes && Array.isArray(this.props.routes)) {
      routesGreen = this.props.routes
        .filter(route => route.status === 'pending' || route.status === 'active')
        .map(route =>
          (
            <ListItem
              key={route._id}
              leftCheckbox={<Checkbox route_id={route._id} onCheck={this.handleCheck} />}
              primaryText={route.driver ? `Conductor: ${route.driver.name}` : 'No asignado'}
              secondaryText={route.client ? `Cliente: ${route.client.name}` : 'No asignado'}
            />));

      routesRed = this.props.routes
        .filter(route => route.status === 'danger')
        .map(route =>
          (
            <ListItem
              key={route._id}
              leftCheckbox={<Checkbox route_id={route._id} onCheck={this.handleCheck} />}
              primaryText={route.driver ? `Conductor: ${route.driver.name}` : 'No asignado'}
              secondaryText={route.client ? `Cliente: ${route.client.name}` : 'No asignado'}
            />));
    }
    return (<div className="col-md-3">
      <AppBar
        title="Estado de Rutas"
        iconClassNameLeft="muidocs-icon-action-home"
      />
      <Tabs>
        <Tab label="Verdes">
          <div>
            <List>
              { routesGreen || 'No generado' }
            </List>
          </div>
        </Tab>
        <Tab label="ROJO">
          <div>
            <List>
              { routesRed || 'No generado' }
            </List>
          </div>
        </Tab>
      </Tabs>
    </div>
    );
  }
}
