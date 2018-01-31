import L from 'leaflet';
import driver from '../../icons/driver.png';
import client from '../../icons/client.png';


export const iconDriver = L.icon({
  iconUrl: driver,
  iconSize: [50, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's locationa
  shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

export const iconClient = L.icon({
  iconUrl: client,
  iconSize: [50, 95], // size of the icon
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});
