import React from 'react';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconSelector from '../Home/IconSelector';
import SearchBar from '../Home/SearchBar';
import Cards from './Cards';
import SimpleMap from './Map';
import { getNodeFilteredData, detailsQueryBuilder } from '../../utils/api';
import './Results.css';

class Results extends React.Component {
  state = {
    queryVals: null,
    data: null,
    selectedListing: null,
    loading: true,
    clickType: null //to keep track of how scroll should happen
  };

  updateListing = (id, clickType) => {
    this.setState(() => ({ selectedListing: id, clickType }));
  };

  //check to see which query values are search OR
  //category and/or parent
  //and then set state with result
  // the next few blocks are not DRY'd
  componentDidMount() {
    const queryVals = queryString.parse(this.props.location.search);

    const dataMap = {
      search: queryVals.search,
      category: queryVals.category,
      parent: queryVals.parent
    };

    const { nodeData } = this.props;
    const data = getNodeFilteredData(
      dataMap.search,
      dataMap.category,
      dataMap.parent,
      nodeData
    );

    this.setState(() => ({
      queryVals: dataMap,
      data,
      loading: false
    }));
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      const queryVals = queryString.parse(this.props.location.search);

      const dataMap = {
        search: queryVals.search,
        category: queryVals.category,
        parent: queryVals.parent
      };

      const { nodeData } = this.props;
      const data = getNodeFilteredData(
        dataMap.search,
        dataMap.category,
        dataMap.parent,
        nodeData
      );

      this.setState(() => ({
        queryVals: dataMap,
        data,
        loading: false
      }));
    }
  }

  // This is to deal with the unwanted rerenderings happening
  //on mobile
  shouldComponentUpdate(nextProps, nextState) {
    if (
      (nextState.loading !== this.state.loading && nextProps === this.props) ||
      (nextState.selectedListing !== this.state.selectedListing &&
        nextProps === this.props) ||
      nextProps.location.search !== this.props.location.search ||
      nextState.data !== this.state.data
    ) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    const { data, loading, selectedListing, clickType } = this.state;
    const {
      nodeData,
      searchData,
      handleCardSave,
      handleSaveDelete,
      savedDataId
    } = this.props;

    const styles = {
      faIcon: {
        color: '#393f48',
        marginRight: '5px'
      }
    };

    if (loading === true) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <div className="basic-search-container">
          <SearchBar nodeData={nodeData} searchData={searchData} />
        </div>
        <IconSelector
          nodeData={nodeData}
          searchData={searchData}
          path={'/results'}
          isVisible={false}
        />

        <div className="results-outer-container">
          <div className="results-container">
            <div className="map-container">
              <SimpleMap
                data={data}
                selectedListing={selectedListing}
                clickType={clickType}
                updateListing={this.updateListing}
                savedDataId={savedDataId}
              />
              {savedDataId.length > 0 ? (
                <div className="print-button-container">
                  <Link
                    to={{
                      pathname: '/details',
                      search: detailsQueryBuilder(savedDataId)
                    }}
                  >
                    <div className="print-button">
                      <FontAwesomeIcon
                        style={styles.faIcon}
                        icon="print"
                        size="sm"
                      />
                      Print Saved Listings
                    </div>
                  </Link>
                  <div
                    className="print-button"
                    onClick={() => {
                      handleSaveDelete();
                    }}
                  >
                    Clear Saved Listings
                  </div>
                </div>
              ) : null}
            </div>
            <Cards
              data={data}
              selectedListing={selectedListing}
              updateListing={this.updateListing}
              clickType={clickType}
              handleCardSave={handleCardSave}
              savedDataId={savedDataId}
              showMapDetail={false}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Results;

// REMOVED FROM COMPONENT DID MOUNT------------------------------------------------------------------------
//if the search parameter doesn't exist show the parent org and category
//else set the state to the result of the single search
// if (dataMap.search === undefined) {
//   const data = await nodeQueryBuilder(dataMap.category, dataMap.parent);
//   this.setState(() => ({ queryVals: dataMap, data, loading: false }));
// } else {
//   const { nodeData } = this.props;
//   const data = getFilteredData(dataMap.search, nodeData);
//   this.setState(() => ({ queryVals: dataMap, data, loading: false }));
// }
//-------------------------------------------------------------------

// REMOVED FROM COMPONENT DID UPDATE-----------------------------------------------------------------------
//if the search parameter doesn't exist show the parent org and category
//else set the state to the result of the single search
// if (dataMap.search === undefined) {
//   const data = await nodeQueryBuilder(dataMap.category, dataMap.parent);
//   this.setState(() => ({ queryVals: dataMap, data, loading: false }));
// } else {
//   const { nodeData } = this.props;
//   const data = getFilteredData(dataMap.search, nodeData);
//   this.setState(() => ({ queryVals: dataMap, data, loading: false }));
// }
// -----------------------------------------------------------------------
