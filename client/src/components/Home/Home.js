import React from 'react';
import PropTypes from 'prop-types';
import IconSelector from './IconSelector';
import SearchBar from './SearchBar';
import './Home.css';
import { Link } from 'react-router-dom';
import BigRedButton from './../../images/emergencyResourcesButton.png'

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
const Home = props => {

    const { searchData, nodeData } = props; //grab match from React Router to pass to any of the links that need it.
    
    return (
    <section>
      <div className="home-outer-container">
        <div className="home-container">
          <div className="basic-search-container">
            <BasicInstructions />
              {/* extra div so the Link tag doesn't mess with flexbox spacing */}
              <div className='emergency-button'>
                <Link to="results?search=Fire%20Assistance%20Resources">
                  <img  
                    src={BigRedButton} 
                    alt="Click for Emergency Wildfire Resources" />
                </Link>
            </div>
            <SearchBar
              //"Search for a Service... "
              nodeData={nodeData}
              searchData={searchData}
            />
          </div>
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