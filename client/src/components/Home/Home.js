import React from 'react';
import PropTypes from 'prop-types';
import IconSelector from './IconSelector';
import SearchBar from './SearchBar';
import './Home.css';

/*---------------------------------------------------------*/

const BasicInstructions = props => {
  return (
    <div className="basic-instructions">
      Find reduced cost or free services in Multnomah, Washington and Clackamas
      counties.
    </div>
  );
};

/*---------------------------------------------------------*/
/* W.8.23.20: converted to functional component */
const Home = props => {

    const { searchData, nodeData } = props; //grab match from React Router to pass to any of the links that need it.
    
    return (
    <section>
      <div className="home-outer-container">
        <div className="home-container">
          {/* <Logo /> */}
          <div className="basic-search-container">
            <BasicInstructions />
            <SearchBar
              // label="Search for a Service... "
              nodeData={nodeData}
              searchData={searchData}
            />
          </div>
          {/* W.8.23.20 QUESTION: should we mark this as nav? It's essentially a secondary nav menu, so I wasn't sure. */}
          <IconSelector
            nodeData={props.nodeData}
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
  nodeData: PropTypes.array.isRequired
};

export default Home;