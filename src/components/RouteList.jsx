import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import Checkbox from 'material-ui/Checkbox';
import { List, ListItem } from 'material-ui/List';

import L from 'leaflet';
import 'leaflet-routing-machine';
import { subscribeMonitor, socket } from '../registerSocket';

// import { lineString } from '@turf/helpers';
const lineString = require('@turf/helpers').lineString;
const point = require('@turf/helpers').point;
const multiPoint = require('@turf/helpers').multiPoint;
const isPointInPolygon = require('@turf/boolean-point-in-polygon');
const buffer = require('@turf/buffer').default;

const SERVICE_URL = 'http://localhost:5000/route/v1';

class RouteList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      routesRendered: new Map(),
      socket
    };
    this.handleCheck = this.handleCheck.bind(this);
    this.addRouteToMap = this.addRouteToMap.bind(this);
    this.removeRouteFromMap = this.removeRouteFromMap.bind(this);
    subscribeMonitor();
    socket.emit('sendInfo', { user: this.props.user });
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
              let _coordinate = [coordinate[0], coordinate[1]]
            const tmp_lat = _coordinate[1];
            _coordinate[1] = _coordinate[0];
            _coordinate[0] = tmp_lat;
            return _coordinate;
          });
          coordinates.unshift([route.start.coordinates[1], route.start.coordinates[0]]);
          coordinates.push([route.end.coordinates[1], route.end.coordinates[0]]);
          const linestring1 = lineString(coordinates);
          const buffered = buffer(linestring1, 1, { units: 'kilometers' });
            console.info(buffered)
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
          this.state.routesRendered.set(route._id, { line, router, popup, polygon });
      }
    });
  }

  removeRouteFromMap(route) {
    const routeTmp = this.state.routesRendered.get(route._id);
    this.props.map.removeLayer(routeTmp.line);
    this.props.map.removeLayer(routeTmp.popup);
    this.props.map.removeLayer(routeTmp.polygon);
    // routeTmp.line.spliceWaypoints(0, 2);
    this.state.routesRendered.delete(route._id);
  }
  handleCheck(event, isInputChecked) {
    const routes = this.props.routes.filter(route => route._id == event.target.getAttribute('route_id'));
    if (isInputChecked) {
      if (routes.length === 1) {
        this.addRouteToMap(routes[0]);
      }
    } else {
      this.removeRouteFromMap(routes[0]);
    }
  }

  render() {
    let routesUI = null;
    if (this.props.routes && Array.isArray(this.props.routes)) {
      routesUI = this.props.routes.map(route => (<ListItem
        key={route._id}
        leftCheckbox={<Checkbox route_id={route._id} onCheck={this.handleCheck} />}
        primaryText={route.driver ? `Conductor: ${route.driver.name}` : 'No asignado'}
        secondaryText={route.client ? `Cliente: ${route.client.name}` : 'No asignado'}
      />));
    }
    return (<div className="col-md-3">
      <AppBar
        title="Rutas Activas"
        iconClassNameLeft="muidocs-icon-action-home"
      />
      <Tabs>
        <Tab label="Verdes">
          <div>
            <List>
              { routesUI || 'No generado' }
            </List>
          </div>
        </Tab>
      </Tabs>
    </div>
    );
  }
}

export default RouteList;