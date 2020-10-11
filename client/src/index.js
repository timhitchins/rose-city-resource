import React from 'react';
import ReactDOM from 'react-dom';
import WebFont from 'webfontloader';
import App from './components/App';
import './css/main.css';
import 'leaflet/dist/leaflet.css'; //regular leaflet
import 'react-leaflet-markercluster/dist/styles.min.css'; //markerCluster
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'; //geocoder


// annoying hack to deal with webpack and marker icon
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// load google fonts
WebFont.load({
  google: {
    families: ['Roboto', 'Ubuntu']
  }
});

ReactDOM.render(<App />, document.getElementById('app'));
