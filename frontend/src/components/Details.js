import React from 'react';
import queryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cards from './Results/Cards';
import { cardDetailsFilter, directionsUrlBuilder } from '../utils/api';

class Details extends React.PureComponent {
  state = { cardDetailsData: null };

  componentDidMount() {
    const { records } = this.props;
    const queryVals = queryString.parse(this.props.location.search);
    const detailsData = cardDetailsFilter(records, [...queryVals.saved]);

    // this logic could be in utils
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
              <FontAwesomeIcon icon={["fa", "print"]} style={{marginRight: '5px', marginLeft: '5px'}}/>
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
