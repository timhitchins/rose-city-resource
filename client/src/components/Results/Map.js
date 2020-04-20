import React from "react";
import { Map, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
// import PropTypes from "prop-types";
import Geocoder from "./Geocoder";
import MarkerClusterGroup from "react-leaflet-markercluster";
import MediaQuery from "react-responsive";
import { mapDataBuilder } from "../../utils/api";
import {
  greenLMarker,
  blueLMarker,
} from "./../../icons/mapIcons.js";

class Markers extends React.Component {
  markers = [];

  bindMarker = (ref) => {
    if (ref) {
      const marker = ref.leafletElement;
      this.markers.push(marker);
    }
  };

  render() {
    const { mapData, updateListing, selectedListing } = this.props;

    return (
      <React.Fragment>
        <MarkerClusterGroup>
          {mapData.mapData.map((item, index) => {
            return (
              <Marker
                key={`${item.popup.id}-${index}`}
                ref={this.bindMarker}
                // {...this.props}
                position={item.coords}
                id={item.popup.id}
                icon={
                  selectedListing === item.popup.id ? greenLMarker : blueLMarker
                }
                // onClick={() => updateListing(item.popup.id)}
                // onSelect={() => console.log('slected', item.popup.id)}
              >
                <Popup>
                  <div className="popup-container">
                    <div>{item.popup.listing}</div>
                    <div>{`${item.popup.street} ${item.popup.street2}`}</div>
                    {/* <div>{item.popup.hours}</div> */}
                    <div
                      className="popup-show-details"
                      onClick={() => {
                        updateListing(item.popup.id, "popup");
                      }}
                    >
                      Show Details
                    </div>
                  </div>
                </Popup>
                <MediaQuery query="(min-width: 993px)">
                  <Tooltip>
                    <div className="popup-tooltip">
                      <div>{item.popup.listing}</div>
                    </div>
                  </Tooltip>
                </MediaQuery>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </React.Fragment>
    );
  }
}

class SimpleMap extends React.Component {
  state = {
    mapData: null,
    zoom: 10,
    bounds: [],
    center: [45.52345, -122.6762],
    currentLocation: null,
    hasCurrentLocation: false,
    geocodeLocation: null,
    // windowHeight: undefined,
    // windowWidth: undefined
  };

  handleMapData = (data) => {
    const leafletMap = this.leafletMap.leafletElement;

    //create mapData and bounds
    const mapData = mapDataBuilder(data);
    this.setState(() => ({ mapData }));
    const bounds = mapData.mapData.map((item) => item.coords);

    //if there are bounds, set them and the center
    if (bounds.length > 0) {
      const zoom = leafletMap.getBoundsZoom(bounds) - 1;
      const center = mapData.center;
      this.setState(() => ({ bounds, zoom, center }));
    }
  };

  handleLocationClick = () => {
    // const leafletMap = this.leafletMap;
    // console.log('handle click', this.leafletMap);
    // if (leafletMap != null) {
    //   leafletMap.leafletElement.locate({ setView: true, maxZoom: 18 });
    // }
  };

  //for whatever reason the leaflet element is firing as null
  //her so this needs to be modified to handle null cases
  handleViewportChanged = () => {
    const leafletMap = this.leafletMap.leafletElement;
    const zoom = leafletMap.getZoom();
    this.setState(() => ({ zoom }));
  };

  handleLocationFound = (e) => {
    this.setState(() => ({
      hasCurrentLocation: true,
      currentLocation: [e.latlng.lat, e.latlng.lng],
    }));
  };

  handleGeocode = (e) => {
    this.setState(() => ({ geocodeLocation: [e.lat, e.lng] }));
  };

  componentDidMount() {
    const { data } = this.props;
    this.handleMapData(data);
  }

  componentDidUpdate(prevProps) {
    const { data, selectedListing } = this.props;
    const leafletMap = this.leafletMap.leafletElement;

    if (this.props.data !== prevProps.data) {
      this.handleMapData(data);
    }

    if (this.props.selectedListing !== prevProps.selectedListing) {
      const selectedItem = data.filter(
        (record) => record.id === selectedListing
      );
      const selectedCoords = [
        Number(selectedItem[0].lat),
        Number(selectedItem[0].lon),
      ];
      leafletMap.flyTo(selectedCoords, 17);
    }
  }

  // componentWillUnmount() {
  //   const leafletMap = this.leafletMap.leafletElement;
  //   // leafletMap.remove();
  // }

  render() {
    const { updateListing, selectedListing } = this.props;
    const { bounds, zoom, center, mapData } = this.state;

    if (bounds.length > 0) {
      return (
        <React.Fragment>
          <MediaQuery query="(min-width: 993px)">
            <Map
              ref={(map) => (this.leafletMap = map)}
              center={center}
              zoom={zoom}
              minZoom={8}
              maxZoom={18} //set to 18 since the mapdisappears beyond that.
              // maxBounds={maxBounds}
              scrollWheelZoom={true}
              tap={true}
              dragging={true}
              touchZoom={true}
              // onViewportChanged={this.handleViewportChanged}
              // onClick={this.handleLocationClick}
              // onLocationfound={this.handleLocationFound}
            >
              <TileLayer
                attribution=""
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <Markers
                mapData={mapData}
                updateListing={updateListing}
                selectedListing={selectedListing}
              />
              {/* <ErrorBoundary>
                <LocateControl
                  returnToPrevBounds={true}
                  cacheLocation={true}
                  showPopup={false}
                  strings={{ title: 'Show my location' }}
                  locateOptions={{
                    enableHighAccuracy: true
                  }}
                  handleLocationFound={this.handleLocationFound}
                >
                  <div className="gps-icon">
                    <GPSIcon />
                  </div>
                </LocateControl>
              </ErrorBoundary> */}
              <Geocoder
                collapsed={false}
                placeholder={"Search address..."}
                handleGeocode={this.handleGeocode}
              />
            </Map>
          </MediaQuery>

          <MediaQuery query="(max-width: 992px)">
            <Map
              ref={(map) => (this.leafletMap = map)}
              center={center}
              zoom={zoom}
              minZoom={8}
              maxZoom={18} //set to 18 since the mapdisappears beyond that.
              // maxBounds={maxBounds}
              scrollWheelZoom={false}
              tap={false}
              dragging={false}
              touchZoom={true}
              // onViewportChanged={this.handleViewportChanged}
              // onClick={this.handleLocationClick}
              // onLocationfound={this.handleLocationFound}
            >
              <TileLayer
                attribution=""
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <Markers
                mapData={mapData}
                updateListing={updateListing}
                selectedListing={selectedListing}
              />
              {/* <ErrorBoundary>
                <LocateControl
                  returnToPrevBounds={true}
                  cacheLocation={true}
                  showPopup={false}
                  strings={{ title: 'Show my location' }}
                  locateOptions={{
                    enableHighAccuracy: true
                  }}
                  handleLocationFound={this.handleLocationFound}
                >
                  <div className="gps-icon">
                    <GPSIcon />
                  </div>
                </LocateControl>
              </ErrorBoundary> */}
              <Geocoder
                placeholder={"Search address..."}
                handleGeocode={this.handleGeocode}
              />
            </Map>
          </MediaQuery>
        </React.Fragment>
      );
    }
    return (
      <Map
        ref={(map) => (this.leafletMap = map)}
        center={center}
        zoom={zoom}
        minZoom={8}
        maxZoom={18} //set to 18 since the mapdisappears beyond that.
        // maxBounds={maxBounds}
        scrollWheelZoom={false}
        tap={false}
        dragging={false}
        touchZoom={true}
        onViewportChanged={this.handleViewportChanged}
      >
        <TileLayer
          attribution=""
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {/* <LocateControl
          returnToPrevBounds={true}
          cacheLocation={true}
          showPopup={false}
          strings={{ title: 'Show my location' }}
          locateOptions={{
            enableHighAccuracy: true
          }}
          handleLocationFound={this.handleLocationFound}
        >
          <div className="gps-icon">
            <GPSIcon />
          </div>
        </LocateControl> */}
        <Geocoder handleGeocode={this.handleGeocode} />
      </Map>
    );
  }
}

export default SimpleMap;

//
// getLocation = () => {
//   //get current location
//   const leafletMap = this.leafletMap.leafletElement;
//   leafletMap
//     .locate({
//       setView: true,
//       watch: true
//     }) /* This will return map so you can do chaining */
//     .on('locationfound', function(e) {
//       // var marker = L.marker([e.latitude, e.longitude]).bindPopup(
//       //   'Your are here :)'
//       // );
//       // var circle = L.circle([e.latitude, e.longitude], e.accuracy / 2, {
//       //   weight: 1,
//       //   color: 'blue',
//       //   fillColor: '#cacaca',
//       //   fillOpacity: 0.2
//       // });
//       // this.setState(() => ({ currentLocation: [e.latitude, e.longitude] }));
//       console.log('Location', [e.latitude, e.longitude]);
//     })
//     .on('locationerror', function(e) {
//       console.log(e);
//       alert('Location access denied.');
//     });
// };
