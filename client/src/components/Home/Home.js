import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import IconSelector from './IconSelector';
import SearchBar from './SearchBar';
import './Home.css';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
// import EmergencyButtonSmall from './EmergencyButton';
import BigRedButton from './../../../images/emergencyResourcesButton.png';
=======
import EmergencyButton from './EmergencyButton';
>>>>>>> Clean up EmergencyButton CSS

const BasicInstructions = props => {
  return (
    <div className="basic-instructions">
      Find reduced cost or free services in Multnomah, Washington and Clackamas
      counties.
    </div>
  );
};

const Home = props => {

    const { searchData, nodeData } = props; //grab match from React Router to pass to any of the links that need it.
    
    return (
    <section>
      <div className="home-outer-container">
        <div className="home-container">
          <div className="basic-search-container">
            <BasicInstructions />
<<<<<<< HEAD
              {/* extra div so the Link tag doesn't mess with flexbox spacing */}
              <div className='emergency-button-large'>
                <Link to="results?search=Fire%20Assistance%20Resources">
                  <img  
                    src={BigRedButton} 
                    alt="Click for Emergency Wildfire Resources" />
                </Link>
            </div>
            {/* <EmergencyButtonSmall /> */}
=======
            <EmergencyButton />
>>>>>>> Clean up EmergencyButton CSS
            <SearchBar
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
