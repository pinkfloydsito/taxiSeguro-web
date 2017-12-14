import React from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';

class Map extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      loaded: false
    };
  }
  componentDidMount(){
    let map = L.map('map');
    L.Routing.control({
      waypoints: [
        L.latLng(-2.15193, -79.95302),
        L.latLng(-2.15192, -76.949)
      ],
      router: new L.Routing.OSRMv1({
        serviceUrl: 'http://localhost:5000/route/v1'
      })
}).addTo(map);

  }
  render() {
    return <div>
      <div id="map"> </div>
      
    </div>;
  }
}

export default Map;
