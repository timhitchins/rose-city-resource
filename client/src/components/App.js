import React from "react";
import Loading from "./Loading";
import Home from "./Home/Home";
import About from "./About";
import SuggestEdit from "./SuggestEdit";
import Results from "./Results/Results";
import Details from "./Details";
import Nav from "./Navbar/Nav";
import Footer from "./Footer/Footer";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {
  getNodeData,
  getPackageData,
  getCategorySearchData,
  getMainSearchData,
  dateString,
} from "../utils/api";
import "../icons/iconsInit";

class App extends React.Component {
  //data lives in the top component.
  state = {
    navDrawerVisible: false,
    nodeData: null,
    searchData: null,
    savedDataId: [],
  };

  //state lisfted from
  //Cards to keep track of saved cards
  //this may need to be moved down to results
  handleCardSave = (id) => {
    const { savedDataId } = this.state;
    // console.log('current saved state: ', savedDataId);
    if (savedDataId.indexOf(id) === -1) {
      //build up the state array without directly mutating state
      this.setState((prevState) => ({
        savedDataId: [...prevState.savedDataId, id],
      }));
    } else {
      const filterArr = savedDataId.filter((item) => item !== id);
      this.setState(() => ({ savedDataId: filterArr }));
    }
  };

  handleSaveDelete = () => {
    this.setState(() => ({ savedDataId: [] }));
  };
  // build the searching data
  filterData = (nodeData) => {
    const generalCategories = getCategorySearchData(
      nodeData,
      "general_category"
    );
    const parentCategories = getCategorySearchData(
      nodeData,
      "parent_organization"
    );
    const mainCategories = getMainSearchData(nodeData);
    // return a new object with the search data
    return {
      general: generalCategories,
      main: mainCategories,
      parent: parentCategories,
    };
  };

  handleDrawer = () =>
    this.setState((prev) => ({
      navDrawerVisible: !prev.navDrawerVisible,
    }));

  componentDidMount = async () => {
    // window.addEventListener('resize', this.resize);
    //package/revision data
    const packageData = await getPackageData();
    this.revisionDate = dateString(
      // packageData.result.results[0].metadata_modified
      packageData.result.metadata_modified
    );

    //nodeData
    const nodeData = await getNodeData();
    const searchData = this.filterData(nodeData);
    console.log(searchData)
    this.setState(() => ({ nodeData, searchData }));
  };

  render() {
    const { nodeData, searchData, savedDataId } = this.state;
    return (
      <React.Fragment>
        {!nodeData ? (
          <Loading />
        ) : (
          <Router>
            <div>
              <div className="main-content">
                <Nav />
                <Switch>
                  <Route
                    exact
                    path="/"
                    component={(props) => (
                      <Home
                        {...props}
                        nodeData={nodeData}
                        searchData={searchData}
                      />
                    )}
                  />
                  <Route exact path="/about" component={About} />
                  <Route exact path="/suggest-edit" component={SuggestEdit} />
                  <Route
                    path="/results"
                    component={(props) => (
                      <Results
                        {...props}
                        nodeData={nodeData}
                        searchData={searchData}
                        handleCardSave={this.handleCardSave}
                        handleSaveDelete={this.handleSaveDelete}
                        savedDataId={savedDataId}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/details"
                    component={(props) => (
                      <Details
                        {...props}
                        nodeData={nodeData}
                        handleCardSave={this.handleCardSave}
                        savedDataId={savedDataId}
                      />
                    )}
                  />

                  {/* for all other routes */}
                  <Route render={() => <p>Not Found</p>} />
                </Switch>
              </div>
              <Footer revisionDate={this.revisionDate} />
            </div>
          </Router>
        )}
      </React.Fragment>
    );
  }
}

export default App;
