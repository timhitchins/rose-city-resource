import React from "react";
import Loading from "./static_components/Loading";
import Home from "./Home/Home";
import About from "./static_components/About";
import SuggestEdit from "./static_components/SuggestEdit";
import Results from "./Results/Results";
import Details from "./Details";
import Nav from "./Nav";
import Footer from "./static_components/Footer";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {
  getRecords,
  getRecordsLastUpdatedTimestamp,
  getCategorySearchData,
  getMainSearchData,
  dateString,
  getDatatableVersion
} from "../utils/api";
import "../icons/iconsInit";

class App extends React.Component {
  //data lives in the top component.
  state = {
    navDrawerVisible: false,
    records: null,
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
  filterData = (records) => {
    const generalCategories = getCategorySearchData(
      records,
      "general_category"
    );
    const parentCategories = getCategorySearchData(
      records,
      "parent_organization"
    );
    const mainCategories = getMainSearchData(records);
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
    const lastUpdated = await getRecordsLastUpdatedTimestamp();
    this.revisionDate = dateString(lastUpdated);

    //records
    const records = await getRecords();
    const searchData = this.filterData(records);
    this.setState(() => ({ records, searchData }));
  };

  render() {
    const { records, searchData, savedDataId } = this.state;
    return (
      <React.Fragment>
        {!records ? (
          <Loading />
        ) : (
            <Router>
              <div>
                <div className="main-content">
                  {getDatatableVersion() === 'staging'
                    ? <div><center>This site is using preview data. To view production data, please close the tab and reload the site</center></div>
                    : <React.Fragment />}
                  <Nav />
                  <Switch>
                    <Route
                      exact
                      path="/"
                      component={(props) => (
                        <Home
                          {...props}
                          records={records}
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
                          records={records}
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
                          records={records}
                          handleCardSave={this.handleCardSave}
                          savedDataId={savedDataId}
                        />
                      )}
                    />
                    <Route
                      exact path="/admin" render={() =>
                        window.location.href = [window.location.protocol, '//', window.location.host.replace(/\d+/, '5000'), '/admin/dashboard'].join('')
                      }
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
