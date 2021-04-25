import L from 'leaflet';
import 'leaflet-control-geocoder';
import { withLeaflet, MapControl } from 'react-leaflet';

class Geocoder extends MapControl {
  createLeafletElement(props) {
    const { ...options } = props;

    this.control = new L.Control.Geocoder(options).on('markgeocode', e =>
      options.handleGeocode(e.geocode.center)
    );
    return this.control;
  }
}

export default withLeaflet(Geocoder);
