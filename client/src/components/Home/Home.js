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
//this can be truned into a functional component now that i removed state
class Home extends React.Component {
  static propTypes = {
    nodeData: PropTypes.array.isRequired
  };

  render() {
    const { searchData, nodeData } = this.props; //grab match from React Router to pass to any of the links that need it.

    return (
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

          <IconSelector
            nodeData={this.props.nodeData}
            searchData={searchData}
            path={'/results'}
            isVisible={true}
          />
        </div>
      </div>
    );
  }
}

export default Home;
/*---------------------------------------------------------*/

// class Logo extends React.Component {
//   state = {
//     isLogoVisible: null,
//     isLogoTextVisible: null
//   };

//   componentDidMount() {
//     this.setState(() => ({ isLogoVisible: true }));
//   }

//   render() {
//     // this styling is specific to the ONLINE part of the logo

//     return (
//       <div className="rcr-online">
//         <CSSTransition
//           in={this.state.isLogoVisible}
//           timeout={700}
//           classNames="rcrOnlineLogo"
//           unmountOnExit
//         >
//           {status => {
//             console.log(status);

//             return (
//               <div className="rcrOnlineLogo">
//                 <CSSTransition
//                   in={status === 'entered'}
//                   timeout={500}
//                   classNames="rcrOnlineLogoText"
//                   unmountOnExit
//                 >
//                   <div className="rcrOnlineLogoText">
//                     ROSE CITY RESOURCE
//                     <span className="text-span"> ONLINE</span>
//                   </div>
//                 </CSSTransition>
//               </div>
//             );
//           }}
//         </CSSTransition>
//       </div>
//     );
//   }
// }
