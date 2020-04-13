import React from 'react';
import queryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cards from './Results/Cards';
import { cardDetailsFilter, directionsUrlBuilder } from './../utils/api';

const styles = {
  faIcon: {
    color: '#393f48',
    marginRight: '5px'
  }
};

class Details extends React.Component {
  state = { cardDetailsData: null };

  componentDidMount() {
    const { nodeData } = this.props;
    const queryVals = queryString.parse(this.props.location.search);
    const detailsData = cardDetailsFilter(nodeData, queryVals.saved);
    // this logic should be in utils
    // but I need to refactor the way I used
    // the directionsUrlBuilder
    const cardDetailsData = detailsData.map(record => {
      const directionsUrl = directionsUrlBuilder(
        record.street,
        record.city,
        record.postal_code
      );
      return Object.assign(record, { directionsUrl });
    });

    this.setState(() => ({ cardDetailsData }));
  }
  render() {
    const { savedDataId, handleCardSave } = this.props;
    const { cardDetailsData } = this.state;
    if (cardDetailsData !== null) {
      return (
        <div className="details-outer-container">
          <div className="details-inner-container">
            <div
              className="print-details-button"
              onClick={() => {
                window.print();
              }}
            >
              <FontAwesomeIcon style={styles.faIcon} icon="print" size="sm" />
              Print Results
            </div>
            <Cards
              data={this.state.cardDetailsData}
              selectedListing={''}
              updateListing={null}
              handleCardSave={handleCardSave}
              savedDataId={savedDataId}
              showMapDetail={true}
            />
          </div>
        </div>
      );
    } else {
      return <div>loading</div>;
    }
  }
}
export default Details;
