// /44a526eed258222515aa21eaffd14a96.png
import L from 'leaflet';
import greenMarker from './../images/green-marker.png';
import redMarker from './../images/red-marker.png';
import blueMarker from './../images/blue-marker.png';
import shadowMarker from './../images/shadow-marker.png';


const iconAnchor = [22, 10];
const shadowAnchor = [18, 15];

export const greenLMarker = L.icon({
  iconUrl: greenMarker,
  iconAnchor: iconAnchor,
  shadowUrl: shadowMarker,
  shadowAnchor: shadowAnchor
});

export const redLMarker = L.icon({
  iconUrl: redMarker,
  iconAnchor: iconAnchor,
  shadowUrl: shadowMarker,
  shadowAnchor: shadowAnchor
});

export const blueLMarker = L.icon({
  iconUrl: blueMarker,
  iconAnchor: iconAnchor,
  shadowUrl: shadowMarker,
  shadowAnchor: shadowAnchor
});