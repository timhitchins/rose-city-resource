import React from "react";
import Loading from "./static_components/Loading";
import Home from "./Home/Home";
import About from "./static_components/About";
import SuggestEdit from "./static_components/SuggestEdit";
import Results from "./Results/Results";
import Details from "./Details";
import Nav from "./Nav";
import Footer from "./static_components/Footer";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { getRecords, addUserDistancesToRecords, getMetaInformation, getCategorySearchData, getMainSearchData, dateString, getDatatableVersion, } from "../utils/api";
import "../icons/iconsInit";

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      navDrawerVisible: false,
      records: null,
      searchData: null,
      savedDataId: [],
      metaInformation: {}
    };

    /* Attempt to convert an old RCR link to the new hash format */
    /* This is a convenience for the user to be able to use old links */
    const location = window.location;
    const url = location.href;
    if (!/#/.test(url)) {
      const newLocation = '/#' + location.pathname + location.search;
      window.location = newLocation;
    }
  }

  //state lisfted from
  //Cards to keep track of saved cards
  handleCardSave = (id) => {
    const { savedDataId } = this.state;
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
    const generalCategories = getCategorySearchData(records, "general_category")
    const parentCategories = getCategorySearchData(records, "parent_organization")
    const mainCategories = getMainSearchData(records);
    // return a new object with the search data
    return {
      general: generalCategories,
      main: mainCategories,
      parent: parentCategories,
    }
  }

  handleDrawer = () => this.setState((prev) => ({ navDrawerVisible: !prev.navDrawerVisible }))

  handleGetData = async () => {
    const records = await getRecords()
    const searchData = this.filterData(records)
    this.setState(() => ({ records, searchData }))
    return records
  };

  handleBrowserGeolocatorInput = async (records) => {
    const { records: distanceRecords, currentCoords, } = await addUserDistancesToRecords(records)
    if (currentCoords) this.setState(() => ({ records: distanceRecords }))
  }

  componentDidMount = async () => {
    const meta = await getMetaInformation()
    if (meta) this.revisionDate = dateString(meta.last_update)
    const records = await this.handleGetData()
    this.handleBrowserGeolocatorInput(records)
  };

  render() {
    const { records, searchData, savedDataId } = this.state

    return (
      <React.Fragment>
        {!records 
        ? <Loading />
        : (
          <Router>
            <div>
              <div className="main-content">
                {/* Alert users if they are viewing a preview version of the site  */}
                {getDatatableVersion() === "staging" ? <div><center>This site is using preview data. To view production data, please close the tab and reload the site</center></div> : <React.Fragment />}
                <Nav />
                <Switch>
                  <Route exact path="/" component={(props) => (
                    <Home
                      {...props}
                      records={records}
                      searchData={searchData} />)}
                  />
                  <Route exact path="/about" component={About} />
                  <Route exact path="/suggest-edit" component={SuggestEdit} />
                  <Route path="/results" component={(props) => (
                    <Results
                      {...props}
                      records={records}
                      searchData={searchData}
                      handleCardSave={this.handleCardSave}
                      handleSaveDelete={this.handleSaveDelete}
                      savedDataId={savedDataId} />)}
                  />
                  <Route exact path="/details" component={(props) => (
                    <Details
                      {...props}
                      records={records}
                      handleCardSave={this.handleCardSave}
                      savedDataId={savedDataId} />)}
                  />
                  <Route path="/admin" render={() => window.location.href = [window.location.protocol, "//",  window.location.host.replace(/\d+/, "5000"), "/admin/dashboard",].join("")} />
                  {/* for all other routes */}
                  <Route render={() => <p>Not Found</p>} />
                </Switch>
              </div>
              <Footer revisionDate={this.revisionDate} />
            </div>
          </Router>
        )}
      </React.Fragment>
    )
  }
}

export default App
