import L from 'leaflet';

const buffer = require('@turf/buffer').default;
const lineString = require('@turf/helpers').lineString;


export const addRouteToMap = (router, route, map, iconDriver, iconClient) => {
  let line = null;
  let polygon = null;
  let popup = null;
  let markerDriver = null;
  let markerClient = null;

  return new Promise((resolve, reject) => {
    let waypoints = null
    if (route.waypoints) {
      waypoints = route.waypoints.coordinates.map( (wp) => {
        const waypoint = {
          latLng: L.latLng(wp[1], wp[0])
        };
        return waypoint 
      });
    } else {
      waypoints = [{ latLng: L.latLng(route.start.coordinates[1], route.start.coordinates[0]) }, { latLng: L.latLng(route.end.coordinates[1], route.end.coordinates[0]) }];
    }
    router.route(waypoints, (err, routes) => {
      if (line) {
        map.removeLayer(line);
      }

      if (err) {
        console.error(err);
      // alert(err);
      } else {
        if (routes.length > 1) { line = L.Routing.line(routes[route.route_index]).addTo(map); } else { line = L.Routing.line(routes[0]).addTo(map); }
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
            .addTo(map);
        } catch (e) {
          console.error('Something wrong happened, ', e);
        }
        popup = L.popup()
          .setLatLng(waypoints[0].latLng)
          .setContent(`<p>Cliente: ${route.client.name} <br/>Conductor: ${route.driver.name} </p>`)
          .openOn(map);
        // Updating rendered routes in screen.

        markerDriver = L.marker([route.end.coordinates[1], route.end.coordinates[0]], { icon: iconDriver })
          .bindPopup(route.driver.name || '')
          .addTo(map);

        markerClient = L.marker([route.start.coordinates[1], route.start.coordinates[0]], { icon: iconClient })
          .bindPopup(route.driver.name || '')
          .addTo(map);
      }

      resolve(line, router, popup, polygon, markerDriver, markerClient);
    });
  }).then(() => ({
    line, router, popup, polygon, markerDriver, markerClient
  }));
};
