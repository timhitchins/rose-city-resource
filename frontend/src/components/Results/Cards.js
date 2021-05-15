import React from "react";
import ScrollUpButton from "react-scroll-up-button";
import ReactTooltip from "react-tooltip";
import MediaQuery from "react-responsive";
import { Map, TileLayer, Marker } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CountBar from "./CountBar";
import {
  cardPhoneTextFilter,
  cardTextFilter,
  cardSortByDistance,
  cardWebAddressFixer,
} from "../../utils/api";
import { greenLMarker } from "./../../icons/mapIcons";
import SemanticCard from './SemanticCard'

const DetailMap = (props) => {
  return (
    <React.Fragment>
      <Map
        center={props.coords}
        zoom={15}
        scrollWheelZoom={true}
        tap={true}
        dragging={true}
        touchZoom={true}
      >
        <TileLayer
          attribution=""
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={props.coords} icon={greenLMarker} />
      </Map>
    </React.Fragment>
  );
};

//style for background
//card style when a location is
//selected by user
const style = {
  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.5), 0 6px 20px 0 rgba(0, 0, 0, 0.5)",
};

class RCRCard extends React.PureComponent {
  state = {
    selector: "location",
  };

  cardRef = React.createRef();

  componentDidMount() {
    const { record } = this.props;
    this.props.handleCardRef(this.cardRef, record.id);
  }

  render() {
    const {
      record,
      selectedListing,
      updateListing,
      handleCardClick,
      handleCardSave,
      savedDataId,
      showMapDetail,
    } = this.props;

    const formatStreetAddress = record => {
      return (record.street !== null && record.street !== '' ? `${cardTextFilter(record.street)} ${cardTextFilter(
        record.street2
      )}`.trim() : '')
    }

    // const card = {
    //   parsedCategory: record.main_category,
    //   listing: record.listing,
    //   phone: cardPhoneTextFilter(record),
    //   parsedWeb: cardWebAddressFixer(record.website),
    //   street: formatStreetAddress(record),
    //   city: `${record.city}, OR ${record.postal_code}`,
    //   description: cardTextFilter(record.service_description),
    //   parsedHours: cardTextFilter(record.hours),
    //   covidMessage: cardTextFilter(record.covid_message),
    // };

    const card = {
      category: record.main_category,
      listing: record.listing, 
      phone: cardPhoneTextFilter(record),
      website: cardWebAddressFixer(record.website),
      street: formatStreetAddress(record),
      city: `${record.city}, OR ${record.postal_code}`,
      description: cardTextFilter(record.service_description),
      hours: cardTextFilter(record.hours),
      covidMessage: cardTextFilter(record.covid_message)
    }

    // console.log(record.id, record.listing, record.main_category, record.general_category, record.phone, record.street, record.postal_code, record.service_description, record.hours, record.covid_message)
    console.log({record})

    // record.id, record.listing, record.main_category, record.general_category, record.phone, record.street, record.postal_code, record.service_description, record.hours, record.covid_message 

    // const { category, listing, phone, website, street, city, description, hours, covidMessage } = cardData;

    return (
      <div className="card-map-container">

        <div
          ref={this.cardRef}
          className="card-container"
          style={record.id === selectedListing ? style : null}
        >

          <div className="card-header">
            <div className="card-category">
              {card.category}
            </div>

            {card.covidMessage === "CLOSED DUE TO COVID" ? (
              <div className="covid-item">{card.covidMessage}</div>
            ) : null}
          </div>

          <div className="card-header">
            <div
              className="card-listing"
              style={
                selectedListing === record.id
                  ? {
                    color: "#27a727",
                    fontWeight: "bolder",
                  }
                  : null
              }
            >
              {card.listing}
            </div>
            <div className="spacer" />
            {record.lat !== "" || record.lon !== "" ? (
              <button
                className="card-save-button"
                data-tip="Show on map."
                data-for="show-listing-tooltip"
                onClick={() => {
                  handleCardClick(this.cardRef, record.id);
                  updateListing(record.id, "card");
                }}
              >
                <FontAwesomeIcon
                  icon="map-marker"
                  size="sm"
                  style={
                    selectedListing === record.id ? { color: "#27a727" } : null
                  }
                />
                Show
                <ReactTooltip
                  id="show-listing-tooltip"
                  place="top"
                  type="dark"
                  effect="solid"
                />
              </button>
            ) : null}
            {!showMapDetail ? (
              <MediaQuery query="(min-width: 993px)">
                <button
                  className="card-save-button"
                  data-tip="Save listing, print later."
                  data-for="save-tooltip"
                  onClick={() => handleCardSave(record.id)}
                >
                  <FontAwesomeIcon
                    icon="save"
                    size="sm"
                    style={
                      savedDataId.indexOf(record.id) > -1
                        ? { color: "green" }
                        : null
                    }
                  />
                  Save
                  <ReactTooltip
                    id="save-tooltip"
                    place="top"
                    type="dark"
                    effect="solid"
                  />
                </button>
              </MediaQuery>
            ) : null}
          </div>
          <div className="card-street">
            {card.street != null && card.street !== '' ? (
              <div>
                {card.street} <br />
                {card.city} <br />
                {/* if the distance is not null then return it in the card */}
                {record.distance !== null ? (
                  <div className="card-distance">
                    <FontAwesomeIcon
                      className="card-map-marker"
                      icon="map-marker"
                      size="sm"
                    />
                    {`${Number(record.distance.toFixed(2))} miles`}
                    <br />
                  </div>
                ) : null}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={"//www.google.com/maps/dir/" + record.directionsUrl}
                >
                  Get Directions
                </a>
              </div>
            ) : (
                <div className="card-undisclosed">Undisclosed Location</div>
              )}
          </div>
          <div className="covid-item covid-temp-listing">
            {card.covidMessage === "TEMPORARY COVID RESPONSE SERVICE"
              ? card.covidMessage
              : null}
          </div>
          <div className="card-phone-container">
            {card.phone && (
              <div>
                <FontAwesomeIcon icon={"phone"} className="phone-icon" />
                {card.phone.map((phone, index) => {
                  return (
                    <div key={`${phone.phone}-${index}`} className="card-phone">
                      <span>{`${phone.type}: `}</span>
                      {phone.phone}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="card-web-container">
            {card.website && (
              <div>
                <FontAwesomeIcon icon={"globe"} />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={card.website}
                >
                  {" website"}
                </a>
              </div>
            )}
          </div>
          {!(card.description === "") ? (
            <div className="card-item">
              <div className="card-title">Service Description:</div>
              <div className="card-content">{card.description}</div>
            </div>
          ) : null}
          {!(card.hours === "") ? (
            <div className="card-item">
              <div className="card-title-flex">
                <div>Hours:</div>
                <div className="covid-item">
                  {card.covidMessage === "HOURS CHANGED DUE TO COVID"
                    ? card.covidMessage
                    : null}
                </div>
              </div>
              <div className="card-content">
                {card.covidMessage === "CLOSED DUE TO COVID" ? (
                  <div className="covid-item">CLOSED</div>
                ) : (
                    card.hours
                  )}
              </div>
            </div>
          ) : null}
        </div>
        {showMapDetail ? (
          <div className="map-details-container">
            {record.lat !== "" ? (
              <DetailMap coords={[Number(record.lat), Number(record.lon)]} />
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

class Cards extends React.PureComponent {
  state = { currentCardRef: null, cardRefs: [] };

  cardScrollToCard = (cardRef) => {
    //the card is on the first element of the
    //the cardRef array
    window.scrollTo({
      top: cardRef[0][0].offsetTop - 60,
      behavior: "smooth",
    });
  };

  handleCardRef = (ref, id) => {
    //build up the state array without directly mutating state
    this.setState((prevState) => ({
      cardRefs: [...prevState.cardRefs, [ref.current, id]],
    }));
  };

  handleCardClick = (cardRef, id) => {
    this.setState(() => ({ currentCardRef: [cardRef.current, id] }));
  };

  undisclosedCounter = (data) => {
    let counter = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].street === "") {
        counter += 1;
      }
    }
    return counter;
  };

  componentDidUpdate(prevProps) {
    const { cardRefs } = this.state;
    const { selectedListing, clickType } = this.props;

    const currentCard = cardRefs.filter((ref) => ref[1] === selectedListing);
    if (this.props.selectedListing !== prevProps.selectedListing) {
      if (
        window.matchMedia("(max-width: 992px)").matches &&
        clickType === "popup"
      ) {
        this.cardScrollToCard(currentCard);
      }
      if (
        window.matchMedia("(max-width: 992px)").matches &&
        clickType === "card"
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (window.matchMedia("(min-width: 993px)").matches) {
        this.cardScrollToCard(currentCard);
      }
    }
  }

  render() {
    const {
      data,
      selectedListing,
      updateListing,
      handleCardSave,
      savedDataId,
      showMapDetail,
    } = this.props;

    return (
      // the cards container should scroll on its own
      <div className="cards-container">
        <CountBar savedDataId={savedDataId} data={data} />

        {cardSortByDistance(data).map((record, index) => (
          // <RCRCard
          //   key={`${record.id}-${index}`}
          //   record={record}
          //   selectedListing={selectedListing}
          //   updateListing={updateListing}
          //   handleCardSave={handleCardSave}
          //   handleCardClick={this.handleCardClick}
          //   handleCardRef={this.handleCardRef}
          //   savedDataId={savedDataId}
          //   showMapDetail={showMapDetail}
          // />
          <SemanticCard 
            // key={`${record.id}-${index}`}
            record={record} 
            // selectedListing={selectedListing}
            // updateListing={updateListing}
            // handleCardSave={handleCardSave}
            // handleCardClick={this.handleCardClick}
            // handleCardRef={this.handleCardRef}
            // savedDataId={savedDataId}
            // showMapDetail={showMapDetail}  
            />

        ))}
        <MediaQuery query="(max-width: 992px)">
          <ScrollUpButton
            StopPosition={0}
            ShowAtPosition={150}
            EasingType="easeOutCubic"
            AnimationDuration={500}
            style={{ left: "50%", bottom: "35px", right: "50%" }}
            ToggledStyle={{}}
          />
        </MediaQuery>
        <MediaQuery query="(min-width: 993px)">
          <ScrollUpButton
            StopPosition={0}
            ShowAtPosition={150}
            EasingType="easeOutCubic"
            AnimationDuration={500}
            style={{ left: "240px", bottom: "35px" }}
            ToggledStyle={{}}
          />
        </MediaQuery>
      </div>
    );
  }
}

export default Cards;
