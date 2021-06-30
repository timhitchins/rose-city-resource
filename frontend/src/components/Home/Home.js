import React from 'react';
import PropTypes from 'prop-types';
import IconSelector from './IconSelector';
import SearchBar from './SearchBar';
import '../../css/Home.css';

const BasicInstructions = props => {
  return (
    <div className="basic-instructions">
      Find reduced cost or free services in Multnomah, Washington and Clackamas
      counties.
    </div>
  );
};

const Home = props => {

  const { searchData, records } = props; //grab match from React Router to pass to any of the links that need it.

  return (
    <section>
      <div className="home-outer-container">
        <div className="home-container">
          <div className="basic-search-container">
            <BasicInstructions />
            <SearchBar
              //"Search for a Service..."
              records={records}
              searchData={searchData}
            />
          </div>
          <IconSelector
            records={props.records}
            searchData={searchData}
            path={'/results'}
            isVisible={true}
          />
        </div>
      </div>
    </section>
  );
}


Home.propTypes = {
  records: PropTypes.array.isRequired
};

export default Home;