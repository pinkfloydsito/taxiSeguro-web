import React from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';

const config = {};
config.params = {
  zoomControl: false,
  zoom: 13,
  maxZoom: 19,
  minZoom: 11,
  scrollwheel: false,
  legends: true,
  infoControl: false,
  attributionControl: true
};

config.tileLayer = {
  uri: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  params: {
    minZoom: 6,
    maxZoom: 15,
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributor',
  }
};
config.params.center = [-2.1573, -79.8929];
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    config.params.center = [position.coords.latitude, position.coords.longitude];
  });
} else {
  config.params.center = [-2.1573, -79.8929];
}
class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null
    };
  }

  componentDidMount() {
    /*
        Fetch routes info to load into the map...
       */
    if (!this.state.map) {
      this.init();
    }
  }

  componentWillUnmount() {
    this.state.map.remove();
  }


  init() {
    if (this.state.map) return;
    // this function creates the Leaflet map object and is called after the Map component mounts
    const map = L.map('map', config.params);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.control.scale({ position: 'bottomleft' }).addTo(map);

    // a TileLayer is used as the "basemap"
    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);

    this.setState({ map, tileLayer });
    this.props.setMap(map);
  }
  render() {
    return (<div>
      <div id="map" className="col-md-9"/>
            </div>
    );
  }
}

export default Map;
